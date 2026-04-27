import * as path from "path";
import { OUTPUT_DIR } from "./types";

interface LanceRecord {
  vector: number[];
  text: string;
  symbol: string;
  chunkType: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  language: string;
  textHash: string;
  context: string;
}

// 延迟加载 LanceDB
async function getLanceDB(): Promise<any> {
  return require("@lancedb/lancedb");
}

export async function connect(dbPath?: string) {
  const lancedb = await getLanceDB();
  const dir = dbPath || path.resolve(OUTPUT_DIR);
  return await lancedb.connect(dir);
}

export async function createTable(
  dbPath: string,
  records: LanceRecord[]
): Promise<any> {
  const db = await connect(dbPath);
  const tableData = records.map((r) => ({
    vector: r.vector,
    text: r.text,
    symbol: r.symbol,
    chunkType: r.chunkType,
    filePath: r.filePath,
    lineStart: r.lineStart,
    lineEnd: r.lineEnd,
    language: r.language,
    textHash: r.textHash,
    context: r.context,
  }));

  // 删除旧表（如果存在）
  try {
    await db.dropTable("chunks");
  } catch {
    // 表不存在，忽略
  }

  const table = await db.createTable("chunks", tableData);
  return table;
}

export async function addToTable(
  dbPath: string,
  records: LanceRecord[]
): Promise<void> {
  const db = await connect(dbPath);
  const table = await db.openTable("chunks");
  const tableData = records.map((r) => ({
    vector: r.vector,
    text: r.text,
    symbol: r.symbol,
    chunkType: r.chunkType,
    filePath: r.filePath,
    lineStart: r.lineStart,
    lineEnd: r.lineEnd,
    language: r.language,
    textHash: r.textHash,
    context: r.context,
  }));
  await table.add(tableData);
}

export async function deleteFromTable(
  dbPath: string,
  filePaths: string[]
): Promise<void> {
  const db = await connect(dbPath);
  const table = await db.openTable("chunks");
  for (const fp of filePaths) {
    await table.delete(`"filePath" = '${fp.replace(/'/g, "''")}'`);
  }
}

export async function queryTable(
  dbPath: string,
  vector: number[],
  options: { limit: number; where?: string }
): Promise<any[]> {
  const db = await connect(dbPath);
  const table = await db.openTable("chunks");
  let query = table.search(vector);
  if (options.where) {
    query = query.where(options.where);
  }
  return await query.limit(options.limit).toArray();
}

export async function getTableStats(
  dbPath: string
): Promise<{ count: number } | null> {
  try {
    const db = await connect(dbPath);
    const table = await db.openTable("chunks");
    const count = await table.countRows();
    return { count };
  } catch {
    return null;
  }
}
