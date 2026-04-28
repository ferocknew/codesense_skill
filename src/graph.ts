import { DepGraph } from "./types";
import { dbLoadDepGraph, dbSaveDepGraph, dbRemoveFileFromGraph } from "./database";

export function emptyDepGraph(): DepGraph {
  return { nodes: {}, edges: [] };
}

function nodeId(filePath: string, symbol: string): string {
  const stem = filePath.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const sym = symbol.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  return `${stem}_${sym}`;
}

// 从 tree-sitter AST 提取依赖关系
export function extractDeps(filePath: string, content: string, language: string): DepGraph {
  const graph = emptyDepGraph();

  switch (language) {
    case "python":
      return extractPythonDeps(filePath, content, graph);
    case "javascript":
    case "typescript":
    case "tsx":
      return extractTSDeps(filePath, content, graph);
    default:
      return graph;
  }
}

function extractPythonDeps(filePath: string, content: string, graph: DepGraph): DepGraph {
  const lines = content.split("\n");
  const importMap: Record<string, string> = {};
  const functionNames: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // import X / from X import Y
    const fromImport = trimmed.match(/^from\s+(\S+)\s+import\s+(.+)/);
    if (fromImport) {
      const module = fromImport[1];
      const names = fromImport[2].split(",").map((n) => n.trim().split(" as ")[0]);
      for (const name of names) {
        if (name && name !== "*") {
          importMap[name] = module;
        }
      }
    }

    const bareImport = trimmed.match(/^import\s+(.+)/);
    if (bareImport) {
      const modules = bareImport[1].split(",").map((m) => m.trim().split(" as ")[0]);
      for (const mod of modules) {
        if (mod) importMap[mod] = mod;
      }
    }

    // function/class 定义
    const funcMatch = trimmed.match(/^(async\s+)?def\s+(\w+)/);
    if (funcMatch) {
      functionNames.push(funcMatch[2]);
    }

    const classMatch = trimmed.match(/^class\s+(\w+)/);
    if (classMatch) {
      functionNames.push(classMatch[1]);
    }
  }

  // 添加节点
  for (const fn of functionNames) {
    const lineNum = content.indexOf(fn) > -1 ? content.substring(0, content.indexOf(fn)).split("\n").length : 0;
    const id = nodeId(filePath, fn);
    graph.nodes[id] = { symbol: fn, file: filePath, line: lineNum, type: "function" };
  }

  // 从函数体中提取调用关系
  const funcPattern = /(?:async\s+)?def\s+(\w+)\s*\([^)]*\)[^:]*:\s*\n((?:[ \t]+.+\n)*)/g;
  let match;
  while ((match = funcPattern.exec(content)) !== null) {
    const caller = match[1];
    const body = match[2];
    const callerId = nodeId(filePath, caller);

    // 查找函数调用
    const callPattern = /(\w+)\s*\(/g;
    let callMatch;
    while ((callMatch = callPattern.exec(body)) !== null) {
      const callee = callMatch[1];
      if (callee === caller) continue;
      if (["print", "len", "range", "str", "int", "float", "list", "dict", "set", "tuple", "type", "isinstance"].includes(callee)) continue;

      const calleeId = nodeId(filePath, callee);
      // 只记录本文件内的调用
      if (graph.nodes[calleeId]) {
        graph.edges.push({
          from: callerId,
          to: calleeId,
          relation: "calls",
          confidence: "EXTRACTED",
        });
      }
    }
  }

  return graph;
}

function extractTSDeps(filePath: string, content: string, graph: DepGraph): DepGraph {
  const functionNames: string[] = [];

  // function declarations
  const funcPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
  let match;
  while ((match = funcPattern.exec(content)) !== null) {
    functionNames.push(match[1]);
  }

  // class declarations
  const classPattern = /(?:export\s+)?(?:default\s+)?class\s+(\w+)/g;
  while ((match = classPattern.exec(content)) !== null) {
    functionNames.push(match[1]);
  }

  // const fn = ... / arrow functions
  const arrowPattern = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>/g;
  while ((match = arrowPattern.exec(content)) !== null) {
    functionNames.push(match[1]);
  }

  // 添加节点
  for (const fn of functionNames) {
    const idx = content.indexOf(fn);
    const lineNum = idx > -1 ? content.substring(0, idx).split("\n").length : 0;
    const id = nodeId(filePath, fn);
    graph.nodes[id] = { symbol: fn, file: filePath, line: lineNum, type: "function" };
  }

  return graph;
}

export function mergeDepGraphs(graphs: DepGraph[]): DepGraph {
  const merged = emptyDepGraph();
  for (const g of graphs) {
    Object.assign(merged.nodes, g.nodes);
    merged.edges.push(...g.edges);
  }
  return merged;
}

export function saveDepGraph(projectName: string, graph: DepGraph): void {
  dbSaveDepGraph(projectName, graph);
}

export function loadDepGraph(projectName: string): DepGraph {
  return dbLoadDepGraph(projectName);
}

export function removeFileFromGraph(projectName: string, filePath: string): void {
  dbRemoveFileFromGraph(projectName, filePath);
}
