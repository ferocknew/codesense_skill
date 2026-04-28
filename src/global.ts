import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export interface RegistryEntry {
  name: string;
  path: string;
  createdAt: string;
}

export type Registry = Record<string, RegistryEntry>;

export interface GlobalConfig {
  model: string;
  ollamaUrl: string;
}

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  model: "qwen3-embedding:0.6b",
  ollamaUrl: "http://localhost:11434",
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
  const filePath = path.join(getGlobalDir(), "registry.json");
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function saveRegistry(registry: Registry): void {
  const dir = ensureGlobalDir();
  fs.writeFileSync(
    path.join(dir, "registry.json"),
    JSON.stringify(registry, null, 2),
    "utf-8"
  );
}

export function loadGlobalConfig(): GlobalConfig {
  const filePath = path.join(getGlobalDir(), "global-config.json");
  if (!fs.existsSync(filePath)) return { ...DEFAULT_GLOBAL_CONFIG };
  return { ...DEFAULT_GLOBAL_CONFIG, ...JSON.parse(fs.readFileSync(filePath, "utf-8")) };
}

export function saveGlobalConfig(config: GlobalConfig): void {
  const dir = ensureGlobalDir();
  fs.writeFileSync(
    path.join(dir, "global-config.json"),
    JSON.stringify(config, null, 2),
    "utf-8"
  );
}

export function resolveProjectName(sourceDir: string): string {
  return path.basename(path.resolve(sourceDir));
}

export function registerProject(name: string, sourcePath: string): void {
  const registry = loadRegistry();
  if (!registry[name]) {
    registry[name] = {
      name,
      path: path.resolve(sourcePath),
      createdAt: new Date().toISOString(),
    };
    saveRegistry(registry);
  }
}

export function unregisterProject(name: string): void {
  const registry = loadRegistry();
  if (registry[name]) {
    delete registry[name];
    saveRegistry(registry);
  }
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
  const registry = loadRegistry();
  const absPath = path.resolve(sourceDir);
  for (const entry of Object.values(registry)) {
    if (entry.path === absPath) return entry;
  }
  return null;
}

export function listProjects(): RegistryEntry[] {
  const registry = loadRegistry();
  return Object.values(registry);
}
