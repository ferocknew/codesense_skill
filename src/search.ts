import * as fs from "fs";
import * as path from "path";
import { SearchResult, DEFAULT_TOP_K, DEFAULT_THRESHOLD, OUTPUT_DIR } from "./types";
import { OllamaEmbedder } from "./embedder";
import { queryTable } from "./index";
import { loadConfig, getOutputDir } from "./config";

export interface SearchOptions {
  topK?: number;
  type?: string;
  lang?: string;
  dir?: string;
  threshold?: number;
  baseDir?: string;
}

// 向上查找包含 codesense-out 的目录
function findIndexDir(startDir: string): string | null {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, OUTPUT_DIR, "config.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export async function search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  const topK = options.topK || DEFAULT_TOP_K;
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;

  const indexDir = findIndexDir(options.baseDir || ".");
  if (!indexDir) {
    console.error("未找到索引。运行 `codesense index <目录>` 建立索引。");
    process.exit(1);
  }
  const outDir = getOutputDir(indexDir);

  // 加载配置获取维度
  const config = loadConfig(path.join(outDir, "config.json"));
  if (!config) {
    console.error("未找到索引。运行 `codesense index <目录>` 建立索引。");
    process.exit(1);
  }

  // 生成查询向量
  const embedder = new OllamaEmbedder({ dimensions: config.dimensions });
  const queryVector = await embedder.embedQuery(query);

  // 构建 where 条件
  const conditions: string[] = [];
  if (options.type) {
    conditions.push(`"chunkType" = '${options.type}'`);
  }
  if (options.lang) {
    conditions.push(`language = '${options.lang}'`);
  }
  if (options.dir) {
    conditions.push(`"filePath" LIKE '${options.dir}%'`);
  }
  const where = conditions.length > 0 ? conditions.join(" AND ") : undefined;

  // 查询
  const dbPath = path.join(outDir, "index.lance");
  const rawResults = await queryTable(dbPath, queryVector, { limit: topK, where });

  // 格式化结果（L2 距离 → 相似度分数: 1/(1+distance)）
  const results: SearchResult[] = rawResults
    .map((r: any) => ({
      score: r._distance !== undefined ? 1 / (1 + r._distance) : 0,
      symbol: r.symbol || "",
      type: r.chunkType || "",
      file: r.filePath || "",
      lineStart: r.lineStart || 0,
      lineEnd: r.lineEnd || 0,
      text: r.text || "",
      context: r.context || "",
    }))
    .filter((r: SearchResult) => r.score >= threshold);

  return results;
}
