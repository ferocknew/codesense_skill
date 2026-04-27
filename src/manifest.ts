import * as fs from "fs";
import * as crypto from "crypto";
import { Manifest } from "./types";

export function computeFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

export async function buildManifest(filePaths: string[]): Promise<Manifest> {
  const manifest: Manifest = {};
  for (const fp of filePaths) {
    try {
      manifest[fp] = computeFileHash(fp);
    } catch {
      // 文件可能已被删除
    }
  }
  return manifest;
}

export function loadManifest(manifestPath: string): Manifest {
  if (!fs.existsSync(manifestPath)) return {};
  return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
}

export function saveManifest(manifestPath: string, manifest: Manifest): void {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
}

export function diffManifests(
  oldManifest: Manifest,
  newManifest: Manifest
): { added: string[]; modified: string[]; deleted: string[] } {
  const added: string[] = [];
  const modified: string[] = [];
  const deleted: string[] = [];

  for (const [fp, hash] of Object.entries(newManifest)) {
    if (!(fp in oldManifest)) {
      added.push(fp);
    } else if (oldManifest[fp] !== hash) {
      modified.push(fp);
    }
  }

  for (const fp of Object.keys(oldManifest)) {
    if (!(fp in newManifest)) {
      deleted.push(fp);
    }
  }

  return { added, modified, deleted };
}
