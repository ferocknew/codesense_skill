import { IndexConfig } from "./types";
import { getProjectDir, ensureProjectDir, findProjectByDir, listProjects, getGlobalDir } from "./global";
import { dbLoadConfig, dbSaveConfig, dbGetManifestCount, dbGetDepStats } from "./database";

export function resolveDimensions(_chunkCount: number, strategy: string): number {
  switch (strategy) {
    case "quality":
      return 1024;
    case "performance":
      return 1024;
    case "auto":
    default:
      return 1024;
  }
}

export function loadConfig(projectName: string): IndexConfig | null {
  return dbLoadConfig(projectName);
}

export function saveConfig(projectName: string, config: IndexConfig): void {
  dbSaveConfig(projectName, config);
}

export function getProjectOutputDir(projectName: string): string {
  return getProjectDir(projectName);
}

export function ensureProjectOutputDir(projectName: string): string {
  return ensureProjectDir(projectName);
}

export async function showStatus(projectName?: string): Promise<void> {
  if (projectName) {
    showProjectStatus(projectName);
    return;
  }

  // 尝试根据 cwd 找到项目
  const entry = findProjectByDir(".");
  if (entry) {
    showProjectStatus(entry.name);
    return;
  }

  // 没有指定项目，列出所有
  const projects = listProjects();
  if (projects.length === 0) {
    console.log("没有已注册的项目。运行 `codesense init` 初始化。");
    return;
  }

  console.log("codesense 全局状态:");
  console.log(`  目录: ${getGlobalDir()}`);
  console.log(`  已注册项目: ${projects.length}\n`);
  for (const p of projects) {
    console.log(`  ${p.name}`);
    console.log(`    路径: ${p.path}`);
    const config = loadConfig(p.name);
    if (config) {
      console.log(`    模型: ${config.model}  维度: ${config.dimensions}  更新: ${config.updatedAt}`);
    } else {
      console.log(`    (未建索引)`);
    }
  }
}

function showProjectStatus(projectName: string): void {
  const config = loadConfig(projectName);

  if (!config) {
    console.log(`项目 "${projectName}" 未建索引。运行 \`codesense index <目录>\` 建立索引。`);
    return;
  }

  console.log(`codesense 索引状态 [${projectName}]:`);
  console.log(`  模型:     ${config.model}`);
  console.log(`  维度:     ${config.dimensions}`);
  console.log(`  策略:     ${config.strategy}`);
  console.log(`  创建时间: ${config.createdAt}`);
  console.log(`  更新时间: ${config.updatedAt}`);

  const fileCount = dbGetManifestCount(projectName);
  console.log(`  文件数:   ${fileCount}`);

  const { nodeCount, edgeCount } = dbGetDepStats(projectName);
  console.log(`  依赖节点: ${nodeCount}`);
  console.log(`  依赖边:   ${edgeCount}`);
}
