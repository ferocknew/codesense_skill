import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const LOGS_DIR = path.join(os.homedir(), ".codesense", "logs");

interface LogEntry {
  time: string;
  project: string;
  action: "index" | "update";
  status: "started" | "completed" | "failed";
  files?: number;
  chunks?: number;
  durationMs?: number;
  error?: string;
}

function ensureLogsDir(): void {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function logFile(date?: string): string {
  const d = date || new Date().toISOString().slice(0, 10);
  return path.join(LOGS_DIR, `${d}.log`);
}

export function appendLog(entry: LogEntry): void {
  ensureLogsDir();
  const line = JSON.stringify(entry) + "\n";
  fs.appendFileSync(logFile(), line, "utf-8");
}

export interface LogQueryOptions {
  project?: string;
  limit?: number;
  date?: string;
}

export function queryLogs(options: LogQueryOptions = {}): LogEntry[] {
  ensureLogsDir();
  const limit = options.limit || 100;
  const targetDate = options.date || new Date().toISOString().slice(0, 10);
  const filePath = logFile(targetDate);

  if (!fs.existsSync(filePath)) return [];

  const lines = fs.readFileSync(filePath, "utf-8").trim().split("\n").filter(Boolean);
  let entries: LogEntry[] = [];

  for (const line of lines) {
    try {
      const entry: LogEntry = JSON.parse(line);
      if (options.project && entry.project !== options.project) continue;
      entries.push(entry);
    } catch {}
  }

  return entries.slice(-limit).reverse();
}

export function listLogDates(): string[] {
  ensureLogsDir();
  const files = fs.readdirSync(LOGS_DIR).filter(f => f.endsWith(".log")).sort().reverse();
  return files.map(f => f.replace(".log", ""));
}

export function cleanOldLogs(maxDays: number = 30): number {
  ensureLogsDir();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const files = fs.readdirSync(LOGS_DIR).filter(f => f.endsWith(".log"));
  let removed = 0;
  for (const f of files) {
    const dateStr = f.replace(".log", "");
    if (dateStr < cutoffStr) {
      fs.unlinkSync(path.join(LOGS_DIR, f));
      removed++;
    }
  }
  return removed;
}
