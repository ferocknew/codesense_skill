import * as fs from "fs";
import * as path from "path";
import { SearchResult, DEFAULT_TOP_K, DEFAULT_THRESHOLD, DEFAULT_EXCLUDE_FILES } from "./types";
import { OllamaEmbedder } from "./embedder";
import { queryTable } from "./index";
import { loadConfig } from "./config";
import { findProjectByDir, getProjectDir, resolveProjectName, listProjects } from "./global";
import { matchExcludePattern } from "./file-scanner";

export interface SearchOptions {
  topK?: number;
  type?: string;
  lang?: string;
  dir?: string;
  threshold?: number;
  project?: string;
}

function resolveProjectNameOpt(projectOpt?: string): string | null {
  if (projectOpt && projectOpt !== "all") {
    return projectOpt;
  }
  const entry = findProjectByDir(".");
  if (entry) return entry.name;
  return resolveProjectName(".");
}

async function searchSingleProject(
  query: string,
  projectName: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  const topK = options.topK || DEFAULT_TOP_K;
  const threshold = options.threshold ?? DEFAULT_THRESHOLD;
  const outDir = getProjectDir(projectName);

  const config = loadConfig(projectName);
  if (!config) return [];

  const excludeFiles = config.excludeFiles ?? DEFAULT_EXCLUDE_FILES;

  const embedder = new OllamaEmbedder({ dimensions: config.dimensions });
  const queryVector = await embedder.embedQuery(query);

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

  const dbPath = path.join(outDir, "index.lance");
  if (!fs.existsSync(dbPath)) return [];

  const rawResults = await queryTable(dbPath, queryVector, { limit: topK, where });

  return rawResults
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
    .filter((r: SearchResult) => r.score >= threshold)
    .filter((r: SearchResult) => !matchExcludePattern(r.file, excludeFiles));
}

export async function search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
  // 全项目搜索
  if (options.project === "all") {
    const projects = listProjects();
    const allResults: SearchResult[] = [];
    for (const p of projects) {
      const results = await searchSingleProject(query, p.name, options);
      allResults.push(...results);
    }
    const topK = options.topK || DEFAULT_TOP_K;
    return allResults.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  // 单项目搜索
  const projectName = resolveProjectNameOpt(options.project);
  if (!projectName) {
    console.error("未找到项目。运行 `codesense init` 初始化。");
    process.exit(1);
  }

  const outDir = getProjectDir(projectName);
  if (!fs.existsSync(outDir)) {
    console.error(`项目 "${projectName}" 未建索引。运行 \`codesense index <目录>\` 建立索引。`);
    process.exit(1);
  }

  return searchSingleProject(query, projectName, options);
}
