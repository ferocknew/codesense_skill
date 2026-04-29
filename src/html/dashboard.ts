export function getDashboardJS(): string {
  return `
var curProj=null,graphCache={},myChart=null;

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

  var ecNodes=[],ecLinks=[];
  var fileList=Object.keys(files);
  var colors=["#1f6feb","#58a6ff","#3fb950","#d29922","#f78166","#bc8cff","#79c0ff","#56d364","#e3b341","#ff7b72"];

  for(var idx=0;idx<fileList.length;idx++){
    var fp=fileList[idx];
    var f=files[fp];
    var size=Math.max(12,Math.min(f.count*3+10,50));
    ecNodes.push({
      name:fp,
      label:f.label,
      symbolSize:size,
      value:f.count,
      category:idx%colors.length,
      fullPath:fp,
      directory:f.directory,
      symbolCount:f.count,
      funcCount:f.symbols.length,
      functions:f.symbols,
      itemStyle:{color:colors[idx%colors.length],borderColor:"#30363d",borderWidth:1},
      label:{show:size>18,fontSize:10,color:"#c9d1d9"}
    });
  }

  var edgeList=Object.keys(fileEdgesMap);
  for(var j=0;j<edgeList.length;j++){
    var k=edgeList[j];
    var fe=fileEdgesMap[k];
    var rtypes=Object.keys(fe.relations).join(",");
    var lineColor={"imports":"#58a6ff","calls":"#3fb950","implements":"#d29922"}[rtypes]||"#30363d";
    ecLinks.push({
      source:fe.source,
      target:fe.target,
      value:fe.weight,
      lineStyle:{color:lineColor,curveness:0.2,width:Math.min(fe.weight+1,4)}
    });
  }

  return{nodes:ecNodes,links:ecLinks,fileCount:ecNodes.length,edgeCount:ecLinks.length};
}

function renderGraph(gd){
  document.getElementById("ph").style.display="none";
  document.getElementById("graphInfo").textContent=gd.fileCount+" files | "+gd.edgeCount+" dependencies";

  if(!myChart){
    myChart=echarts.init(document.getElementById("graph"),"dark");
    myChart.on("click",function(params){
      if(params.dataType==="node"){
        var d=params.data;
        var det=document.getElementById("nodeDetail");
        det.classList.add("visible");
        document.getElementById("ndTitle").textContent=d.fullPath||d.name;
        document.getElementById("ndMeta").textContent="Dir: "+d.directory+" | Functions: "+d.funcCount;
        var ul=document.getElementById("funcList");ul.innerHTML="";
        (d.functions||[]).forEach(function(f){
          var li=document.createElement("li");li.className="func-item";
          li.innerHTML='<span class="sym">'+esc(f.symbol)+'</span> <span class="ln">:'+f.line+" "+f.type+"</span>";
          ul.appendChild(li);
        });
      }
    });
  }

  var option={
    backgroundColor:"#0d1117",
    tooltip:{
      trigger:"item",
      backgroundColor:"#21262d",
      borderColor:"#30363d",
      textStyle:{color:"#c9d1d9",fontSize:12},
      formatter:function(params){
        if(params.dataType==="node"){
          var d=params.data;
          return '<b>'+esc(d.label||d.name)+'</b><br/>'
            +'<span style="color:#8b949e">'+esc(d.directory)+'</span><br/>'
            +d.symbolCount+' symbols';
        }
        if(params.dataType==="edge"){
          return params.data.source+' → '+params.data.target+' ('+params.data.value+')';
        }
        return "";
      }
    },
    animationDuration:1500,
    animationEasingUpdate:"quinticInOut",
    series:[{
      type:"graph",
      layout:"force",
      data:gd.nodes,
      links:gd.links,
      roam:true,
      zoom:1,
      focusNodeAdjacency:true,
      draggable:true,
      force:{
        repulsion:gd.fileCount<30?300:gd.fileCount<60?200:150,
        gravity:0.05,
        edgeLength:gd.fileCount<30?[80,200]:[60,150],
        friction:0.6
      },
      itemStyle:{
        borderColor:"#30363d",
        borderWidth:1,
        shadowBlur:5,
        shadowColor:"rgba(0,0,0,0.3)"
      },
      label:{
        position:"right",
        formatter:"{b}",
        fontSize:10,
        color:"#c9d1d9"
      },
      lineStyle:{
        opacity:0.6,
        curveness:0.2
      },
      emphasis:{
        focus:"adjacency",
        lineStyle:{width:4},
        itemStyle:{borderWidth:3,borderColor:"#f78166"}
      }
    }]
  };
  myChart.setOption(option,true);
}

window.addEventListener("resize",function(){if(myChart)myChart.resize()});

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
`;
}
