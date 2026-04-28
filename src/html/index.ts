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
.search-box{padding:8px;border-bottom:1px solid #30363d;display:flex;gap:6px}
.search-box input{flex:1;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;padding:6px 10px;border-radius:4px;font-size:12px}
.search-box input:focus{outline:none;border-color:#58a6ff}
.search-box button{background:#21262d;color:#c9d1d9;border:1px solid #30363d;padding:6px 10px;border-radius:4px;cursor:pointer;font-size:12px}
.search-box button:hover{background:#30363d}
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
.proj-actions{margin-top:4px;display:flex;gap:4px}
.proj-actions .btn{font-size:10px;padding:2px 6px}
.btn{background:#21262d;color:#c9d1d9;border:1px solid #30363d;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px}
.btn:hover{background:#30363d}
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
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.toolbar{padding:6px 16px;background:#161b22;border-bottom:1px solid #30363d;display:flex;align-items:center;gap:10px;min-height:38px}
.toolbar select{background:#0d1117;border:1px solid #30363d;color:#c9d1d9;padding:3px 8px;border-radius:4px;font-size:12px}
.toolbar .info{color:#8b949e;font-size:12px;margin-left:auto}
.graph-wrap{flex:1;position:relative}
#cy{width:100%;height:100%;position:absolute;top:0;left:0}
.placeholder{display:flex;align-items:center;justify-content:center;height:100%;color:#484f58;font-size:14px}
#tooltip{display:none;position:fixed;background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:4px 8px;border-radius:4px;font-size:11px;pointer-events:none;z-index:1000;max-width:300px}
</style>
</head>
<body>
<div class="app">
<div class="sidebar">
  <div class="sidebar-hd"><h1>codesense</h1><span id="uptime">${uptime}</span></div>
  <div class="search-box">
    <input type="text" id="searchInput" placeholder="语义搜索..." />
    <button id="searchBtn">搜索</button>
  </div>
  <div class="search-results" id="searchResults"></div>
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
    <select id="dirFilter" style="display:none"><option value="">All</option></select>
    <span class="info" id="graphInfo">Click a project to view graph</span>
  </div>
  <div class="graph-wrap">
    <div class="placeholder" id="ph">Click a project in the sidebar to view its dependency graph</div>
    <div id="cy"></div>
  </div>
</div>
</div>
<div id="tooltip"></div>
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
  // SSE
  var es=new EventSource("/api/events");
  es.onmessage=function(e){
    var d=JSON.parse(e.data);
    if(d.type==="state"&&d.project){
      var el=document.querySelector('[data-name="'+d.project+'"]');
      if(el){
        var dot=el.querySelector(".status");
        if(dot){dot.className="status status-"+d.status}
      }
    }
  };
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
  var fm={},dirs={};
  for(var nid in nodes){
    var n=nodes[nid];
    if(!fm[n.file])fm[n.file]={functions:[],ids:[]};
    fm[n.file].functions.push({id:nid,symbol:n.symbol,line:n.line,type:n.type});
    fm[n.file].ids.push(nid);
  }
  var feSet={},feArr=[];
  for(var i=0;i<edges.length;i++){
    var e=edges[i],fn=nodes[e.from],tn=nodes[e.to];
    if(!fn||!tn||fn.file===tn.file)continue;
    var k=fn.file+"::"+tn.file;
    if(!feSet[k]){feSet[k]=1;feArr.push({source:fn.file,target:tn.file,relation:e.relation})}
  }
  var cyNodes=[],cyEdges=[];
  for(var fp in fm){
    var parts=fp.split("/"),dir=parts.length>1?parts.slice(0,-1).join("/"):"(root)";
    dirs[dir]=(dirs[dir]||0)+1;
    cyNodes.push({data:{id:fp,label:parts[parts.length-1],fullPath:fp,directory:dir,funcCount:fm[fp].functions.length,functions:fm[fp].functions}});
  }
  for(var j=0;j<feArr.length;j++){
    cyEdges.push({data:{id:"e"+j,source:feArr[j].source,target:feArr[j].target,relation:feArr[j].relation}});
  }
  return{elements:{nodes:cyNodes,edges:cyEdges},directories:Object.keys(dirs),fileCount:cyNodes.length};
}

function pickLayout(n){
  if(n<500)return{name:"cose",animate:true,animationDuration:500,nodeRepulsion:8000,idealEdgeLength:100,gravity:.25,padding:30};
  if(n<2000)return{name:"cose",animate:false,nodeRepulsion:4500,idealEdgeLength:50,gravity:.4,padding:20};
  return{name:"cose",animate:false,nodeRepulsion:3000,idealEdgeLength:30,gravity:.6,padding:15};
}

function applyFilter(gd,dir){
  if(!dir)return gd.elements;
  var fn=gd.elements.nodes.filter(function(n){return n.data.directory===dir||n.data.directory.indexOf(dir+"/")===0});
  var ids={};fn.forEach(function(n){ids[n.data.id]=1});
  var fe=gd.elements.edges.filter(function(e){return ids[e.data.source]&&ids[e.data.target]});
  return{nodes:fn,edges:fe};
}

function renderGraph(gd){
  document.getElementById("ph").style.display="none";
  var dir=document.getElementById("dirFilter").value;
  var els=applyFilter(gd,dir);
  var nc=els.nodes.length,ec=els.edges.length;
  // update dir filter
  var sel=document.getElementById("dirFilter");
  if(gd.fileCount>50){
    sel.style.display="inline-block";
    sel.innerHTML='<option value="">All ('+gd.fileCount+')</option>';
    gd.directories.sort().forEach(function(d){var o=document.createElement("option");o.value=d;o.textContent=d;sel.appendChild(o)});
    if(dir)sel.value=dir;
  }else{sel.style.display="none"}
  document.getElementById("graphInfo").textContent=nc+" files | "+ec+" edges";
  if(cyInst)cyInst.destroy();
  cyInst=cytoscape({
    container:document.getElementById("cy"),
    elements:els,
    style:[
      {selector:"node",style:{"label":"data(label)","background-color":"#1f6feb","color":"#c9d1d9","font-size":"10px",
        "width":"mapData(funcCount,1,50,20,60)","height":"mapData(funcCount,1,50,20,60)",
        "text-valign":"center","text-halign":"center","text-wrap":"ellipsis","text-max-width":"80px",
        "border-width":1,"border-color":"#30363d"}},
      {selector:"node:selected",style:{"background-color":"#f78166","border-color":"#f78166","border-width":2}},
      {selector:"edge",style:{"width":1,"line-color":"#30363d","target-arrow-color":"#30363d",
        "target-arrow-shape":"triangle","curve-style":"bezier","arrow-scale":.6}}
    ],
    layout:pickLayout(nc)
  });
  // events
  var tip=document.getElementById("tooltip");
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
  cyInst.on("mouseover","node",function(ev){
    var d=ev.target.data();
    tip.textContent=d.fullPath+" ("+d.funcCount+" fn)";
    tip.style.display="block";
    tip.style.left=ev.originalEvent.clientX+12+"px";
    tip.style.top=ev.originalEvent.clientY+12+"px";
  });
  cyInst.on("mouseout","node",function(){tip.style.display="none"});
}

function doSearch(){
  var q=document.getElementById("searchInput").value.trim();
  if(!q)return;
  var proj=curProj||"";
  var url="/api/search?q="+encodeURIComponent(q);
  if(proj)url+="&project="+encodeURIComponent(proj);
  fetch(url).then(function(r){return r.json()}).then(function(res){
    var box=document.getElementById("searchResults");
    box.classList.add("visible");
    if(!res.ok||!res.data||!res.data.length){box.innerHTML='<div style="color:#8b949e;padding:8px">无结果</div>';return}
    box.innerHTML=res.data.map(function(r){
      return '<div class="sr-item"><span class="sr-sym">'+esc(r.symbol)+'</span><span class="sr-score">'+r.score.toFixed(2)+'</span>'
        +'<div class="sr-file">'+esc(r.filePath)+":"+r.lineStart+'</div>'
        +'<div class="sr-text">'+esc(r.text.substring(0,150))+'</div></div>';
    }).join("");
  });
}
function triggerAction(name,action){
  var btn=event.target;btn.disabled=true;btn.textContent="...";
  fetch("/api/"+action+"/"+encodeURIComponent(name),{method:"POST"})
    .then(function(r){return r.json()})
    .then(function(res){btn.disabled=false;btn.textContent=action==="index"?"重建索引":"增量更新";if(!res.ok)alert(res.error||"操作失败")})
    .catch(function(e){btn.disabled=false;btn.textContent=action==="index"?"重建索引":"增量更新";alert(e.message)});
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
  </div>
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
