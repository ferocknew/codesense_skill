import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  dbLoadRegistry,
  dbSaveRegistry,
  dbRegisterProject,
  dbUnregisterProject,
  dbFindProjectByDir,
  dbListProjects,
  dbLoadGlobalConfig,
  dbSaveGlobalConfig,
} from "./database";

export interface RegistryEntry {
  name: string;
  path: string;
  createdAt: string;
}

export type Registry = Record<string, RegistryEntry>;

export interface GlobalConfig {
  model: string;
  ollamaUrl: string;
  batchSize: number;
  batchDelay: number;
}

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  model: "qwen3-embedding:0.6b",
  ollamaUrl: "http://localhost:11434",
  batchSize: 32,
  batchDelay: 0,
};

export function getGlobalDir(): string {
  return path.join(os.homedir(), ".codesense");
}

export function ensureGlobalDir(): string {
  const dir = getGlobalDir();
  const subdirs = ["projects", "cache"];
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  for (const sub of subdirs) {
    const subPath = path.join(dir, sub);
    if (!fs.existsSync(subPath)) {
      fs.mkdirSync(subPath, { recursive: true });
    }
  }
  return dir;
}

export function loadRegistry(): Registry {
  return dbLoadRegistry();
}

export function saveRegistry(registry: Registry): void {
  dbSaveRegistry(registry);
}

export function loadGlobalConfig(): GlobalConfig {
  const config = dbLoadGlobalConfig();
  return { ...DEFAULT_GLOBAL_CONFIG, ...config };
}

export function saveGlobalConfig(config: GlobalConfig): void {
  dbSaveGlobalConfig(config);
}

export function resolveProjectName(sourceDir: string): string {
  return path.basename(path.resolve(sourceDir));
}

export function registerProject(name: string, sourcePath: string): void {
  dbRegisterProject(name, sourcePath);
}

export function unregisterProject(name: string): void {
  dbUnregisterProject(name);
}

export function getProjectDir(name: string): string {
  return path.join(getGlobalDir(), "projects", name);
}

export function ensureProjectDir(name: string): string {
  const dir = getProjectDir(name);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function findProjectByDir(sourceDir: string): RegistryEntry | null {
  return dbFindProjectByDir(sourceDir);
}

export function listProjects(): RegistryEntry[] {
  return dbListProjects();
}
