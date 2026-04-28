import * as fs from "fs";
import * as path from "path";
import { CodeChunk } from "./types";
import { OllamaEmbedder } from "./embedder";
import { chunkFile, buildEmbeddingInput } from "./chunker";
import { scanDirectory } from "./file-scanner";
import { addToTable, deleteFromTable } from "./index";
import { buildManifest, loadManifest, saveManifest, diffManifests } from "./manifest";
import { loadConfig, saveConfig } from "./config";
import { extractDeps, loadDepGraph, saveDepGraph, removeFileFromGraph, mergeDepGraphs } from "./graph";
import { findProjectByDir, resolveProjectName, getProjectDir, ensureProjectDir } from "./global";

function resolveProject(dir: string): { projectName: string; indexDir: string } | null {
  // 优先从 registry 查找
  const entry = findProjectByDir(dir);
  if (entry) {
    return { projectName: entry.name, indexDir: entry.path };
  }

  // 回退到目录名
  const projectName = resolveProjectName(dir);
  const projectDir = getProjectDir(projectName);
  if (fs.existsSync(path.join(projectDir, "config.json"))) {
    return { projectName, indexDir: path.resolve(dir) };
  }

  return null;
}

export async function updateIndex(
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
  const configPath = path.join(outDir, "config.json");
  const config = loadConfig(configPath);
  if (!config) {
    if (!quiet) console.error("索引配置损坏。请重新运行 `codesense index`。");
    if (exitOnError) process.exit(1);
    throw new Error("索引配置损坏。请重新运行 `codesense index`。");
  }

  // 加载旧 manifest
  const oldManifest = loadManifest(path.join(outDir, "manifest.json"));

  // 扫描当前文件
  const files = scanDirectory(indexDir);
  const filePaths = files.map((f) => f.filePath);

  // 构建新 manifest
  const newManifest = await buildManifest(filePaths);

  // 对比差异
  const diff = diffManifests(oldManifest, newManifest);
  const totalChanges = diff.added.length + diff.modified.length + diff.deleted.length;

  if (totalChanges === 0) {
    if (!quiet) console.log("索引已是最新。");
    return;
  }

  if (!quiet) {
    console.log(`变更: +${diff.added.length} 新增, ~${diff.modified.length} 修改, -${diff.deleted.length} 删除`);
  }

  const dbPath = path.join(outDir, "index.lance");

  // 处理删除的文件
  const deletedRelative = diff.deleted.map((fp) => {
    const f = files.find((f) => f.filePath === fp);
    return f ? f.relativePath : path.relative(indexDir, fp);
  });
  if (diff.deleted.length > 0) {
    if (!quiet) process.stderr.write(`删除 ${diff.deleted.length} 个文件的索引...\n`);
    await deleteFromTable(dbPath, deletedRelative);

    let depGraph = loadDepGraph(path.join(outDir, "deps.json"));
    for (const fp of deletedRelative) {
      depGraph = removeFileFromGraph(depGraph, fp);
    }
    saveDepGraph(path.join(outDir, "deps.json"), depGraph);
  }

  // 处理修改和新增的文件
  const changedFiles = [...diff.added, ...diff.modified];
  if (changedFiles.length > 0) {
    const embedder = new OllamaEmbedder({ dimensions: config.dimensions });
    await embedder.ensureModel();

    let depGraph = loadDepGraph(path.join(outDir, "deps.json"));

    // 先删除修改文件的旧 chunk
    if (diff.modified.length > 0) {
      const modifiedRelative = diff.modified.map((fp) => {
        const f = files.find((f) => f.filePath === fp);
        return f ? f.relativePath : path.relative(indexDir, fp);
      });
      await deleteFromTable(dbPath, modifiedRelative);
      for (const fp of modifiedRelative) {
        depGraph = removeFileFromGraph(depGraph, fp);
      }
    }

    // 分块 + embed + 写入
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

      // 更新依赖图
      for (const fp of changedFiles) {
        const file = files.find((f) => f.filePath === fp);
        if (!file) continue;
        try {
          const content = fs.readFileSync(fp, "utf-8");
          const fileGraph = extractDeps(file.relativePath, content, file.language);
          depGraph = mergeDepGraphs([depGraph, fileGraph]);
        } catch {
          // 跳过
        }
      }
    }

    saveDepGraph(path.join(outDir, "deps.json"), depGraph);
  }

  // 更新 manifest 和 config
  saveManifest(path.join(outDir, "manifest.json"), newManifest);
  config.updatedAt = new Date().toISOString();
  saveConfig(configPath, config);

  if (!quiet) {
    console.log(`增量更新完成！变更 ${totalChanges} 个文件。`);
  }
}
