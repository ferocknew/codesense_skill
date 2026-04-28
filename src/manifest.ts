import * as fs from "fs";
import * as crypto from "crypto";
import { Manifest } from "./types";
import { dbLoadManifest, dbSaveManifest, dbDiffManifests } from "./database";

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

export function loadManifest(projectName: string): Manifest {
  return dbLoadManifest(projectName);
}

export function saveManifest(projectName: string, manifest: Manifest): void {
  dbSaveManifest(projectName, manifest);
}

export function diffManifests(
  projectName: string,
  newManifest: Manifest
): { added: string[]; modified: string[]; deleted: string[] } {
  return dbDiffManifests(projectName, newManifest);
}
