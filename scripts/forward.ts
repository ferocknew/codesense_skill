import * as http from "http";
import { spawn } from "child_process";
import * as path from "path";

const DEFAULT_PORT = 54321;
const MAX_WAIT_MS = 8000;
const POLL_INTERVAL_MS = 300;

function isServerReady(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: "localhost", port: DEFAULT_PORT, path: "/api/status", method: "GET", timeout: 1500 },
      (res) => {
        res.resume();
        res.on("end", () => resolve(res.statusCode === 200));
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
    req.end();
  });
}

function startServerInBackground(): void {
  const skillJs = path.resolve(__dirname, "..", "skill.js");

  // 用 node 直接 spawn，detached + unref 让它在后台独立运行
  const child = spawn("node", [skillJs, "server", "--port", String(DEFAULT_PORT)], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();

  console.log(`后台启动 server (PID: ${child.pid})...`);
}

export async function ensureServer(): Promise<void> {
  if (await isServerReady()) return;

  startServerInBackground();

  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    if (await isServerReady()) {
      console.log(`server 已就绪: http://localhost:${DEFAULT_PORT}`);
      return;
    }
  }

  // 超时也不报错，本地执行兜底
  console.log("server 启动超时，将本地执行");
}

export async function forwardToServer(
  action: "index" | "update",
  projectName: string
): Promise<boolean> {
  await ensureServer();

  return new Promise((resolve) => {
    const postData = JSON.stringify({});
    const req = http.request(
      {
        hostname: "localhost",
        port: DEFAULT_PORT,
        path: `/api/${action}/${encodeURIComponent(projectName)}`,
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) },
        timeout: 5000,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk: Buffer) => { body += chunk.toString(); });
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(body);
              console.log(data.data?.message || `已提交后台${action === "index" ? "索引" : "更新"}任务: ${projectName}`);
            } catch {
              console.log(`已提交后台任务: ${projectName}`);
            }
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
    req.write(postData);
    req.end();
  });
}
