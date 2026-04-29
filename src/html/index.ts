import { ServerState } from "../server-state";
import { getDashboardJS } from "./dashboard";
import { getDashboardCSS } from "./css";

export function renderDashboard(state: ServerState): string {
  const uptimeMs = Date.now() - new Date(state.startedAt).getTime();
  const uptime = formatUptime(uptimeMs);
  const projects = Object.values(state.projects);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>codesense server</title>
<style>
${getDashboardCSS()}
</style>
</head>
<body>
<div class="app">
<div class="sidebar">
  <div class="sidebar-hd"><h1>codesense</h1><span id="uptime">${uptime}</span></div>
  <div class="proj-list" id="projList">
    ${projects.map((p) => projItem(p)).join("\n    ")}
  </div>
  <div class="node-detail" id="nodeDetail">
    <h3 id="ndTitle"></h3>
    <div class="meta" id="ndMeta"></div>
    <ul class="func-list" id="funcList"></ul>
  </div>
</div>
<div class="main">
  <div class="toolbar">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="语义搜索..." />
      <button id="searchBtn">搜索</button>
    </div>
    <span class="info" id="graphInfo"></span>
  </div>
  <div class="search-results" id="searchResults"></div>
  <div class="graph-wrap">
    <div class="topbar" id="topbar">Nodes: <span id="nodeCount">0</span></div>
    <div class="placeholder" id="ph">Click a project in the sidebar to view its dependency graph</div>
    <div id="graph"></div>
  </div>
</div>
</div>
<div class="log-overlay" id="logPanel">
  <div class="log-hd">
    <h2>操作日志</h2>
    <button class="close" onclick="document.getElementById('logPanel').classList.remove('visible')">&times;</button>
  </div>
  <div class="log-filters">
    <select id="logDateFilter"><option value="">今天</option></select>
    <select id="logActionFilter"><option value="">全部</option><option value="index">索引</option><option value="update">更新</option></select>
  </div>
  <div class="log-body" id="logBody"></div>
</div>
<script src="https://unpkg.com/graphology@0.25.4/dist/graphology.umd.min.js"></script>
<script src="https://unpkg.com/sigma@2.4.0/build/sigma.min.js"></script>
<script>
${getDashboardJS()}
</script>
</body>
</html>`;
}

function projItem(p: {
  name: string;
  path: string;
  status: string;
  lastIndexAt: string | null;
  lastChanges: { added: number; modified: number; deleted: number } | null;
  error: string | null;
}): string {
  const timeStr = p.lastIndexAt
    ? new Date(p.lastIndexAt).toLocaleTimeString()
    : "-";
  const changesStr = p.lastChanges
    ? `+${p.lastChanges.added} ~${p.lastChanges.modified} -${p.lastChanges.deleted}`
    : "";
  return `<div class="proj-item" data-name="${p.name}">
  <div class="proj-name"><span class="status status-${p.status}"></span> ${p.name}</div>
  <div class="proj-path" title="${p.path}">${p.path}</div>
  <div class="proj-stats"><span>${timeStr}</span>${changesStr ? "<span>" + changesStr + "</span>" : ""}</div>
  <div class="proj-actions">
    <button class="btn" onclick="event.stopPropagation();triggerAction('${p.name}','update')">增量更新</button>
    <button class="btn" onclick="event.stopPropagation();triggerAction('${p.name}','index')">重建索引</button>
    <button class="btn" onclick="event.stopPropagation();showLogs()">查看日志</button>
  </div>
  <div class="proj-bar-wrap" id="bar-${p.name}"></div>
</div>`;
}

function formatUptime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${sec % 60}s`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}
