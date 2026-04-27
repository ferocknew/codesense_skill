import * as fs from "fs";
import * as path from "path";
import { DepGraph, TraceNode, OUTPUT_DIR } from "./types";
import { loadDepGraph } from "./graph";
import { getOutputDir } from "./config";

export interface TraceOptions {
  depth?: number;
  direction?: "callers" | "callees" | "both";
  format?: "tree" | "json" | "dot";
  baseDir?: string;
}

// 查找索引目录（向上搜索）
function findIndexDir(startDir: string): string | null {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(dir, OUTPUT_DIR, "deps.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// 模糊匹配符号名
function findMatchingNodes(graph: DepGraph, symbol: string): Array<{ id: string; node: any }> {
  const lowerSymbol = symbol.toLowerCase();
  const matches: Array<{ id: string; node: any }> = [];

  for (const [id, node] of Object.entries(graph.nodes)) {
    if (
      node.symbol.toLowerCase() === lowerSymbol ||
      node.symbol.toLowerCase().includes(lowerSymbol)
    ) {
      matches.push({ id, node });
    }
  }

  return matches;
}

// BFS 追踪
function bfsTrace(
  graph: DepGraph,
  startId: string,
  direction: "callers" | "callees",
  maxDepth: number
): TraceNode[] {
  const visited = new Set<string>();
  const results: TraceNode[] = [];

  function walk(currentId: string, depth: number) {
    if (depth > maxDepth || visited.has(currentId)) return;
    visited.add(currentId);

    const edges =
      direction === "callers"
        ? graph.edges.filter((e) => e.to === currentId)
        : graph.edges.filter((e) => e.from === currentId);

    for (const edge of edges) {
      const targetId = direction === "callers" ? edge.from : edge.to;
      const targetNode = graph.nodes[targetId];
      if (!targetNode) continue;

      const traceNode: TraceNode = {
        symbol: targetNode.symbol,
        file: targetNode.file,
        line: targetNode.line,
        type: targetNode.type,
        relation: edge.relation,
        children: [],
      };

      if (depth < maxDepth) {
        walk(targetId, depth + 1);
        // 收集子节点
        const childEdges =
          direction === "callers"
            ? graph.edges.filter((e) => e.to === targetId)
            : graph.edges.filter((e) => e.from === targetId);

        for (const ce of childEdges) {
          const childId = direction === "callers" ? ce.from : ce.to;
          const childNode = graph.nodes[childId];
          if (childNode && visited.has(childId)) {
            traceNode.children.push({
              symbol: childNode.symbol,
              file: childNode.file,
              line: childNode.line,
              type: childNode.type,
              relation: ce.relation,
              children: [],
            });
          }
        }
      }

      results.push(traceNode);
    }
  }

  walk(startId, 1);
  return results;
}

// 格式化为树形文本
function formatTree(
  symbol: string,
  file: string,
  line: number,
  callers: TraceNode[],
  callees: TraceNode[],
  direction: string
): string {
  const lines: string[] = [];
  lines.push(`${symbol} [${file}:${line}]`);

  if ((direction === "callers" || direction === "both") && callers.length > 0) {
    lines.push("  ├── callers (谁调用了它)");
    for (let i = 0; i < callers.length; i++) {
      const c = callers[i];
      const prefix = i === callers.length - 1 ? "  │   └──" : "  │   ├──";
      lines.push(`${prefix} ${c.symbol} [${c.file}:${c.line}]`);
    }
  }

  if ((direction === "callees" || direction === "both") && callees.length > 0) {
    lines.push("  └── callees (它调用了谁)");
    for (let i = 0; i < callees.length; i++) {
      const c = callees[i];
      const prefix = i === callees.length - 1 ? "      └──" : "      ├──";
      lines.push(`${prefix} ${c.symbol} [${c.file}:${c.line}]`);
    }
  }

  if (callers.length === 0 && callees.length === 0) {
    lines.push("  (无依赖关系)");
  }

  return lines.join("\n");
}

// 格式化为 DOT
function formatDot(
  symbol: string,
  file: string,
  line: number,
  callers: TraceNode[],
  callees: TraceNode[]
): string {
  const lines: string[] = ["digraph {"];
  const centerId = `"${symbol}"`;
  lines.push(`  ${centerId} [label="${symbol}\\n${file}:${line}", shape=box, style=filled, fillcolor=lightblue];`);

  for (const c of callers) {
    const id = `"${c.symbol}"`;
    lines.push(`  ${id} [label="${c.symbol}\\n${c.file}:${c.line}"];`);
    lines.push(`  ${id} -> ${centerId} [label="${c.relation}"];`);
  }

  for (const c of callees) {
    const id = `"${c.symbol}"`;
    lines.push(`  ${id} [label="${c.symbol}\\n${c.file}:${c.line}"];`);
    lines.push(`  ${centerId} -> ${id} [label="${c.relation}"];`);
  }

  lines.push("}");
  return lines.join("\n");
}

export async function trace(symbol: string, options: TraceOptions = {}): Promise<void> {
  const depth = options.depth || 3;
  const direction = options.direction || "both";
  const format = options.format || "tree";

  const indexDir = findIndexDir(options.baseDir || ".");
  if (!indexDir) {
    console.error("未找到索引。运行 `codesense index <目录>` 建立索引。");
    process.exit(1);
  }

  const depsPath = path.join(getOutputDir(indexDir), "deps.json");
  const graph = loadDepGraph(depsPath);

  // 查找匹配节点
  const matches = findMatchingNodes(graph, symbol);
  if (matches.length === 0) {
    console.log(`未找到符号: ${symbol}`);
    return;
  }

  // 对每个匹配节点进行追踪
  const results = matches.map(({ id, node }) => {
    let callers: TraceNode[] = [];
    let callees: TraceNode[] = [];

    if (direction === "callers" || direction === "both") {
      callers = bfsTrace(graph, id, "callers", depth);
    }
    if (direction === "callees" || direction === "both") {
      callees = bfsTrace(graph, id, "callees", depth);
    }

    return { node, callers, callees };
  });

  // 输出
  for (const { node, callers, callees } of results) {
    switch (format) {
      case "json":
        console.log(JSON.stringify({ symbol: node.symbol, file: node.file, line: node.line, callers, callees }, null, 2));
        break;
      case "dot":
        console.log(formatDot(node.symbol, node.file, node.line, callers, callees));
        break;
      case "tree":
      default:
        console.log(formatTree(node.symbol, node.file, node.line, callers, callees, direction));
        break;
    }
  }
}
