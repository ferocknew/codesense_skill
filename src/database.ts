import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { IndexConfig, Manifest, DepGraph } from "./types";

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

let _db: Database.Database | null = null;

// --- 连接管理 ---

export function getDb(): Database.Database {
  if (!_db) {
    const globalDir = path.join(os.homedir(), ".codesense");
    if (!fs.existsSync(globalDir)) {
      fs.mkdirSync(globalDir, { recursive: true });
    }
    const dbPath = path.join(globalDir, "codesense.db");
    _db = new Database(dbPath);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initializeDatabase();
    migrateFromJson();
  }
  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

// --- 建表 ---

function initializeDatabase(): void {
  const db = _db!;
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      id        INTEGER PRIMARY KEY CHECK (id = 1),
      version   INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      name       TEXT PRIMARY KEY,
      path       TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_projects_path ON projects(path);

    CREATE TABLE IF NOT EXISTS global_config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project_config (
      project_name    TEXT PRIMARY KEY REFERENCES projects(name) ON DELETE CASCADE,
      model           TEXT NOT NULL,
      dimensions      INTEGER NOT NULL,
      dimensions_full INTEGER NOT NULL,
      strategy        TEXT NOT NULL DEFAULT 'auto',
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS manifest (
      project_name TEXT NOT NULL REFERENCES projects(name) ON DELETE CASCADE,
      file_path    TEXT NOT NULL,
      sha256       TEXT NOT NULL,
      PRIMARY KEY (project_name, file_path)
    );
    CREATE INDEX IF NOT EXISTS idx_manifest_project ON manifest(project_name);

    CREATE TABLE IF NOT EXISTS dep_nodes (
      id           TEXT PRIMARY KEY,
      project_name TEXT NOT NULL REFERENCES projects(name) ON DELETE CASCADE,
      symbol       TEXT NOT NULL,
      file         TEXT NOT NULL,
      line         INTEGER NOT NULL,
      type         TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_dep_nodes_project ON dep_nodes(project_name);
    CREATE INDEX IF NOT EXISTS idx_dep_nodes_file ON dep_nodes(project_name, file);
    CREATE INDEX IF NOT EXISTS idx_dep_nodes_symbol ON dep_nodes(symbol);

    CREATE TABLE IF NOT EXISTS dep_edges (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL REFERENCES projects(name) ON DELETE CASCADE,
      from_id      TEXT NOT NULL,
      to_id        TEXT NOT NULL,
      relation     TEXT NOT NULL,
      confidence   TEXT NOT NULL DEFAULT 'EXTRACTED'
    );
    CREATE INDEX IF NOT EXISTS idx_dep_edges_project ON dep_edges(project_name);
    CREATE INDEX IF NOT EXISTS idx_dep_edges_from ON dep_edges(from_id);
    CREATE INDEX IF NOT EXISTS idx_dep_edges_to ON dep_edges(to_id);
  `);
  // Migration: add exclude_files column
  try { db.exec("ALTER TABLE project_config ADD COLUMN exclude_files TEXT"); } catch {}
}

function migrateFromJson(): void {
  const db = _db!;
  const row = db.prepare("SELECT version FROM schema_version WHERE id = 1").get() as { version: number } | undefined;
  if (row) return;

  const globalDir = path.join(os.homedir(), ".codesense");

  const tx = db.transaction(() => {
    // registry.json
    const regPath = path.join(globalDir, "registry.json");
    if (fs.existsSync(regPath)) {
      const registry: Registry = JSON.parse(fs.readFileSync(regPath, "utf-8"));
      const stmt = db.prepare("INSERT OR IGNORE INTO projects (name, path, created_at) VALUES (?, ?, ?)");
      for (const [name, entry] of Object.entries(registry)) {
        stmt.run(name, entry.path, entry.createdAt);
      }
    }

    // global-config.json
    const cfgPath = path.join(globalDir, "global-config.json");
    if (fs.existsSync(cfgPath)) {
      const config = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
      const stmt = db.prepare("INSERT OR REPLACE INTO global_config (key, value) VALUES (?, ?)");
      if (config.model) stmt.run("model", config.model);
      if (config.ollamaUrl) stmt.run("ollamaUrl", config.ollamaUrl);
    }

    // 每个项目
    const projectsDir = path.join(globalDir, "projects");
    if (fs.existsSync(projectsDir)) {
      const projects = fs.readdirSync(projectsDir);
      for (const projName of projects) {
        const projDir = path.join(projectsDir, projName);
        if (!fs.statSync(projDir).isDirectory()) continue;

        // config.json
        const cPath = path.join(projDir, "config.json");
        if (fs.existsSync(cPath)) {
          const cfg: IndexConfig = JSON.parse(fs.readFileSync(cPath, "utf-8"));
          db.prepare(
            "INSERT OR REPLACE INTO project_config (project_name, model, dimensions, dimensions_full, strategy, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
          ).run(projName, cfg.model, cfg.dimensions, cfg.dimensionsFull, cfg.strategy, cfg.createdAt, cfg.updatedAt);
        }

        // manifest.json
        const mPath = path.join(projDir, "manifest.json");
        if (fs.existsSync(mPath)) {
          const man: Manifest = JSON.parse(fs.readFileSync(mPath, "utf-8"));
          const stmt = db.prepare("INSERT OR REPLACE INTO manifest (project_name, file_path, sha256) VALUES (?, ?, ?)");
          for (const [fp, hash] of Object.entries(man)) {
            stmt.run(projName, fp, hash);
          }
        }

        // deps.json
        const dPath = path.join(projDir, "deps.json");
        if (fs.existsSync(dPath)) {
          const deps: DepGraph = JSON.parse(fs.readFileSync(dPath, "utf-8"));
          const nodeStmt = db.prepare("INSERT OR REPLACE INTO dep_nodes (id, project_name, symbol, file, line, type) VALUES (?, ?, ?, ?, ?, ?)");
          for (const [id, node] of Object.entries(deps.nodes || {})) {
            nodeStmt.run(id, projName, node.symbol, node.file, node.line, node.type);
          }
          const edgeStmt = db.prepare("INSERT INTO dep_edges (project_name, from_id, to_id, relation, confidence) VALUES (?, ?, ?, ?, ?)");
          for (const edge of (deps.edges || [])) {
            edgeStmt.run(projName, edge.from, edge.to, edge.relation, edge.confidence);
          }
        }
      }
    }

    db.prepare("INSERT INTO schema_version (id, version, updated_at) VALUES (1, 1, ?)")
      .run(new Date().toISOString());
  });

  tx();
}

// --- Registry ---

export function dbLoadRegistry(): Registry {
  const db = getDb();
  const rows = db.prepare("SELECT name, path, created_at FROM projects").all() as { name: string; path: string; created_at: string }[];
  const registry: Registry = {};
  for (const r of rows) {
    registry[r.name] = { name: r.name, path: r.path, createdAt: r.created_at };
  }
  return registry;
}

export function dbSaveRegistry(registry: Registry): void {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM projects").run();
    const stmt = db.prepare("INSERT INTO projects (name, path, created_at) VALUES (?, ?, ?)");
    for (const entry of Object.values(registry)) {
      stmt.run(entry.name, entry.path, entry.createdAt);
    }
  });
  tx();
}

export function dbRegisterProject(name: string, sourcePath: string): void {
  const db = getDb();
  db.prepare("INSERT OR IGNORE INTO projects (name, path, created_at) VALUES (?, ?, ?)")
    .run(name, path.resolve(sourcePath), new Date().toISOString());
}

export function dbUnregisterProject(name: string): void {
  const db = getDb();
  db.prepare("DELETE FROM projects WHERE name = ?").run(name);
}

export function dbFindProjectByDir(sourceDir: string): RegistryEntry | null {
  const db = getDb();
  const absPath = path.resolve(sourceDir);
  const row = db.prepare("SELECT name, path, created_at FROM projects WHERE path = ?").get(absPath) as { name: string; path: string; created_at: string } | undefined;
  return row ? { name: row.name, path: row.path, createdAt: row.created_at } : null;
}

export function dbListProjects(): RegistryEntry[] {
  const db = getDb();
  const rows = db.prepare("SELECT name, path, created_at FROM projects").all() as { name: string; path: string; created_at: string }[];
  return rows.map(r => ({ name: r.name, path: r.path, createdAt: r.created_at }));
}

// --- Global Config ---

export function dbLoadGlobalConfig(): GlobalConfig {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM global_config").all() as { key: string; value: string }[];
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    model: map.model || DEFAULT_GLOBAL_CONFIG.model,
    ollamaUrl: map.ollamaUrl || DEFAULT_GLOBAL_CONFIG.ollamaUrl,
    batchSize: map.batchSize ? parseInt(map.batchSize, 10) : DEFAULT_GLOBAL_CONFIG.batchSize,
    batchDelay: map.batchDelay ? parseInt(map.batchDelay, 10) : DEFAULT_GLOBAL_CONFIG.batchDelay,
  };
}

export function dbSaveGlobalConfig(config: GlobalConfig): void {
  const db = getDb();
  const tx = db.transaction(() => {
    const stmt = db.prepare("INSERT OR REPLACE INTO global_config (key, value) VALUES (?, ?)");
    stmt.run("model", config.model);
    stmt.run("ollamaUrl", config.ollamaUrl);
    stmt.run("batchSize", String(config.batchSize));
    stmt.run("batchDelay", String(config.batchDelay));
  });
  tx();
}

// --- Project Config ---

export function dbLoadConfig(projectName: string): IndexConfig | null {
  const db = getDb();
  const row = db.prepare(
    "SELECT model, dimensions, dimensions_full, strategy, created_at, updated_at, exclude_files FROM project_config WHERE project_name = ?"
  ).get(projectName) as { model: string; dimensions: number; dimensions_full: number; strategy: string; created_at: string; updated_at: string; exclude_files: string | null } | undefined;
  if (!row) return null;
  return {
    model: row.model,
    dimensions: row.dimensions,
    dimensionsFull: row.dimensions_full,
    strategy: row.strategy as IndexConfig["strategy"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    excludeFiles: row.exclude_files ? JSON.parse(row.exclude_files) : undefined,
  };
}

export function dbSaveConfig(projectName: string, config: IndexConfig): void {
  const db = getDb();
  db.prepare(
    "INSERT OR REPLACE INTO project_config (project_name, model, dimensions, dimensions_full, strategy, created_at, updated_at, exclude_files) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    projectName, config.model, config.dimensions, config.dimensionsFull,
    config.strategy, config.createdAt, config.updatedAt,
    config.excludeFiles ? JSON.stringify(config.excludeFiles) : null
  );
}

// --- Manifest ---

export function dbLoadManifest(projectName: string): Manifest {
  const db = getDb();
  const rows = db.prepare("SELECT file_path, sha256 FROM manifest WHERE project_name = ?").all(projectName) as { file_path: string; sha256: string }[];
  const manifest: Manifest = {};
  for (const r of rows) manifest[r.file_path] = r.sha256;
  return manifest;
}

export function dbSaveManifest(projectName: string, manifest: Manifest): void {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM manifest WHERE project_name = ?").run(projectName);
    const stmt = db.prepare("INSERT INTO manifest (project_name, file_path, sha256) VALUES (?, ?, ?)");
    for (const [fp, hash] of Object.entries(manifest)) {
      stmt.run(projectName, fp, hash);
    }
  });
  tx();
}

export function dbDiffManifests(
  projectName: string,
  newManifest: Manifest
): { added: string[]; modified: string[]; deleted: string[] } {
  const db = getDb();

  // 临时表存新 manifest
  db.exec("CREATE TEMP TABLE IF NOT EXISTS new_manifest (file_path TEXT PRIMARY KEY, sha256 TEXT NOT NULL)");
  db.exec("DELETE FROM new_manifest");

  const insertTemp = db.prepare("INSERT INTO new_manifest (file_path, sha256) VALUES (?, ?)");
  const insertMany = db.transaction((entries: [string, string][]) => {
    for (const [fp, hash] of entries) insertTemp.run(fp, hash);
  });
  insertMany(Object.entries(newManifest));

  const added = (db.prepare(`
    SELECT n.file_path FROM new_manifest n
    LEFT JOIN manifest m ON m.project_name = ? AND m.file_path = n.file_path
    WHERE m.file_path IS NULL
  `).all(projectName) as { file_path: string }[]).map(r => r.file_path);

  const modified = (db.prepare(`
    SELECT n.file_path FROM new_manifest n
    JOIN manifest m ON m.project_name = ? AND m.file_path = n.file_path
    WHERE m.sha256 != n.sha256
  `).all(projectName) as { file_path: string }[]).map(r => r.file_path);

  const deleted = (db.prepare(`
    SELECT m.file_path FROM manifest m
    LEFT JOIN new_manifest n ON m.file_path = n.file_path
    WHERE m.project_name = ? AND n.file_path IS NULL
  `).all(projectName) as { file_path: string }[]).map(r => r.file_path);

  db.exec("DELETE FROM new_manifest");

  return { added, modified, deleted };
}

export function dbSaveManifestIncremental(
  projectName: string,
  toUpsert: Record<string, string>,
  toDelete: string[]
): void {
  const db = getDb();
  const upsertStmt = db.prepare("INSERT OR REPLACE INTO manifest (project_name, file_path, sha256) VALUES (?, ?, ?)");
  const deleteStmt = db.prepare("DELETE FROM manifest WHERE project_name = ? AND file_path = ?");
  const tx = db.transaction(() => {
    for (const [fp, hash] of Object.entries(toUpsert)) upsertStmt.run(projectName, fp, hash);
    for (const fp of toDelete) deleteStmt.run(projectName, fp);
  });
  tx();
}

// --- Dep Graph ---

export function dbLoadDepGraph(projectName: string): DepGraph {
  const db = getDb();
  const nodes: Record<string, import("./types").DepNode> = {};
  const nodeRows = db.prepare("SELECT id, symbol, file, line, type FROM dep_nodes WHERE project_name = ?").all(projectName) as { id: string; symbol: string; file: string; line: number; type: string }[];
  for (const r of nodeRows) {
    nodes[r.id] = { symbol: r.symbol, file: r.file, line: r.line, type: r.type };
  }

  const edges = db.prepare("SELECT from_id, to_id, relation, confidence FROM dep_edges WHERE project_name = ?").all(projectName) as { from_id: string; to_id: string; relation: string; confidence: string }[];
  return {
    nodes,
    edges: edges.map(e => ({ from: e.from_id, to: e.to_id, relation: e.relation as "imports" | "calls" | "implements", confidence: e.confidence as "EXTRACTED" })),
  };
}

export function dbSaveDepGraph(projectName: string, graph: DepGraph): void {
  const db = getDb();
  const tx = db.transaction(() => {
    // 清除旧数据
    db.prepare("DELETE FROM dep_edges WHERE project_name = ?").run(projectName);
    db.prepare("DELETE FROM dep_nodes WHERE project_name = ?").run(projectName);

    const nodeStmt = db.prepare("INSERT INTO dep_nodes (id, project_name, symbol, file, line, type) VALUES (?, ?, ?, ?, ?, ?)");
    for (const [id, node] of Object.entries(graph.nodes)) {
      nodeStmt.run(id, projectName, node.symbol, node.file, node.line, node.type);
    }

    const edgeStmt = db.prepare("INSERT INTO dep_edges (project_name, from_id, to_id, relation, confidence) VALUES (?, ?, ?, ?, ?)");
    for (const edge of graph.edges) {
      if (typeof edge.from === "string" && typeof edge.to === "string") {
        edgeStmt.run(projectName, edge.from, edge.to, edge.relation || "calls", edge.confidence || "EXTRACTED");
      }
    }
  });
  tx();
}

export function dbRemoveFileFromGraph(projectName: string, filePath: string): void {
  const db = getDb();
  const tx = db.transaction(() => {
    const nodeIds = (db.prepare("SELECT id FROM dep_nodes WHERE project_name = ? AND file = ?")
      .all(projectName, filePath) as { id: string }[]).map(r => r.id);

    if (nodeIds.length === 0) return;

    const placeholders = nodeIds.map(() => "?").join(",");
    db.prepare(`DELETE FROM dep_edges WHERE project_name = ? AND (from_id IN (${placeholders}) OR to_id IN (${placeholders}))`)
      .run(projectName, ...nodeIds, ...nodeIds);
    db.prepare(`DELETE FROM dep_nodes WHERE project_name = ? AND id IN (${placeholders})`)
      .run(projectName, ...nodeIds);
  });
  tx();
}

export function dbMergeDepGraph(projectName: string, incoming: DepGraph): void {
  const db = getDb();
  const tx = db.transaction(() => {
    const upsertNode = db.prepare("INSERT OR REPLACE INTO dep_nodes (id, project_name, symbol, file, line, type) VALUES (?, ?, ?, ?, ?, ?)");
    for (const [id, node] of Object.entries(incoming.nodes)) {
      upsertNode.run(id, projectName, node.symbol, node.file, node.line, node.type);
    }

    const insertEdge = db.prepare("INSERT OR IGNORE INTO dep_edges (project_name, from_id, to_id, relation, confidence) VALUES (?, ?, ?, ?, ?)");
    for (const edge of incoming.edges) {
      insertEdge.run(projectName, edge.from, edge.to, edge.relation, edge.confidence);
    }
  });
  tx();
}

// --- Utility ---

export function dbDeleteProjectData(projectName: string): void {
  const db = getDb();
  // CASCADE 会自动删除 manifest、dep_nodes、dep_edges、project_config
  db.prepare("DELETE FROM projects WHERE name = ?").run(projectName);
}

export function dbGetManifestCount(projectName: string): number {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as count FROM manifest WHERE project_name = ?").get(projectName) as { count: number };
  return row.count;
}

export function dbGetDepStats(projectName: string): { nodeCount: number; edgeCount: number } {
  const db = getDb();
  const nodes = db.prepare("SELECT COUNT(*) as count FROM dep_nodes WHERE project_name = ?").get(projectName) as { count: number };
  const edges = db.prepare("SELECT COUNT(*) as count FROM dep_edges WHERE project_name = ?").get(projectName) as { count: number };
  return { nodeCount: nodes.count, edgeCount: edges.count };
}
