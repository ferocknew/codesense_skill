import * as fs from "fs";
import * as path from "path";
import { CodeChunk, DepGraph, IndexConfig } from "./types";
import { OllamaEmbedder } from "./embedder";
import { chunkFile, buildEmbeddingInput } from "./chunker";
import { scanDirectory } from "./file-scanner";
import { createTable } from "./index";
import { buildManifest, saveManifest } from "./manifest";
import { saveConfig, resolveDimensions, ensureProjectOutputDir } from "./config";
import { extractDeps, mergeDepGraphs, saveDepGraph } from "./graph";
import { resolveProjectName, registerProject } from "./global";

export async function buildIndex(
  dir: string,
  options: { strategy?: string; quiet?: boolean; exitOnError?: boolean } = {}
): Promise<void> {
  const strategy = options.strategy || "auto";
  const quiet = options.quiet || false;
  const exitOnError = options.exitOnError !== false;
  const absDir = path.resolve(dir);
  const projectName = resolveProjectName(absDir);

  // 1. 扫描文件
  const files = scanDirectory(absDir);
  if (files.length === 0) {
    console.error("未找到支持的代码文件。");
    if (exitOnError) process.exit(1);
    throw new Error("未找到支持的代码文件。");
  }
  if (!quiet) console.log(`找到 ${files.length} 个代码文件`);

  // 2. 分块
  const allChunks: CodeChunk[] = [];
  for (const f of files) {
    try {
      const content = fs.readFileSync(f.filePath, "utf-8");
      const chunks = chunkFile(f.relativePath, content, f.language);
      allChunks.push(...chunks);
    } catch (e: any) {
      if (!quiet) process.stderr.write(`  跳过 ${f.relativePath}: ${e.message}\n`);
    }
  }
  if (allChunks.length === 0) {
    console.error("分块后无有效代码片段。");
    if (exitOnError) process.exit(1);
    throw new Error("分块后无有效代码片段。");
  }
  if (!quiet) console.log(`生成 ${allChunks.length} 个代码块`);

  // 3. 确定维度策略
  const dimensions = resolveDimensions(allChunks.length, strategy);
  if (!quiet) console.log(`向量维度: ${dimensions} (策略: ${strategy}, chunks: ${allChunks.length})`);

  // 4. 检查 Ollama
  const embedder = new OllamaEmbedder({ dimensions });
  if (!quiet) process.stderr.write("检查 Ollama...\n");
  await embedder.ensureModel();

  // 5. 批量 embedding
  if (!quiet) process.stderr.write("生成向量...\n");
  const inputs = allChunks.map((c) => buildEmbeddingInput(c));
  const vectors = await embedder.embed(inputs);

  // 6. 构建索引记录
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

  // 7. 写入 LanceDB（全局目录）
  const outDir = ensureProjectOutputDir(projectName);
  const dbPath = path.join(outDir, "index.lance");
  if (!quiet) process.stderr.write("写入索引...\n");
  await createTable(dbPath, records);

  // 8. 保存依赖图
  if (!quiet) process.stderr.write("提取依赖图...\n");
  const graphs: DepGraph[] = [];
  for (const f of files) {
    try {
      const content = fs.readFileSync(f.filePath, "utf-8");
      const graph = extractDeps(f.relativePath, content, f.language);
      graphs.push(graph);
    } catch {
      // 跳过无法提取的文件
    }
  }
  const mergedGraph = mergeDepGraphs(graphs);
  saveDepGraph(projectName, mergedGraph);

  // 9. 保存 manifest
  const filePaths = files.map((f) => f.filePath);
  const manifest = await buildManifest(filePaths);
  saveManifest(projectName, manifest);

  // 10. 保存配置
  const actualDimensions = vectors[0]?.length || dimensions;
  const config = {
    model: embedder.getConfig().model,
    dimensions: actualDimensions,
    dimensionsFull: dimensions,
    strategy: strategy as IndexConfig["strategy"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveConfig(projectName, config);

  // 11. 注册项目
  registerProject(projectName, absDir);

  if (!quiet) {
    console.log(`\n索引构建完成！`);
    console.log(`  项目:     ${projectName}`);
    console.log(`  文件数:   ${files.length}`);
    console.log(`  代码块:   ${allChunks.length}`);
    console.log(`  维度:     ${dimensions}`);
    console.log(`  依赖节点: ${Object.keys(mergedGraph.nodes).length}`);
    console.log(`  依赖边:   ${mergedGraph.edges.length}`);
    console.log(`  输出目录: ${outDir}`);
  }
}
