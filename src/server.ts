import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { URL } from "url";
import {
  ServerState,
  createServerState,
  initProjectState,
  updateProjectState,
  getSerializedState,
} from "./server-state";
import { renderDashboard } from "./html/index";
import {
  listProjects,
  getProjectDir,
} from "./global";
import { loadConfig } from "./config";
import { getTableStats } from "./index";
import { search as searchCode } from "./search";
import { loadDepGraph } from "./graph";
import { closeDb, dbGetDepStats } from "./database";

export interface ServerOptions {
  port: number;
}

const sseClients = new Set<http.ServerResponse>();

function broadcastSSE(event: string, data: any): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

export async function startServer(options: ServerOptions): Promise<void> {
  const state = createServerState(options.port);

  // 初始化已注册项目状态
  const projects = listProjects();
  for (const p of projects) {
    initProjectState(state, p.name, p.path);
  }

  const server = http.createServer((req, res) =>
    handleRequest(req, res, state)
  );

  // 优雅关闭
  const shutdown = () => {
    console.log("\n正在关闭服务器...");
    for (const client of sseClients) {
      try {
        client.end();
      } catch {}
    }
    sseClients.clear();
    closeDb();
    server.close(() => {
      console.log("服务器已关闭");
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 3000);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  server.listen(options.port, () => {
    console.log(`codesense server 已启动`);
    console.log(`  地址:     http://localhost:${options.port}`);
    console.log(`  项目数:   ${projects.length}`);
    console.log(`\n按 Ctrl+C 停止`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`端口 ${options.port} 已被占用，请使用 --port 指定其他端口`);
      process.exit(1);
    }
    console.error("服务器错误:", err.message);
  });
}

async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  state: ServerState
): Promise<void> {
  const url = new URL(req.url || "/", `http://localhost:${state.port}`);
  const pathname = url.pathname;

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (pathname === "/" && req.method === "GET") {
      serveHTML(res, state);
    } else if (pathname === "/api/status" && req.method === "GET") {
      await serveStatus(res, state);
    } else if (pathname === "/api/projects" && req.method === "GET") {
      await serveProjects(res);
    } else if (pathname.startsWith("/api/projects/") && req.method === "GET") {
      const name = decodeURIComponent(pathname.slice("/api/projects/".length));
      await serveProjectDetail(res, name);
    } else if (pathname.startsWith("/api/graph/") && req.method === "GET") {
      const name = decodeURIComponent(pathname.slice("/api/graph/".length));
      await serveGraphData(res, name);
    } else if (pathname.startsWith("/api/index/") && req.method === "POST") {
      const name = decodeURIComponent(pathname.slice("/api/index/".length));
      await triggerIndex(res, state, name);
    } else if (pathname.startsWith("/api/update/") && req.method === "POST") {
      const name = decodeURIComponent(pathname.slice("/api/update/".length));
      await triggerUpdate(res, state, name);
    } else if (pathname === "/api/search" && req.method === "GET") {
      await serveSearch(res, url);
    } else if (pathname === "/api/events" && req.method === "GET") {
      handleSSE(req, res);
    } else {
      sendJSON(res, 404, { ok: false, error: "Not Found" });
    }
  } catch (err: any) {
    sendJSON(res, 500, { ok: false, error: err.message });
  }
}

function serveHTML(res: http.ServerResponse, state: ServerState): void {
  const html = renderDashboard(state);
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

async function serveStatus(
  res: http.ServerResponse,
  state: ServerState
): Promise<void> {
  sendJSON(res, 200, { ok: true, data: getSerializedState(state) });
}

async function serveProjects(res: http.ServerResponse): Promise<void> {
  const projects = listProjects();
  const results = await Promise.all(
    projects.map(async (p) => {
      const projectDir = getProjectDir(p.name);
      const config = loadConfig(p.name);
      const stats = await getTableStats(path.join(projectDir, "index.lance"));
      return {
        name: p.name,
        path: p.path,
        createdAt: p.createdAt,
        hasIndex: !!config,
        chunkCount: stats?.count ?? 0,
        config: config
          ? { dimensions: config.dimensions, strategy: config.strategy, updatedAt: config.updatedAt }
          : null,
      };
    })
  );
  sendJSON(res, 200, { ok: true, data: results });
}

async function serveProjectDetail(
  res: http.ServerResponse,
  name: string
): Promise<void> {
  const projectDir = getProjectDir(name);
  if (!fs.existsSync(projectDir)) {
    sendJSON(res, 404, { ok: false, error: `项目 "${name}" 未找到` });
    return;
  }
  const config = loadConfig(name);
  const stats = await getTableStats(path.join(projectDir, "index.lance"));
  const { nodeCount: depCount, edgeCount } = dbGetDepStats(name);

  sendJSON(res, 200, {
    ok: true,
    data: {
      name,
      config,
      chunkCount: stats?.count ?? 0,
      depNodes: depCount,
      depEdges: edgeCount,
    },
  });
}

async function serveGraphData(
  res: http.ServerResponse,
  name: string
): Promise<void> {
  const config = loadConfig(name);
  if (!config) {
    sendJSON(res, 404, { ok: false, error: `项目 "${name}" 无依赖图数据` });
    return;
  }
  const deps = loadDepGraph(name);
  sendJSON(res, 200, { ok: true, data: deps });
}

async function triggerIndex(
  res: http.ServerResponse,
  state: ServerState,
  name: string
): Promise<void> {
  const projects = listProjects();
  const project = projects.find((p) => p.name === name);
  if (!project) {
    sendJSON(res, 404, { ok: false, error: `项目 "${name}" 未找到` });
    return;
  }

  updateProjectState(state, name, { status: "indexing", error: null });
  broadcastSSE("index-progress", {
    type: "state",
    project: name,
    status: "indexing",
  });

  // 异步执行，立即返回
  sendJSON(res, 200, { ok: true, data: { message: `开始全量索引 ${name}` } });

  const start = Date.now();
  try {
    const { buildIndex } = require("./indexer");
    await buildIndex(project.path, { quiet: true, exitOnError: false });
    updateProjectState(state, name, {
      status: "completed",
      lastIndexAt: new Date().toISOString(),
      lastDurationMs: Date.now() - start,
      error: null,
    });
  } catch (err: any) {
    updateProjectState(state, name, { status: "failed", error: err.message });
  }
  broadcastSSE("index-progress", {
    type: "state",
    project: name,
    ...state.projects[name],
  });
}

async function triggerUpdate(
  res: http.ServerResponse,
  state: ServerState,
  name: string
): Promise<void> {
  const projects = listProjects();
  const project = projects.find((p) => p.name === name);
  if (!project) {
    sendJSON(res, 404, { ok: false, error: `项目 "${name}" 未找到` });
    return;
  }

  updateProjectState(state, name, { status: "indexing", error: null });
  broadcastSSE("index-progress", {
    type: "state",
    project: name,
    status: "indexing",
  });

  sendJSON(res, 200, {
    ok: true,
    data: { message: `开始增量更新 ${name}` },
  });

  const start = Date.now();
  try {
    const { updateIndex } = require("./update");
    await updateIndex(project.path, { quiet: true, exitOnError: false });
    updateProjectState(state, name, {
      status: "completed",
      lastIndexAt: new Date().toISOString(),
      lastDurationMs: Date.now() - start,
      error: null,
    });
  } catch (err: any) {
    updateProjectState(state, name, { status: "failed", error: err.message });
  }
  broadcastSSE("index-progress", {
    type: "state",
    project: name,
    ...state.projects[name],
  });
}

async function serveSearch(
  res: http.ServerResponse,
  url: URL
): Promise<void> {
  const q = url.searchParams.get("q") || "";
  if (!q) {
    sendJSON(res, 400, { ok: false, error: "缺少查询参数 q" });
    return;
  }
  const project = url.searchParams.get("project") || undefined;
  const topK = parseInt(url.searchParams.get("topK") || "10", 10);
  const results = await searchCode(q, { topK, project });
  sendJSON(res, 200, { ok: true, data: results });
}

function handleSSE(req: http.IncomingMessage, res: http.ServerResponse): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write("\n");
  sseClients.add(res);
  req.on("close", () => {
    sseClients.delete(res);
  });
}

function sendJSON(
  res: http.ServerResponse,
  statusCode: number,
  data: object
): void {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}
