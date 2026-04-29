export function getDashboardCSS(): string {
  return `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;background:#0b1020;color:#e5e7eb;overflow:hidden}
.app{display:flex;height:100vh;width:100vw}

/* Sidebar */
.sidebar{width:320px;min-width:320px;background:rgba(17,24,39,0.95);border-right:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;backdrop-filter:blur(12px)}
.sidebar-hd{padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between}
.sidebar-hd h1{color:#38bdf8;font-size:18px;font-weight:600;letter-spacing:-0.3px}
.sidebar-hd span{color:#64748b;font-size:11px;font-family:monospace}
.proj-list{flex:1;overflow-y:auto;padding:8px 12px}
.proj-item{padding:10px 12px;border-radius:10px;cursor:pointer;margin-bottom:4px;transition:all .15s;border:1px solid transparent}
.proj-item:hover{background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.06)}
.proj-item.active{background:rgba(56,189,248,0.12);border-color:rgba(56,189,248,0.3)}
.proj-item.active .proj-name{color:#38bdf8}
.proj-name{font-weight:600;font-size:13px;display:flex;align-items:center;gap:8px}
.proj-path{color:#64748b;font-size:10px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.proj-stats{font-size:10px;color:#64748b;margin-top:4px;display:flex;gap:8px;align-items:center}
.status{display:inline-block;width:7px;height:7px;border-radius:50%}
.status-idle{background:#64748b}
.status-checking,.status-indexing{background:#f59e0b;animation:pulse 1s infinite}
.status-completed{background:#22c55e}
.status-failed{background:#ef4444}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.proj-actions{margin-top:6px;display:flex;gap:4px;flex-wrap:wrap}
.proj-actions .btn{font-size:10px;padding:3px 8px}
.proj-bar-wrap{margin-top:8px;display:none}
.proj-bar-wrap.visible{display:block}
.proj-bar-label{font-size:10px;color:#64748b;margin-bottom:3px;display:flex;justify-content:space-between}
.proj-bar-track{height:3px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden}
.proj-bar-fill{height:100%;background:linear-gradient(90deg,#38bdf8,#818cf8);border-radius:2px;width:0%;transition:width .3s ease}

/* Buttons */
.btn{background:rgba(255,255,255,0.06);color:#e5e7eb;border:1px solid rgba(255,255,255,0.08);padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px;transition:all .15s}
.btn:hover{background:rgba(255,255,255,0.1)}
.btn.active{background:#38bdf8;border-color:#38bdf8;color:#0b1020}

/* Node detail */
.node-detail{border-top:1px solid rgba(255,255,255,0.06);padding:12px 16px;max-height:40vh;overflow-y:auto;display:none}
.node-detail.visible{display:block}
.node-detail h3{color:#38bdf8;font-size:13px;margin-bottom:4px;word-break:break-all}
.node-detail .meta{color:#64748b;font-size:11px;margin-bottom:8px}
.func-list{list-style:none}
.func-item{padding:3px 0;font-size:11px;color:#e5e7eb;border-bottom:1px solid rgba(255,255,255,0.04)}
.func-item:last-child{border:none}
.func-item .sym{color:#f0f6fc}
.func-item .ln{color:#64748b;font-size:10px}

/* Search */
.search-box{display:flex;gap:6px;align-items:center}
.search-box input{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:#e5e7eb;padding:8px 12px;border-radius:10px;font-size:13px;width:260px;outline:none;transition:border-color .15s}
.search-box input:focus{border-color:rgba(56,189,248,0.5)}
.search-box input::placeholder{color:#475569}
.search-box button{background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.3);padding:8px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:500;transition:all .15s}
.search-box button:hover{background:rgba(56,189,248,0.25)}
.search-results{padding:0 8px;max-height:30vh;overflow-y:auto;display:none;border-top:1px solid rgba(255,255,255,0.06)}
.search-results.visible{display:block}
.sr-item{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.04);transition:background .1s}
.sr-item:hover{background:rgba(255,255,255,0.03)}
.sr-item:last-child{border:none}
.sr-sym{color:#f0f6fc;font-weight:600;font-size:12px}
.sr-score{color:#64748b;font-size:10px;float:right}
.sr-file{color:#38bdf8;font-size:11px}
.sr-text{color:#64748b;font-size:11px;margin-top:3px;max-height:40px;overflow:hidden}

/* Toolbar & main */
.toolbar{padding:8px 16px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;gap:8px;align-items:center;background:rgba(17,24,39,0.6);backdrop-filter:blur(8px)}
.toolbar .info{color:#64748b;font-size:12px;margin-left:auto;font-family:monospace}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative}
.graph-wrap{flex:1;position:relative}
#graph{width:100%;height:100%}
.placeholder{display:flex;align-items:center;justify-content:center;height:100%;color:#334155;font-size:14px;font-weight:300}

/* Topbar */
.topbar{position:absolute;top:16px;right:16px;background:rgba(15,23,42,0.85);padding:8px 14px;border-radius:10px;font-size:12px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.08);color:#64748b;z-index:10;font-family:monospace}

/* Log overlay */
.log-overlay{display:none;position:fixed;top:0;right:0;width:440px;height:100vh;background:rgba(17,24,39,0.98);border-left:1px solid rgba(255,255,255,0.08);z-index:100;flex-direction:column;backdrop-filter:blur(12px)}
.log-overlay.visible{display:flex}
.log-hd{padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:space-between}
.log-hd h2{color:#38bdf8;font-size:14px;font-weight:600}
.log-hd .close{background:none;border:none;color:#64748b;cursor:pointer;font-size:20px;padding:0 4px;transition:color .15s}
.log-hd .close:hover{color:#e5e7eb}
.log-filters{padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;gap:8px;align-items:center}
.log-filters select{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);color:#e5e7eb;padding:4px 8px;border-radius:6px;font-size:11px}
.log-body{flex:1;overflow-y:auto;padding:4px 0}
.log-row{padding:6px 14px;border-bottom:1px solid rgba(255,255,255,0.03);font-size:11px;transition:background .1s}
.log-row:hover{background:rgba(255,255,255,0.03)}
.log-time{color:#64748b;font-size:10px}
.log-action{display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;margin:0 4px}
.log-action.index{background:rgba(56,189,248,0.15);color:#38bdf8}
.log-action.update{background:rgba(34,197,94,0.15);color:#22c55e}
.log-st.Completed{color:#22c55e}
.log-st.Failed{color:#ef4444}
.log-st.Started{color:#f59e0b}
.log-dur{color:#64748b;font-size:10px;margin-left:6px}
.log-err{color:#ef4444;font-size:10px;margin-top:2px}
.log-empty{color:#334155;text-align:center;padding:32px;font-size:12px}`;
}
