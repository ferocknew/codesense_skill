import * as fs from "fs";
import * as path from "path";
import { IndexConfig, OUTPUT_DIR } from "./types";

export function resolveDimensions(chunkCount: number, strategy: string): number {
  switch (strategy) {
    case "quality":
      return 2048;
    case "performance":
      return 1024;
    case "auto":
    default:
      return chunkCount < 5000 ? 2048 : 1024;
  }
}

export function loadConfig(configPath: string): IndexConfig | null {
  if (!fs.existsSync(configPath)) return null;
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

export function saveConfig(configPath: string, config: IndexConfig): void {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

export function getOutputDir(baseDir: string = "."): string {
  return path.resolve(baseDir, OUTPUT_DIR);
}

export function ensureOutputDir(baseDir: string = "."): string {
  const outDir = getOutputDir(baseDir);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  return outDir;
}

export async function showStatus(): Promise<void> {
  const outDir = getOutputDir();
  const configPath = path.join(outDir, "config.json");
  const config = loadConfig(configPath);

  if (!config) {
    console.log("未找到索引。运行 `codesense index <目录>` 建立索引。");
    return;
  }

  console.log("codesense 索引状态:");
  console.log(`  模型:     ${config.model}`);
  console.log(`  维度:     ${config.dimensions}`);
  console.log(`  策略:     ${config.strategy}`);
  console.log(`  创建时间: ${config.createdAt}`);
  console.log(`  更新时间: ${config.updatedAt}`);

  // 尝试获取 chunk 数量
  const manifestPath = path.join(outDir, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    console.log(`  文件数:   ${Object.keys(manifest).length}`);
  }

  const depsPath = path.join(outDir, "deps.json");
  if (fs.existsSync(depsPath)) {
    const deps = JSON.parse(fs.readFileSync(depsPath, "utf-8"));
    const nodes = Object.keys(deps.nodes || {}).length;
    const edges = (deps.edges || []).length;
    console.log(`  依赖节点: ${nodes}`);
    console.log(`  依赖边:   ${edges}`);
  }
}
