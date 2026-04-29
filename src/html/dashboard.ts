export function getDashboardJS(): string {
  return `
var curProj=null,graphCache={},sigmaInstance=null,graphologyGraph=null;

// 初始化
document.querySelectorAll(".proj-item").forEach(function(el){
  el.addEventListener("click",function(){selectProject(el.dataset.name)});
});
document.getElementById("searchBtn").addEventListener("click",doSearch);
document.getElementById("searchInput").addEventListener("keydown",function(e){if(e.key==="Enter")doSearch()});
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
      +'<button class="btn" onclick="event.stopPropagation();triggerAction(\\''+esc(d.name)+'\\',\\'update\\')">增量更新</button> '
      +'<button class="btn" onclick="event.stopPropagation();triggerAction(\\''+esc(d.name)+'\\',\\'index\\')">重建索引</button> '
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
es.addEventListener("project-removed",function(e){
  var d=JSON.parse(e.data);
  var el=document.querySelector('[data-name="'+d.name+'"]');
  if(el)el.remove();
});

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

  for(var nid in nodes){
    var n=nodes[nid];
    var fp=n.file;
    if(!fileSet[fp]){
      fileSet[fp]=1;
      var parts=fp.split("/");
      var file=parts[parts.length-1];
      var dir=parts.length>1?parts.slice(0,-1).join("/"):"(root)";
      var shortFile=file.replace(/\\\\.(ts|js|tsx|json|md)$/,"");
      files[fp]={id:fp,label:shortFile,file:fp,directory:dir,count:0,symbols:[]};
    }
    files[fp].count++;
    if(n.type!=="module"){
      files[fp].symbols.push({symbol:n.symbol,line:n.line,type:n.type});
    }
  }

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

  var gNodes=[],gEdges=[];
  var fileList=Object.keys(files);
  var colors=["#38bdf8","#a78bfa","#22c55e","#f59e0b","#f472b6","#818cf8","#34d399","#fbbf24","#fb923c","#e879f9"];

  for(var idx=0;idx<fileList.length;idx++){
    var fp=fileList[idx];
    var f=files[fp];
    var size=Math.max(8,Math.min(f.count*2+6,20));
    // 随机位置
    gNodes.push({
      id:fp,
      label:f.label,
      size:size,
      color:colors[idx%colors.length],
      type:"module",
      fullPath:fp,
      directory:f.directory,
      symbolCount:f.count,
      funcCount:f.symbols.length,
      functions:f.symbols,
      x:Math.random()*100,
      y:Math.random()*100
    });
  }

  var edgeList=Object.keys(fileEdgesMap);
  for(var j=0;j<edgeList.length;j++){
    var k=edgeList[j];
    var fe=fileEdgesMap[k];
    var rtypes=Object.keys(fe.relations).join(",");
    var edgeColor={"imports":"#38bdf8","calls":"#22c55e","implements":"#f59e0b"}[rtypes]||"#334155";
    gEdges.push({
      source:fe.source,
      target:fe.target,
      size:Math.min(fe.weight*0.5+0.5,2),
      color:edgeColor,
      weight:fe.weight,
      label:rtypes
    });
  }

  return{nodes:gNodes,edges:gEdges,fileCount:gNodes.length,edgeCount:gEdges.length};
}

function renderGraph(gd){
  document.getElementById("ph").style.display="none";
  document.getElementById("graphInfo").textContent=gd.fileCount+" files | "+gd.edgeCount+" dependencies";
  document.getElementById("nodeCount").textContent=gd.fileCount;

  // 销毁旧实例
  if(sigmaInstance){sigmaInstance.kill();sigmaInstance=null}
  if(graphologyGraph){graphologyGraph.clear();graphologyGraph=null}

  // 创建 Graphology 图
  graphologyGraph=new graphology.Graph();

  gd.nodes.forEach(function(n){
    graphologyGraph.addNode(n.id,{
      x:n.x,
      y:n.y,
      size:n.size,
      color:n.color,
      label:n.label,
      _data:n
    });
  });

  gd.edges.forEach(function(e){
    var key=e.source+"->"+e.target;
    if(!graphologyGraph.hasEdge(key)){
      try{
        graphologyGraph.addEdgeWithKey(key,e.source,e.target,{
          size:e.size,
          color:e.color,
          type:"arrow",
          _data:e
        });
      }catch(err){}
    }
  });

  // 创建 Sigma 渲染器
  sigmaInstance=new Sigma(graphologyGraph,document.getElementById("graph"),{
    renderLabels:true,
    labelDensity:0.07,
    labelGridCellSize:60,
    labelColor:{color:"#94a3b8"},
    labelFont:"11px Inter, system-ui, sans-serif"
  });

  // 力导向动画（延迟启动确保渲染器就绪）
  setTimeout(function(){
    var animSteps=0;
    var maxSteps=150;
    function applyForceLayout(){
      if(animSteps>=maxSteps)return;
      animSteps++;
      var nodePositions={};
      graphologyGraph.forEachNode(function(node,attrs){
        nodePositions[node]={x:attrs.x,y:attrs.y,vx:0,vy:0};
      });
      // 斥力
      var nodeList=Object.keys(nodePositions);
      for(var i=0;i<nodeList.length;i++){
        for(var j=i+1;j<nodeList.length;j++){
          var n1=nodeList[i],n2=nodeList[j];
          var dx=nodePositions[n2].x-nodePositions[n1].x;
          var dy=nodePositions[n2].y-nodePositions[n1].y;
          var dist=Math.sqrt(dx*dx+dy*dy)||1;
          var force=400/(dist*dist);
          var fx=force*dx/dist,fy=force*dy/dist;
          nodePositions[n1].vx-=fx;nodePositions[n1].vy-=fy;
          nodePositions[n2].vx+=fx;nodePositions[n2].vy+=fy;
        }
      }
      // 引力（边）
      graphologyGraph.forEachEdge(function(edge,attrs,source,target){
        if(!nodePositions[source]||!nodePositions[target])return;
        var dx=nodePositions[target].x-nodePositions[source].x;
        var dy=nodePositions[target].y-nodePositions[source].y;
        var dist=Math.sqrt(dx*dx+dy*dy)||1;
        var force=(dist-60)*0.008;
        nodePositions[source].vx+=force*dx/dist;
        nodePositions[source].vy+=force*dy/dist;
        nodePositions[target].vx-=force*dx/dist;
        nodePositions[target].vy-=force*dy/dist;
      });
      // 中心引力（拉回画布中心）
      nodeList.forEach(function(node){
        var p=nodePositions[node];
        var dist=Math.sqrt(p.x*p.x+p.y*p.y)||1;
        var force=0.002;
        p.vx-=force*p.x/dist;
        p.vy-=force*p.y/dist;
      });
      // 更新位置
      graphologyGraph.forEachNode(function(node){
        var p=nodePositions[node];
        if(p){
          p.x+=p.vx*0.05;
          p.y+=p.vy*0.05;
          graphologyGraph.setNodeAttribute(node,"x",p.x);
          graphologyGraph.setNodeAttribute(node,"y",p.y);
        }
      });
      try{sigmaInstance.refresh()}catch(e){}
      requestAnimationFrame(applyForceLayout);
    }
    applyForceLayout();
  },50);

  // 节点点击
  sigmaInstance.on("clickNode",function(params){
    var node=params.node;
    var attrs=graphologyGraph.getNodeAttributes(node);
    var d=attrs._data||{};
    var det=document.getElementById("nodeDetail");
    det.classList.add("visible");
    document.getElementById("ndTitle").textContent=d.fullPath||attrs.label;
    document.getElementById("ndMeta").textContent="Dir: "+(d.directory||"-")+" | Symbols: "+(d.symbolCount||0);
    var ul=document.getElementById("funcList");ul.innerHTML="";
    (d.functions||[]).forEach(function(f){
      var li=document.createElement("li");li.className="func-item";
      li.innerHTML='<span class="sym">'+esc(f.symbol)+'</span> <span class="ln">:'+f.line+" "+f.type+"</span>";
      ul.appendChild(li);
    });
  });

  // 点击空白处取消高亮
  sigmaInstance.on("clickStage",function(){
    document.getElementById("nodeDetail").classList.remove("visible");
  });
}

window.addEventListener("resize",function(){
  if(sigmaInstance)sigmaInstance.refresh();
});

function doSearch(){
  var q=document.getElementById("searchInput").value.trim();
  if(!q)return;
  var url="/api/search?q="+encodeURIComponent(q);
  if(curProj)url+="&project="+encodeURIComponent(curProj);
  else url+="&project=all";
  fetch(url).then(function(r){return r.json()}).then(function(res){
    var box=document.getElementById("searchResults");
    box.classList.add("visible");
    if(!res.ok||!res.data||!res.data.length){box.innerHTML='<div style="color:#64748b;padding:12px">无结果</div>';return}
    box.innerHTML=res.data.map(function(r){
      return '<div class="sr-item"><span class="sr-sym">'+esc(r.symbol)+'</span><span class="sr-score">'+r.score.toFixed(2)+'</span>'
        +'<div class="sr-file">'+esc(r.file)+":"+r.lineStart+'</div>'
        +'<div class="sr-text">'+esc(r.text.substring(0,150))+'</div></div>';
    }).join("");
  }).catch(function(e){
    var box=document.getElementById("searchResults");
    box.classList.add("visible");
    box.innerHTML='<div style="color:#ef4444;padding:12px">搜索失败: '+esc(e.message)+'</div>';
  });
}

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
        +' <span style="color:#64748b;font-size:10px">'+esc(l.project)+'</span>'
        +err+'</div>';
    }).join("");
  });
}

function esc(s){var d=document.createElement("div");d.textContent=s;return d.innerHTML}
`;
}
