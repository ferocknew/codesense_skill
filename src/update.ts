import * as fs from "fs";
import * as path from "path";
import { CodeChunk } from "./types";
import { OllamaEmbedder } from "./embedder";
import { chunkFile, buildEmbeddingInput } from "./chunker";
import { scanDirectory } from "./file-scanner";
import { addToTable, deleteFromTable } from "./index";
import { buildManifest, saveManifest, diffManifests } from "./manifest";
import { loadConfig, saveConfig } from "./config";
import { extractDeps, removeFileFromGraph } from "./graph";
import { findProjectByDir, resolveProjectName, ensureProjectDir } from "./global";
import { dbSaveManifestIncremental } from "./database";
import { EXT_TO_LANGUAGE } from "./types";

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

// 根据 --files 参数直接处理指定文件（跳过全目录扫描）
async function updateByFiles(
  projectName: string,
  indexDir: string,
  changedFiles: string[],
  options: { quiet?: boolean; exitOnError?: boolean } = {}
): Promise<void> {
  const quiet = options.quiet || false;
  const exitOnError = options.exitOnError !== false;
  const outDir = ensureProjectDir(projectName);
  const config = loadConfig(projectName);
  if (!config) {
    if (!quiet) console.error("索引配置损坏。请重新运行 `codesense index`。");
    if (exitOnError) process.exit(1);
    throw new Error("索引配置损坏。");
  }

  if (!quiet) console.log(`处理 ${changedFiles.length} 个文件...`);

  const dbPath = path.join(outDir, "index.lance");
  const embedder = new OllamaEmbedder({ dimensions: config.dimensions });
  await embedder.ensureModel();

  const toDelete: string[] = [];
  const toUpsert: Record<string, string> = {};
  const processable: { absPath: string; relPath: string; language: string }[] = [];

  for (const file of changedFiles) {
    const absPath = path.resolve(indexDir, file);
    const ext = path.extname(file);

    if (!fs.existsSync(absPath)) {
      // 文件被删除
      toDelete.push(file);
    } else if (EXT_TO_LANGUAGE[ext]) {
      // 文件存在且是支持的类型
      toUpsert[absPath] = "committed"; // 占位，后面会更新
      processable.push({ absPath, relPath: file, language: EXT_TO_LANGUAGE[ext] });
    }
  }

  // 删除已移除文件的索引
  if (toDelete.length > 0) {
    if (!quiet) process.stderr.write(`删除 ${toDelete.length} 个文件...\n`);
    await deleteFromTable(dbPath, toDelete);
    for (const fp of toDelete) {
      removeFileFromGraph(projectName, fp);
    }
  }

  // 删除修改文件的旧 chunk，再重新处理
  if (processable.length > 0) {
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
      } catch {
        // 跳过
      }
    }
  }

  // 增量更新 manifest（只更新本次涉及的文件）
  const manifestUpsert: Record<string, string> = {};
  for (const { absPath } of processable) {
    try {
      const hash = require("crypto").createHash("sha256").update(fs.readFileSync(absPath)).digest("hex");
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

// 全量 manifest diff 模式（原有逻辑）
async function updateByManifest(
  dir: string,
  options: { quiet?: boolean; exitOnError?: boolean } = {}
): Promise<void> {
  const quiet = options.quiet || false;
  const exitOnError = options.exitOnError !== false;
  const resolved = resolveProject(dir);
  if (!resolved) {
    if (!quiet) console.error("未找到索引。运行 `codesense index <目录>` 建立索引。");
    if (exitOnError) process.exit(1);
    throw new Error("未找到索引。运行 `codesense index <目录>` 建立索引。");
  }

  const { projectName, indexDir } = resolved;
  const outDir = ensureProjectDir(projectName);
  const config = loadConfig(projectName);
  if (!config) {
    if (!quiet) console.error("索引配置损坏。请重新运行 `codesense index`。");
    if (exitOnError) process.exit(1);
    throw new Error("索引配置损坏。请重新运行 `codesense index`。");
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

  const dbPath = path.join(outDir, "index.lance");

  // 处理删除
  const deletedRelative = diff.deleted.map((fp) => {
    const f = files.find((f) => f.filePath === fp);
    return f ? f.relativePath : path.relative(indexDir, fp);
  });
  if (diff.deleted.length > 0) {
    if (!quiet) process.stderr.write(`删除 ${diff.deleted.length} 个文件的索引...\n`);
    await deleteFromTable(dbPath, deletedRelative);
    for (const fp of deletedRelative) {
      removeFileFromGraph(projectName, fp);
    }
  }

  // 处理修改和新增
  const changedFiles = [...diff.added, ...diff.modified];
  if (changedFiles.length > 0) {
    const embedder = new OllamaEmbedder({ dimensions: config.dimensions });
    await embedder.ensureModel();

    if (diff.modified.length > 0) {
      const modifiedRelative = diff.modified.map((fp) => {
        const f = files.find((f) => f.filePath === fp);
        return f ? f.relativePath : path.relative(indexDir, fp);
      });
      await deleteFromTable(dbPath, modifiedRelative);
      for (const fp of modifiedRelative) {
        removeFileFromGraph(projectName, fp);
      }
    }

    const allChunks: CodeChunk[] = [];
    for (const fp of changedFiles) {
      const file = files.find((f) => f.filePath === fp);
      if (!file) continue;
      try {
        const content = fs.readFileSync(fp, "utf-8");
        const chunks = chunkFile(file.relativePath, content, file.language);
        allChunks.push(...chunks);
      } catch (e: any) {
        if (!quiet) process.stderr.write(`  跳过 ${file.relativePath}: ${e.message}\n`);
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

      for (const fp of changedFiles) {
        const file = files.find((f) => f.filePath === fp);
        if (!file) continue;
        try {
          const content = fs.readFileSync(fp, "utf-8");
          const fileGraph = extractDeps(file.relativePath, content, file.language);
          const { dbMergeDepGraph } = require("./database");
          dbMergeDepGraph(projectName, fileGraph);
        } catch {}
      }
    }
  }

  saveManifest(projectName, newManifest);
  config.updatedAt = new Date().toISOString();
  saveConfig(projectName, config);

  if (!quiet) {
    console.log(`增量更新完成！变更 ${totalChanges} 个文件。`);
  }
}

export async function updateIndex(
  dir: string,
  options: { quiet?: boolean; exitOnError?: boolean; files?: string[] } = {}
): Promise<void> {
  // --files 模式：直接处理指定文件
  if (options.files && options.files.length > 0) {
    const resolved = resolveProject(dir);
    if (!resolved) {
      if (!options.quiet) console.error("未找到索引。运行 `codesense index <目录>` 建立索引。");
      if (options.exitOnError !== false) process.exit(1);
      throw new Error("未找到索引。");
    }
    await updateByFiles(resolved.projectName, resolved.indexDir, options.files, options);
    return;
  }

  // 默认模式：全量 manifest diff
  await updateByManifest(dir, options);
}
