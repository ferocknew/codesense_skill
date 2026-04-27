import * as fs from "fs";
import * as path from "path";
import { EXCLUDE_DIRS, EXT_TO_LANGUAGE, TREE_SITTER_LANGUAGES } from "./types";

export interface ScannedFile {
  filePath: string;
  language: string;
  relativePath: string;
}

export function scanDirectory(dir: string, rootDir?: string): ScannedFile[] {
  const root = rootDir || dir;
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

      if (entry.isDirectory()) {
        if (EXCLUDE_DIRS.has(entry.name)) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const language = EXT_TO_LANGUAGE[ext];
        if (!language) continue;

        results.push({
          filePath: fullPath,
          language,
          relativePath: path.relative(root, fullPath),
        });
      }
    }
  }

  walk(dir);
  return results;
}

export function getLanguage(ext: string): string | undefined {
  return EXT_TO_LANGUAGE[ext.toLowerCase()];
}

export function hasTreeSitterSupport(language: string): boolean {
  return TREE_SITTER_LANGUAGES.has(language);
}
