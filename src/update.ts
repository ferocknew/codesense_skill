import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { execSync } from "child_process";
import { CodeChunk, EXT_TO_LANGUAGE } from "./types";
import { OllamaEmbedder } from "./embedder";
import { chunkFile, buildEmbeddingInput } from "./chunker";
import { scanDirectory } from "./file-scanner";
import { addToTable, deleteFromTable } from "./index";
import { buildManifest, saveManifest, diffManifests } from "./manifest";
import { loadConfig, saveConfig } from "./config";
import { extractDeps, removeFileFromGraph } from "./graph";
import { findProjectByDir, resolveProjectName, ensureProjectDir } from "./global";
import { dbSaveManifestIncremental } from "./database";

function resolveProject(dir: string): { projectName: string; indexDir: string } | null {
  const entry = findProjectByDir(dir);
  if (entry) {
    return { projectName: entry.name, indexDir: entry.path };
  }

  const projectName = resolveProjectName(dir);
  const config = loadConfig(projectName);
  if (config) {
    return { projectName, indexDir: path.resolve(dir) };
  }

  return null;
}

// 尝试用 git 获取变更文件列表
function getGitChangedFiles(indexDir: string): string[] | null {
  try {
    const output = execSync("git diff-tree --no-commit-id --name-only -r HEAD", {
      cwd: indexDir,
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    if (!output) return [];
    return output.split("\n").filter(Boolean);
  } catch {
    // 不在 git 仓库或没有 commits
    return null;
  }
}

// 按文件列表处理（git diff 模式）
async function updateByFiles(
  projectName: string,
  indexDir: string,
  changedFiles: string[],
  options: { quiet?: boolean; exitOnError?: boolean } = {}
): Promise<void> {
  const quiet = options.quiet || false;
  const outDir = ensureProjectDir(projectName);
  const config = loadConfig(projectName);
  if (!config) {
    if (!quiet) console.error("索引配置损坏。请重新运行 `codesense index`。");
    if (options.exitOnError !== false) process.exit(1);
    throw new Error("索引配置损坏。");
  }

  if (!quiet) console.log(`处理 ${changedFiles.length} 个变更文件...`);

  const dbPath = path.join(outDir, "index.lance");
  const embedder = new OllamaEmbedder({ dimensions: config.dimensions });
  await embedder.ensureModel();

  const toDelete: string[] = [];
  const processable: { absPath: string; relPath: string; language: string }[] = [];

  for (const file of changedFiles) {
    const absPath = path.resolve(indexDir, file);
    const ext = path.extname(file);

    if (!fs.existsSync(absPath)) {
      toDelete.push(file);
    } else if (EXT_TO_LANGUAGE[ext]) {
      processable.push({ absPath, relPath: file, language: EXT_TO_LANGUAGE[ext] });
    }
  }

  // 删除已移除文件
  if (toDelete.length > 0) {
    if (!quiet) process.stderr.write(`删除 ${toDelete.length} 个文件...\n`);
    await deleteFromTable(dbPath, toDelete);
    for (const fp of toDelete) {
      removeFileFromGraph(projectName, fp);
    }
  }

  // 处理变更文件
  if (processable.length > 0) {
    // 删旧 chunk
    const relPaths = processable.map((f) => f.relPath);
    await deleteFromTable(dbPath, relPaths);
    for (const fp of relPaths) {
      removeFileFromGraph(projectName, fp);
    }

    // 分块 + embed
    const allChunks: CodeChunk[] = [];
    for (const { absPath, relPath, language } of processable) {
      try {
        const content = fs.readFileSync(absPath, "utf-8");
        const chunks = chunkFile(relPath, content, language);
        allChunks.push(...chunks);
      } catch (e: any) {
        if (!quiet) process.stderr.write(`  跳过 ${relPath}: ${e.message}\n`);
      }
    }

    if (allChunks.length > 0) {
      if (!quiet) process.stderr.write(`处理 ${allChunks.length} 个代码块...\n`);
      const inputs = allChunks.map((c) => buildEmbeddingInput(c));
      const vectors = await embedder.embed(inputs);

      const records = allChunks.map((chunk, i) => ({
        vector: vectors[i],
        text: chunk.text,
        symbol: chunk.symbol,
        chunkType: chunk.chunkType,
        filePath: chunk.filePath,
        lineStart: chunk.lineStart,
        lineEnd: chunk.lineEnd,
        language: chunk.language,
        textHash: chunk.textHash,
        context: chunk.context,
      }));

      await addToTable(dbPath, records);
    }

    // 更新依赖图
    for (const { absPath, relPath, language } of processable) {
      try {
        const content = fs.readFileSync(absPath, "utf-8");
        const fileGraph = extractDeps(relPath, content, language);
        const { dbMergeDepGraph } = require("./database");
        dbMergeDepGraph(projectName, fileGraph);
      } catch {}
    }
  }

  // 增量更新 manifest
  const manifestUpsert: Record<string, string> = {};
  for (const { absPath } of processable) {
    try {
      const hash = crypto.createHash("sha256").update(fs.readFileSync(absPath)).digest("hex");
      manifestUpsert[absPath] = hash;
    } catch {}
  }
  if (Object.keys(manifestUpsert).length > 0 || toDelete.length > 0) {
    dbSaveManifestIncremental(projectName, manifestUpsert, toDelete);
  }

  config.updatedAt = new Date().toISOString();
  saveConfig(projectName, config);

  if (!quiet) {
    console.log(`更新完成！处理 ${changedFiles.length} 个文件。`);
  }
}

// 全量 manifest diff（非 git 项目的回退方案）
async function updateByManifest(
  dir: string,
  options: { quiet?: boolean; exitOnError?: boolean } = {}
): Promise<void> {
  const quiet = options.quiet || false;
  const resolved = resolveProject(dir);
  if (!resolved) {
    if (!quiet) console.error("未找到索引。运行 `codesense index <目录>` 建立索引。");
    if (options.exitOnError !== false) process.exit(1);
    throw new Error("未找到索引。");
  }

  const { projectName, indexDir } = resolved;
  const config = loadConfig(projectName);
  if (!config) {
    if (!quiet) console.error("索引配置损坏。请重新运行 `codesense index`。");
    if (options.exitOnError !== false) process.exit(1);
    throw new Error("索引配置损坏。");
  }

  const files = scanDirectory(indexDir);
  const filePaths = files.map((f) => f.filePath);
  const newManifest = await buildManifest(filePaths);
  const diff = diffManifests(projectName, newManifest);
  const totalChanges = diff.added.length + diff.modified.length + diff.deleted.length;

  if (totalChanges === 0) {
    if (!quiet) console.log("索引已是最新。");
    return;
  }

  if (!quiet) {
    console.log(`变更: +${diff.added.length} 新增, ~${diff.modified.length} 修改, -${diff.deleted.length} 删除`);
  }

  // 将 manifest diff 结果转为文件列表，走 updateByFiles
  const changedFiles = [
    ...diff.deleted,
    ...diff.added,
    ...diff.modified.map((fp) => {
      const f = files.find((f) => f.filePath === fp);
      return f ? f.relativePath : path.relative(indexDir, fp);
    }),
  ];

  // 先全量更新 manifest
  saveManifest(projectName, newManifest);

  await updateByFiles(projectName, indexDir, changedFiles, { ...options, exitOnError: false });
}

export async function updateIndex(
  dir: string,
  options: { quiet?: boolean; exitOnError?: boolean } = {}
): Promise<void> {
  const quiet = options.quiet || false;
  const resolved = resolveProject(dir);
  if (!resolved) {
    if (!quiet) console.error("未找到索引。运行 `codesense index <目录>` 建立索引。");
    if (options.exitOnError !== false) process.exit(1);
    throw new Error("未找到索引。");
  }

  const { projectName, indexDir } = resolved;

  // 优先用 git diff 获取变更文件
  const gitFiles = getGitChangedFiles(indexDir);
  if (gitFiles !== null) {
    if (gitFiles.length === 0) {
      if (!quiet) console.log("无变更文件。");
      return;
    }
    await updateByFiles(projectName, indexDir, gitFiles, options);
    return;
  }

  // 回退：全量 manifest diff
  await updateByManifest(dir, options);
}
