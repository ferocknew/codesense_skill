import * as fs from "fs";
import * as path from "path";
import { EXCLUDE_DIRS, EXT_TO_LANGUAGE, TREE_SITTER_LANGUAGES } from "./types";
import { loadProjectConfig } from "./install";

export interface ScannedFile {
  filePath: string;
  language: string;
  relativePath: string;
}

export function scanDirectory(dir: string, rootDir?: string): ScannedFile[] {
  const root = rootDir || dir;
  const gitignorePatterns = loadGitignore(root);
  const projectConfig = loadProjectConfig(root);
  const excludeFiles = projectConfig?.excludeFiles ?? [];
  const excludeDirs = projectConfig?.excludeDirs ?? [];
  const results: ScannedFile[] = [];

  function walk(currentDir: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".env") continue;

      const fullPath = path.join(currentDir, entry.name);
      const relPath = path.relative(root, fullPath);

      if (entry.isDirectory()) {
        if (EXCLUDE_DIRS.has(entry.name)) continue;
        if (excludeDirs.some((d) => entry.name === d || relPath === d || relPath.startsWith(d + "/"))) continue;
        if (isIgnored(relPath, gitignorePatterns)) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        if (isIgnored(relPath, gitignorePatterns)) continue;
        if (matchExcludePattern(relPath, excludeFiles)) continue;
        const ext = path.extname(entry.name).toLowerCase();
        const language = EXT_TO_LANGUAGE[ext];
        if (!language) continue;

        results.push({
          filePath: fullPath,
          language,
          relativePath: relPath,
        });
      }
    }
  }

  walk(dir);
  return results;
}

function loadGitignore(rootDir: string): string[] {
  const giPath = path.join(rootDir, ".gitignore");
  if (!fs.existsSync(giPath)) return [];
  try {
    const content = fs.readFileSync(giPath, "utf-8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  } catch {
    return [];
  }
}

function isIgnored(relPath: string, patterns: string[]): boolean {
  for (const pat of patterns) {
    if (matchGitignorePattern(relPath, pat)) return true;
  }
  return false;
}

function matchGitignorePattern(relPath: string, pattern: string): boolean {
  const p = pattern;
  const isDir = p.endsWith("/");
  const normalized = isDir ? p.slice(0, -1) : p;

  // * 通配符
  if (p.includes("*")) {
    const regex = globToRegex(normalized);
    return regex.test(relPath) || regex.test(relPath.split("/").pop() || "");
  }

  // 以 / 开头 = 相对于仓库根
  if (p.startsWith("/")) {
    const base = p.slice(1);
    return relPath === base || relPath.startsWith(base + "/");
  }

  // 纯文件名 = 匹配任意路径下的该文件
  if (!p.includes("/")) {
    return relPath === p || relPath.endsWith("/" + p);
  }

  return relPath.startsWith(p);
}

export function matchExcludePattern(relPath: string, patterns: string[]): boolean {
  for (const pat of patterns) {
    if (pat.includes("*")) {
      const regex = globToRegex(pat);
      if (regex.test(relPath) || regex.test(relPath.split("/").pop() || "")) return true;
    } else {
      if (relPath === pat || relPath.endsWith("/" + pat)) return true;
    }
  }
  return false;
}

function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp("^" + escaped + "$");
}

export function getLanguage(ext: string): string | undefined {
  return EXT_TO_LANGUAGE[ext.toLowerCase()];
}

export function hasTreeSitterSupport(language: string): boolean {
  return TREE_SITTER_LANGUAGES.has(language);
}
