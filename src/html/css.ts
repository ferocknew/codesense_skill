export function getDashboardCSS(): string {
  return `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0d1117;color:#c9d1d9;overflow:hidden}
.app{display:flex;height:100vh}
.sidebar{width:280px;min-width:280px;background:#161b22;border-right:1px solid #30363d;display:flex;flex-direction:column}
.sidebar-hd{padding:12px 16px;border-bottom:1px solid #30363d;display:flex;align-items:center;justify-content:space-between}
.sidebar-hd h1{color:#58a6ff;font-size:15px}
.sidebar-hd span{color:#8b949e;font-size:11px}
.proj-list{flex:1;overflow-y:auto;padding:4px 8px}
.proj-item{padding:8px 10px;border-radius:6px;cursor:pointer;margin-bottom:2px;transition:background .15s}
.proj-item:hover{background:#21262d}
.proj-item.active{background:#1f6feb}
.proj-item.active .proj-name{color:#fff}
.proj-name{font-weight:600;font-size:13px}
.proj-path{color:#8b949e;font-size:10px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.proj-stats{font-size:10px;color:#8b949e;margin-top:3px;display:flex;gap:8px;align-items:center}
.status{display:inline-block;width:7px;height:7px;border-radius:50%}
.status-idle{background:#8b949e}
.status-checking,.status-indexing{background:#d29922;animation:pulse 1s infinite}
.status-completed{background:#3fb950}
.status-failed{background:#f85149}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.proj-actions{margin-top:4px;display:flex;gap:4px;flex-wrap:wrap}
.proj-actions .btn{font-size:10px;padding:2px 6px}
.proj-bar-wrap{margin-top:6px;display:none}
.proj-bar-wrap.visible{display:block}
.proj-bar-label{font-size:10px;color:#8b949e;margin-bottom:2px;display:flex;justify-content:space-between}
.proj-bar-track{height:4px;background:#21262d;border-radius:2px;overflow:hidden}
.proj-bar-fill{height:100%;background:linear-gradient(90deg,#1f6feb,#58a6ff);border-radius:2px;width:0%;transition:width .3s ease}
.btn{background:#21262d;color:#c9d1d9;border:1px solid #30363d;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px}
.btn:hover{background:#30363d}
.btn.active{background:#1f6feb;border-color:#1f6feb;color:#fff}
.node-detail{border-top:1px solid #30363d;padding:10px 12px;max-height:40vh;overflow-y:auto;display:none}
.node-detail.visible{display:block}
.node-detail h3{color:#58a6ff;font-size:13px;margin-bottom:4px;word-break:break-all}
.node-detail .meta{color:#8b949e;font-size:11px;margin-bottom:8px}
.func-list{list-style:none}
.func-item{padding:3px 0;font-size:11px;color:#c9d1d9;border-bottom:1px solid #21262d}
.func-item:last-child{border:none}
.func-item .sym{color:#f0f6fc}
.func-item .ln{color:#8b949e;font-size:10px}
.search-results{padding:0 8px;max-height:30vh;overflow-y:auto;display:none;border-top:1px solid #30363d}
.search-results.visible{display:block}
.sr-item{padding:6px 8px;border-bottom:1px solid #21262d}
.sr-item:last-child{border:none}
.sr-sym{color:#f0f6fc;font-weight:600;font-size:12px}
.sr-score{color:#8b949e;font-size:10px;float:right}
.sr-file{color:#58a6ff;font-size:11px}
.sr-text{color:#8b949e;font-size:11px;margin-top:2px;max-height:40px;overflow:hidden}
.toolbar{padding:6px 12px;border-bottom:1px solid #30363d;display:flex;gap:8px;align-items:center;background:#161b22}
.toolbar select{background:#0d1117;border:1px solid #30363d;color:#c9d1d9;padding:3px 8px;border-radius:4px;font-size:12px}
.toolbar .info{color:#8b949e;font-size:12px;margin-left:auto}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative}
.graph-wrap{flex:1;position:relative}
#graph{width:100%;height:100%}
.placeholder{display:flex;align-items:center;justify-content:center;height:100%;color:#484f58;font-size:14px}
.log-overlay{display:none;position:fixed;top:0;right:0;width:420px;height:100vh;background:#161b22;border-left:1px solid #30363d;z-index:100;flex-direction:column}
.log-overlay.visible{display:flex}
.log-hd{padding:12px 16px;border-bottom:1px solid #30363d;display:flex;align-items:center;justify-content:space-between}
.log-hd h2{color:#58a6ff;font-size:14px}
.log-hd .close{background:none;border:none;color:#8b949e;cursor:pointer;font-size:18px;padding:0 4px}
.log-hd .close:hover{color:#f0f6fc}
.log-filters{padding:8px 12px;border-bottom:1px solid #30363d;display:flex;gap:8px;align-items:center}
.log-filters select{background:#0d1117;border:1px solid #30363d;color:#c9d1d9;padding:3px 8px;border-radius:4px;font-size:11px}
.log-body{flex:1;overflow-y:auto;padding:4px 0}
.log-row{padding:6px 12px;border-bottom:1px solid #21262d;font-size:11px}
.log-row:hover{background:#21262d}
.log-time{color:#8b949e;font-size:10px}
.log-action{display:inline-block;padding:1px 5px;border-radius:3px;font-size:10px;margin:0 4px}
.log-action.index{background:#1f3a5f;color:#58a6ff}
.log-action.update{background:#1a3a2a;color:#3fb950}
.log-st.Completed{color:#3fb950}
.log-st.Failed{color:#f85149}
.log-st.Started{color:#d29922}
.log-dur{color:#8b949e;font-size:10px;margin-left:6px}
.log-err{color:#f85149;font-size:10px;margin-top:2px}
.log-empty{color:#484f58;text-align:center;padding:32px;font-size:12px}`;
}
