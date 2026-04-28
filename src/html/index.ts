import { ServerState } from "../server-state";
import { CYTOSCAPE_JS_BASE64 } from "./cytoscape";

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
*{margin:0;padding:0;box-sizing:border-box}
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
.toolbar select{background:#0d1117;border:1px solid #30363d;color:#c9d1d9;padding:3px 8px;border-radius:4px;font-size:12px}
.toolbar .info{color:#8b949e;font-size:12px;margin-left:auto}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative}
.graph-wrap{flex:1;position:relative}
#cy{width:100%;height:100%;position:absolute;top:0;left:0}
.placeholder{display:flex;align-items:center;justify-content:center;height:100%;color:#484f58;font-size:14px}
#tooltip{display:none;position:fixed;background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:4px 8px;border-radius:4px;font-size:11px;pointer-events:none;z-index:1000;max-width:300px}

/* Log panel */
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
.log-st Completed{color:#3fb950}
.log-st.Failed{color:#f85149}
.log-st.Started{color:#d29922}
.log-dur{color:#8b949e;font-size:10px;margin-left:6px}
.log-err{color:#f85149;font-size:10px;margin-top:2px}
.log-empty{color:#484f58;text-align:center;padding:32px;font-size:12px}
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
    <select id="dirFilter" style="display:none"><option value="">All</option></select>
    <span class="info" id="graphInfo"></span>
  </div>
  <div class="search-results" id="searchResults"></div>
  <div class="graph-wrap">
    <div class="placeholder" id="ph">Click a project in the sidebar to view its dependency graph</div>
    <div id="cy"></div>
  </div>
</div>
</div>
<div id="tooltip"></div>
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
<script>
var CY_B64="${CYTOSCAPE_JS_BASE64}";
var curProj=null,graphCache={},cyInst=null;

// Load Cytoscape.js
(function(){
  var raw=atob(CY_B64);
  var blob=new Blob([raw],{type:"application/javascript"});
  var url=URL.createObjectURL(blob);
  var s=document.createElement("script");
  s.src=url;
  s.onload=function(){URL.revokeObjectURL(url);onReady()};
  document.head.appendChild(s);
})();

function onReady(){
  document.querySelectorAll(".proj-item").forEach(function(el){
    el.addEventListener("click",function(){selectProject(el.dataset.name)});
  });
  document.getElementById("searchBtn").addEventListener("click",doSearch);
  document.getElementById("searchInput").addEventListener("keydown",function(e){if(e.key==="Enter")doSearch()});
  document.getElementById("dirFilter").addEventListener("change",function(){
    if(curProj&&graphCache[curProj])renderGraph(graphCache[curProj]);
  });
  document.getElementById("logDateFilter").addEventListener("change",loadLogs);
  document.getElementById("logActionFilter").addEventListener("change",loadLogs);
  loadLogDates();
  // SSE
  var es=new EventSource("/api/events");
  es.addEventListener("project-added",function(e){
    var d=JSON.parse(e.data);
    if(d.name&&!document.querySelector('[data-name="'+d.name+'"]')){
      var div=document.createElement("div");
      div.className="proj-item";
      div.dataset.name=d.name;
      div.innerHTML='<div class="proj-name"><span class="status status-idle"></span> '+esc(d.name)+'</div>'
        +'<div class="proj-path" title="'+esc(d.path)+'">'+esc(d.path)+'</div>'
        +'<div class="proj-stats"><span>-</span></div>'
        +'<div class="proj-actions">'
        +'<button class="btn" onclick="event.stopPropagation();triggerAction(\\''+esc(d.name)+'\\',\\\'update\\\')">增量更新</button> '
        +'<button class="btn" onclick="event.stopPropagation();triggerAction(\\''+esc(d.name)+'\\',\\\'index\\\')">重建索引</button> '
        +'<button class="btn" onclick="event.stopPropagation();showLogs()">查看日志</button>'
        +'</div>';
      div.addEventListener("click",function(){selectProject(d.name)});
      document.getElementById("projList").appendChild(div);
    }
  });
  es.addEventListener("index-progress",function(e){
    var d=JSON.parse(e.data);
    if(d.type==="progress"&&d.project){
      updateBar(d.project,d.phase,d.current,d.total);
    }
    if(d.type==="state"&&d.project){
      var el=document.querySelector('[data-name="'+d.project+'"]');
      if(el){
        var dot=el.querySelector(".status");
        if(dot){dot.className="status status-"+d.status}
      }
      if(d.status==="completed"||d.status==="failed"){
        hideBar(d.project);
        loadLogs();
      }
      if(d.status==="indexing")showBar(d.project);
    }
  });
}

var phaseLabels={scanning:"扫描文件",chunking:"代码分块",embedding:"生成向量",writing:"写入索引",deps:"提取依赖"};

function showBar(name){
  var wrap=document.getElementById("bar-"+name);
  if(!wrap){
    var item=document.querySelector('[data-name="'+name+'"]');
    if(!item)return;
    wrap=document.createElement("div");
    wrap.className="proj-bar-wrap";
    wrap.id="bar-"+name;
    item.appendChild(wrap);
  }
  wrap.classList.add("visible");
  wrap.innerHTML='<div class="proj-bar-label"><span class="bar-phase">准备中...</span><span class="bar-pct">0%</span></div><div class="proj-bar-track"><div class="proj-bar-fill"></div></div>';
}

function updateBar(name,phase,current,total){
  var wrap=document.getElementById("bar-"+name);
  if(!wrap||!wrap.classList.contains("visible"))showBar(name);
  wrap=document.getElementById("bar-"+name);
  if(!wrap)return;
  var pct=total>0?Math.round(current/total*100):0;
  var label=phaseLabels[phase]||phase;
  var lbl=wrap.querySelector(".bar-phase");
  var pctEl=wrap.querySelector(".bar-pct");
  var fill=wrap.querySelector(".proj-bar-fill");
  if(lbl)lbl.textContent=label;
  if(pctEl)pctEl.textContent=pct+"%";
  if(fill)fill.style.width=pct+"%";
}

function hideBar(name){
  var wrap=document.getElementById("bar-"+name);
  if(wrap)wrap.classList.remove("visible");
}

function selectProject(name){
  document.querySelectorAll(".proj-item").forEach(function(el){
    el.classList.toggle("active",el.dataset.name===name);
  });
  curProj=name;
  if(graphCache[name]){renderGraph(graphCache[name])}
  else{
    fetch("/api/graph/"+encodeURIComponent(name)).then(function(r){return r.json()}).then(function(res){
      if(res.ok){var g=buildFileGraph(res.data);graphCache[name]=g;renderGraph(g)}
    });
  }
}

function buildFileGraph(deps){
  var nodes=deps.nodes||{},edges=deps.edges||[];
  var files={},fileSet={};

  // 第一步：收集所有唯一的文件
  for(var nid in nodes){
    var n=nodes[nid];
    var fp=n.file;
    if(!fileSet[fp]){
      fileSet[fp]=1;
      var parts=fp.split("/");
      var file=parts[parts.length-1];
      var dir=parts.length>1?parts.slice(0,-1).join("/"):"(root)";
      var shortFile=file.replace(/\.(ts|js|tsx)$/,"");
      files[fp]={id:fp,label:shortFile,file:fp,directory:dir,count:0,symbols:[]};
    }
    files[fp].count++;
    if(n.type!=="module"){
      files[fp].symbols.push({symbol:n.symbol,line:n.line,type:n.type});
    }
  }

  // 第二步：构建文件级边（聚合跨文件边）
  var fileEdgesMap={};
  for(var i=0;i<edges.length;i++){
    var e=edges[i];
    var fn=nodes[e.from],tn=nodes[e.to];
    if(!fn||!tn)continue;
    var f1=fn.file,f2=tn.file;
    if(f1&&f2&&f1!==f2){
      var k=f1+"|"+f2;
      if(!fileEdgesMap[k]){
        fileEdgesMap[k]={source:f1,target:f2,weight:0,relations:{}};
      }
      fileEdgesMap[k].weight++;
      fileEdgesMap[k].relations[e.relation]=true;
    }
  }

  // 第三步：构建Cytoscape元素
  var cyNodes=[],cyEdges=[];
  var fileList=Object.keys(files);
  for(var idx=0;idx<fileList.length;idx++){
    var fp=fileList[idx];
    var f=files[fp];
    cyNodes.push({
      data:{
        id:fp,
        label:f.label,
        directory:f.directory,
        fullPath:fp,
        symbolCount:f.count,
        funcCount:f.symbols.length,
        functions:f.symbols,
        weight:Math.min(f.count*2+15,80)
      }
    });
  }

  var edgeIdx=0;
  var edgeList=Object.keys(fileEdgesMap);
  for(var j=0;j<edgeList.length;j++){
    var k=edgeList[j];
    var fe=fileEdgesMap[k];
    var rtypes=Object.keys(fe.relations).join(",");
    cyEdges.push({
      data:{
        id:"e"+edgeIdx,
        source:fe.source,
        target:fe.target,
        weight:fe.weight,
        relation:rtypes
      }
    });
    edgeIdx++;
  }

  return{
    elements:{nodes:cyNodes,edges:cyEdges},
    fileCount:cyNodes.length,
    edgeCount:cyEdges.length
  };
}

function pickLayout(n){
  // Scale layout parameters based on graph size
  var repulsion=n<100?10000:n<200?8000:6000;
  var edgeLen=n<100?120:n<200?100:80;
  return{name:"cose",animate:true,animationDuration:1200,
    nodeRepulsion:repulsion,idealEdgeLength:edgeLen,
    gravity:0.3,padding:40,randomize:true,
    componentSpacing:150,nodeOverlap:20,fit:true,
    initialTemp:200,coolingFactor:0.95,minTemp:1.0};
}

function applyFilter(gd,dir){
  if(!dir)return gd.elements;
  var fn=gd.elements.nodes.filter(function(n){return n.data.directory===dir||n.data.directory.indexOf(dir+"/")===0});
  var ids={};fn.forEach(function(n){ids[n.data.id]=1});
  var fe=gd.elements.edges.filter(function(e){return ids[e.data.source]&&ids[e.data.target]});
  return{nodes:fn,edges:fe};
}

var edgeColors={"imports":"#58a6ff","calls":"#3fb950","implements":"#d29922"};

function renderGraph(gd){
  document.getElementById("ph").style.display="none";
  var dir=document.getElementById("dirFilter").value;
  var els=applyFilter(gd,dir);
  var nc=els.nodes.length,ec=els.edges.length;
  var sel=document.getElementById("dirFilter");
  if(gd.fileCount>50){
    sel.style.display="inline-block";
    sel.innerHTML='<option value="">All ('+gd.fileCount+')</option>';
    gd.directories.sort().forEach(function(d){var o=document.createElement("option");o.value=d;o.textContent=d;sel.appendChild(o)});
    if(dir)sel.value=dir;
  }else{sel.style.display="none"}
  document.getElementById("graphInfo").textContent=nc+" files | "+ec+" dependencies";
  if(cyInst)cyInst.destroy();
  cyInst=cytoscape({
    container:document.getElementById("cy"),
    elements:els,
    style:[
      {selector:"node",style:{"label":"data(label)","background-color":"#1f6feb","color":"#c9d1d9","font-size":"11px",
        "width":"mapData(weight,1,50,25,80)","height":"mapData(weight,1,50,25,80)",
        "text-valign":"center","text-halign":"center","text-wrap":"ellipsis","text-max-width":"80px",
        "border-width":1,"border-color":"#30363d","transition-property":"background-color, width, height",
        "transition-duration":"0.3s"}},
      {selector:"node:selected",style:{"background-color":"#f78166","border-color":"#f78166","border-width":2}},
      {selector:"node:active",style:{"overlay-opacity":0.1}},
      {selector:"edge",style:{"width":"mapData(weight,1,10,1.5,4)","line-color":"#30363d","target-arrow-color":"#30363d",
        "target-arrow-shape":"triangle","curve-style":"bezier","arrow-scale":0.8,
        "opacity":0.7,"transition-property":"opacity, line-color, width","transition-duration":"0.2s"}},
      {selector:"edge[relation=imports]",style:{"line-color":"#58a6ff","target-arrow-color":"#58a6ff"}},
      {selector:"edge[relation=calls]",style:{"line-color":"#3fb950","target-arrow-color":"#3fb950"}},
      {selector:"edge[relation=implements]",style:{"line-color":"#d29922","target-arrow-color":"#d29922"}},
      {selector:".highlighted",style:{"background-color":"#f78166","border-color":"#f78166","z-index":999}},
      {selector:".dimmed",style:{"opacity":0.2}},
      {selector:"edge.highlighted",style:{"opacity":1,"width":2.5}},
      {selector:"edge.dimmed",style:{"opacity":0.05}}
    ],
    layout:pickLayout(nc)
  });
  // hover highlight neighbors
  var tip=document.getElementById("tooltip");
  cyInst.on("mouseover","node",function(ev){
    var node=ev.target;
    var d=node.data();
    var connected=node.neighborhood();
    cyInst.elements().addClass("dimmed");
    node.removeClass("dimmed").addClass("highlighted");
    connected.nodes().removeClass("dimmed").addClass("highlighted");
    connected.edges().removeClass("dimmed").addClass("highlighted");
    tip.textContent=d.label+" ("+d.symbolCount+" symbols)";
    tip.style.display="block";
    tip.style.left=ev.originalEvent.clientX+12+"px";
    tip.style.top=ev.originalEvent.clientY+12+"px";
  });
  cyInst.on("mouseout","node",function(){
    cyInst.elements().removeClass("dimmed").removeClass("highlighted");
    tip.style.display="none";
  });
  cyInst.on("tap","node",function(ev){
    var d=ev.target.data();
    var det=document.getElementById("nodeDetail");
    det.classList.add("visible");
    document.getElementById("ndTitle").textContent=d.fullPath;
    document.getElementById("ndMeta").textContent="Dir: "+d.directory+" | Functions: "+d.funcCount;
    var ul=document.getElementById("funcList");ul.innerHTML="";
    (d.functions||[]).forEach(function(f){
      var li=document.createElement("li");li.className="func-item";
      li.innerHTML='<span class="sym">'+esc(f.symbol)+'</span> <span class="ln">:'+f.line+" "+f.type+"</span>";
      ul.appendChild(li);
    });
  });
  cyInst.on("tap",function(ev){
    if(ev.target===cyInst){
      document.getElementById("nodeDetail").classList.remove("visible");
      cyInst.elements().unselect();
    }
  });
}

function edgesOf(node){return node.connectedEdges().connectedNodes().edgesWith(node)}

// --- Search ---
function doSearch(){
  var q=document.getElementById("searchInput").value.trim();
  if(!q)return;
  var url="/api/search?q="+encodeURIComponent(q);
  if(curProj)url+="&project="+encodeURIComponent(curProj);
  else url+="&project=all";
  fetch(url).then(function(r){return r.json()}).then(function(res){
    var box=document.getElementById("searchResults");
    box.classList.add("visible");
    if(!res.ok||!res.data||!res.data.length){box.innerHTML='<div style="color:#8b949e;padding:8px">无结果</div>';return}
    box.innerHTML=res.data.map(function(r){
      return '<div class="sr-item"><span class="sr-sym">'+esc(r.symbol)+'</span><span class="sr-score">'+r.score.toFixed(2)+'</span>'
        +'<div class="sr-file">'+esc(r.file)+":"+r.lineStart+'</div>'
        +'<div class="sr-text">'+esc(r.text.substring(0,150))+'</div></div>';
    }).join("");
  }).catch(function(e){
    var box=document.getElementById("searchResults");
    box.classList.add("visible");
    box.innerHTML='<div style="color:#f85149;padding:8px">搜索失败: '+esc(e.message)+'</div>';
  });
}

// --- Actions ---
function triggerAction(name,action){
  var btn=event.target;btn.disabled=true;btn.textContent="...";
  fetch("/api/"+action+"/"+encodeURIComponent(name),{method:"POST"})
    .then(function(r){return r.json()})
    .then(function(res){btn.disabled=false;btn.textContent=action==="index"?"重建索引":"增量更新";if(!res.ok)alert(res.error||"操作失败")})
    .catch(function(e){btn.disabled=false;btn.textContent=action==="index"?"重建索引":"增量更新";alert(e.message)});
}

function showLogs(){
  var panel=document.getElementById("logPanel");
  panel.classList.toggle("visible");
  if(panel.classList.contains("visible"))loadLogs();
}

function loadLogDates(){
  fetch("/api/logs/dates").then(function(r){return r.json()}).then(function(res){
    if(!res.ok)return;
    var sel=document.getElementById("logDateFilter");
    sel.innerHTML='<option value="">今天</option>';
    res.data.forEach(function(d){
      var o=document.createElement("option");o.value=d;o.textContent=d;sel.appendChild(o);
    });
  });
}

function loadLogs(){
  var date=document.getElementById("logDateFilter").value;
  var action=document.getElementById("logActionFilter").value;
  var url="/api/logs?limit=100";
  if(curProj)url+="&project="+encodeURIComponent(curProj);
  if(date)url+="&date="+encodeURIComponent(date);
  if(action)url+="&action="+encodeURIComponent(action);
  fetch(url).then(function(r){return r.json()}).then(function(res){
    var body=document.getElementById("logBody");
    if(!res.ok||!res.data||!res.data.length){body.innerHTML='<div class="log-empty">暂无日志记录</div>';return}
    body.innerHTML=res.data.map(function(l){
      var stCls="log-st "+l.status;
      var dur=l.durationMs?('<span class="log-dur">'+l.durationMs+'ms</span>'):"";
      var err=l.error?('<div class="log-err">'+esc(l.error)+'</div>'):"";
      var t=new Date(l.time);
      var ts=t.toLocaleTimeString();
      return '<div class="log-row"><span class="log-time">'+ts+'</span>'
        +' <span class="log-action '+l.action+'">'+l.action+'</span>'
        +' <span class="'+stCls+'">'+l.status+'</span>'+dur
        +' <span style="color:#8b949e;font-size:10px">'+esc(l.project)+'</span>'
        +err+'</div>';
    }).join("");
  });
}

function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}
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
