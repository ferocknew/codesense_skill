import * as path from "path";
import { DepGraph } from "./types";
import { dbLoadDepGraph, dbSaveDepGraph, dbRemoveFileFromGraph } from "./database";
import { getParserClass, getLanguage, getNodeText } from "./parser";

export function emptyDepGraph(): DepGraph {
  return { nodes: {}, edges: [] };
}

function nodeId(filePath: string, symbol: string): string {
  const stem = filePath.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  const sym = symbol.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  return `${stem}_${sym}`;
}

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

// ============================================================
// TypeScript / JavaScript / TSX — tree-sitter AST
// ============================================================

const TS_BUILTINS = new Set([
  "if", "for", "while", "switch", "catch", "return", "throw", "new",
  "typeof", "delete", "void", "await", "async", "function", "class",
  "const", "let", "var", "import", "export", "require", "console",
  "setTimeout", "setInterval", "parseInt", "parseFloat",
  "Array", "Object", "String", "Number", "Boolean", "Promise",
  "Map", "Set", "Error", "Date", "JSON", "Math", "process", "Buffer",
]);

function extractTSDeps(filePath: string, content: string, graph: DepGraph): DepGraph {
  const ParserClass = getParserClass();
  const langMod = getLanguage("typescript");
  if (!ParserClass || !langMod) return graph;

  let parser: any;
  try {
    parser = new ParserClass();
    parser.setLanguage(langMod);
  } catch { return graph; }

  let tree: any;
  try { tree = parser.parse(content); } catch { return graph; }

  const root = tree.rootNode;
  const symbols = new Map<string, string>();

  // Pass 1: collect symbols
  collectTSSymbols(root, filePath, content, graph, symbols);

  // Pass 1.5: build import map for cross-file call resolution
  const importMap = buildTSImportMap(root, filePath, content);

  // Pass 2: collect calls (with import map)
  collectTSCalls(root, filePath, content, graph, symbols, importMap);

  // Pass 3: collect imports
  collectTSImports(root, filePath, content, graph);

  return graph;
}

function collectTSSymbols(
  node: any, filePath: string, content: string,
  graph: DepGraph, symbols: Map<string, string>
): void {
  const t = node.type;

  if (t === "function_declaration" || t === "generator_function_declaration") {
    const nameNode = node.childForFieldName("name");
    if (nameNode) {
      const name = getNodeText(nameNode, content);
      addSymbol(name, filePath, node.startPosition.row + 1, "function", graph, symbols);
    }
  } else if (t === "class_declaration" || t === "class") {
    const nameNode = node.childForFieldName("name");
    const className = nameNode ? getNodeText(nameNode, content) : "";
    if (className) {
      addSymbol(className, filePath, node.startPosition.row + 1, "class", graph, symbols);
    }
    const body = node.childForFieldName("body");
    if (body) {
      for (let i = 0; i < body.childCount; i++) {
        collectTSSymbols(body.child(i), filePath, content, graph, symbols);
      }
    }
    return; // don't recurse further
  } else if (t === "method_definition") {
    const name = firstIdentifier(node, content);
    if (name) {
      addSymbol(name, filePath, node.startPosition.row + 1, "function", graph, symbols);
    }
  } else if (t === "lexical_declaration" || t === "variable_declaration") {
    for (let j = 0; j < node.childCount; j++) {
      const decl = node.child(j);
      if (decl.type === "variable_declarator") {
        const value = decl.childForFieldName?.("value");
        if (value && (value.type === "arrow_function" || value.type === "function_expression")) {
          const nameNode = decl.childForFieldName("name");
          if (nameNode) {
            const name = getNodeText(nameNode, content);
            addSymbol(name, filePath, node.startPosition.row + 1, "function", graph, symbols);
          }
        }
      }
    }
  } else if (t === "export_statement") {
    for (let j = 0; j < node.childCount; j++) {
      collectTSSymbols(node.child(j), filePath, content, graph, symbols);
    }
    return;
  }

  // Recurse into non-leaf children
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!["string", "comment", "template_string"].includes(child.type)) {
      collectTSSymbols(child, filePath, content, graph, symbols);
    }
  }
}

function collectTSCalls(
  node: any, filePath: string, content: string,
  graph: DepGraph, symbols: Map<string, string>,
  importMap?: Map<string, string>
): void {
  const t = node.type;

  if (t === "function_declaration" || t === "method_definition" || t === "generator_function_declaration") {
    const nameNode = node.childForFieldName("name") || findFirstIdentNode(node);
    const callerName = nameNode ? getNodeText(nameNode, content) : null;
    if (callerName) {
      const body = node.childForFieldName("body");
      if (body) extractCallsFromBody(body, callerName, filePath, content, graph, symbols, TS_BUILTINS, importMap);
    }
  } else if (t === "lexical_declaration" || t === "variable_declaration") {
    for (let j = 0; j < node.childCount; j++) {
      const decl = node.child(j);
      if (decl.type === "variable_declarator") {
        const nameNode = decl.childForFieldName("name");
        const value = decl.childForFieldName?.("value");
        if (nameNode && value) {
          const callerName = getNodeText(nameNode, content);
          const body = value.childForFieldName?.("body");
          if (body) {
            extractCallsFromBody(body, callerName, filePath, content, graph, symbols, TS_BUILTINS, importMap);
          } else if (value.type === "arrow_function" || value.type === "function_expression") {
            // Arrow with expression body — no calls to extract from simple expressions usually
          }
        }
      }
    }
  } else if (t === "export_statement") {
    for (let j = 0; j < node.childCount; j++) {
      collectTSCalls(node.child(j), filePath, content, graph, symbols, importMap);
    }
    return;
  }

  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (!["string", "comment", "template_string"].includes(child.type)) {
      collectTSCalls(child, filePath, content, graph, symbols, importMap);
    }
  }
}

function extractCallsFromBody(
  bodyNode: any, callerName: string, filePath: string, content: string,
  graph: DepGraph, symbols: Map<string, string>, builtins: Set<string>,
  importMap?: Map<string, string>
): void {
  const callerId = nodeId(filePath, callerName);
  const seen = new Set<string>();

  function walk(node: any): void {
    if (node.type === "call_expression") {
      const funcNode = node.child(0);
      if (funcNode) {
        let calleeName: string | null = null;
        if (funcNode.type === "identifier") {
          calleeName = getNodeText(funcNode, content);
        } else if (funcNode.type === "member_expression") {
          const prop = funcNode.childForFieldName?.("property");
          if (prop) calleeName = getNodeText(prop, content);
        }

        if (calleeName && calleeName !== callerName && !builtins.has(calleeName)) {
          let calleeId = symbols.get(calleeName);
          if (!calleeId && importMap) {
            calleeId = importMap.get(calleeName);
          }
          if (calleeId && calleeId !== callerId) {
            const edgeKey = callerId + "->" + calleeId;
            if (!seen.has(edgeKey)) {
              seen.add(edgeKey);
              graph.edges.push({ from: callerId, to: calleeId, relation: "calls", confidence: "EXTRACTED" });
            }
          }
        }
      }
    }
    for (let i = 0; i < node.childCount; i++) {
      walk(node.child(i));
    }
  }

  walk(bodyNode);
}

function buildTSImportMap(root: any, filePath: string, content: string): Map<string, string> {
  const importMap = new Map<string, string>();

  function processImport(node: any) {
    const sourceNode = node.childForFieldName?.("source");
    if (!sourceNode) return;
    const modulePath = getNodeText(sourceNode, content).replace(/['"]/g, "");
    if (!modulePath.startsWith(".")) return;

    const dir = path.dirname(filePath);
    let resolvedRelPath = path.relative(process.cwd(), path.resolve(dir, modulePath));
    if (!resolvedRelPath.match(/\.(ts|tsx|js|jsx)$/)) {
      resolvedRelPath += ".ts";
    }

    function walkImport(n: any) {
      if (n.type === "import_specifier") {
        const nameNode = n.childForFieldName?.("name");
        const aliasNode = n.childForFieldName?.("alias");
        const originalName = nameNode ? getNodeText(nameNode, content) : null;
        const localName = aliasNode ? getNodeText(aliasNode, content) : originalName;
        if (localName && originalName) {
          importMap.set(localName, nodeId(resolvedRelPath, originalName));
        }
        return;
      }
      for (let i = 0; i < n.childCount; i++) {
        walkImport(n.child(i));
      }
    }

    walkImport(node);
  }

  function walk(node: any) {
    if (node.type === "import_statement" || node.type === "import_declaration") {
      processImport(node);
      return;
    }
    for (let i = 0; i < node.childCount; i++) {
      walk(node.child(i));
    }
  }

  walk(root);
  return importMap;
}

function collectTSImports(node: any, filePath: string, content: string, graph: DepGraph): void {
  if (node.type === "import_statement" || node.type === "import_declaration") {
    const sourceNode = node.childForFieldName?.("source");
    if (!sourceNode) return;
    const modulePath = getNodeText(sourceNode, content).replace(/['"]/g, "");

    if (modulePath.startsWith(".")) {
      const dir = path.dirname(filePath);
      let importedRelPath = path.relative(process.cwd(), path.resolve(dir, modulePath));
      if (!importedRelPath.match(/\.(ts|tsx|js|jsx)$/)) {
        importedRelPath += ".ts";
      }
      const importerId = nodeId(filePath, "__module__");
      const importedId = nodeId(importedRelPath, "__module__");

      if (!graph.nodes[importerId]) {
        graph.nodes[importerId] = { symbol: "__module__", file: filePath, line: 0, type: "module" };
      }
      if (!graph.nodes[importedId]) {
        graph.nodes[importedId] = { symbol: "__module__", file: importedRelPath, line: 0, type: "module" };
      }
      graph.edges.push({ from: importerId, to: importedId, relation: "imports", confidence: "EXTRACTED" });
    }
    return;
  }

  for (let i = 0; i < node.childCount; i++) {
    collectTSImports(node.child(i), filePath, content, graph);
  }
}

// ============================================================
// Python — tree-sitter AST
// ============================================================

const PYTHON_BUILTINS = new Set([
  "print", "len", "range", "str", "int", "float", "list", "dict", "set",
  "tuple", "type", "isinstance", "super", "property", "staticmethod",
  "classmethod", "enumerate", "zip", "map", "filter", "sorted",
  "hasattr", "getattr", "setattr", "open", "abs", "min", "max", "sum",
  "any", "all", "round", "input", "format", "repr", "bool", "bytes",
  "Exception", "ValueError", "TypeError", "KeyError", "IndexError",
  "AttributeError", "RuntimeError", "StopIteration", "NotImplementedError",
]);

function extractPythonDeps(filePath: string, content: string, graph: DepGraph): DepGraph {
  const ParserClass = getParserClass();
  const langMod = getLanguage("python");
  if (!ParserClass || !langMod) return graph;

  let parser: any;
  try {
    parser = new ParserClass();
    parser.setLanguage(langMod);
  } catch { return graph; }

  let tree: any;
  try { tree = parser.parse(content); } catch { return graph; }

  const root = tree.rootNode;
  const symbols = new Map<string, string>();

  collectPythonDefs(root, filePath, content, graph, symbols);

  return graph;
}

function collectPythonDefs(
  node: any, filePath: string, content: string,
  graph: DepGraph, symbols: Map<string, string>
): void {
  const t = node.type;

  if (t === "function_definition") {
    const nameNode = node.childForFieldName("name");
    if (nameNode) {
      const name = getNodeText(nameNode, content);
      addSymbol(name, filePath, node.startPosition.row + 1, "function", graph, symbols);
      const body = node.childForFieldName("body");
      if (body) extractCallsFromBody(body, name, filePath, content, graph, symbols, PYTHON_BUILTINS);
    }
  } else if (t === "class_definition") {
    const nameNode = node.childForFieldName("name");
    if (nameNode) {
      const name = getNodeText(nameNode, content);
      addSymbol(name, filePath, node.startPosition.row + 1, "class", graph, symbols);
    }
    const body = node.childForFieldName("body");
    if (body) {
      for (let i = 0; i < body.childCount; i++) {
        const child = body.child(i);
        if (child.type === "decorated_definition") {
          const inner = child.child(child.childCount - 1);
          if (inner.type === "function_definition") {
            const fnName = inner.childForFieldName("name");
            if (fnName) {
              const name = getNodeText(fnName, content);
              addSymbol(name, filePath, inner.startPosition.row + 1, "function", graph, symbols);
              const fnBody = inner.childForFieldName("body");
              if (fnBody) extractCallsFromBody(fnBody, name, filePath, content, graph, symbols, PYTHON_BUILTINS);
            }
          }
        } else if (child.type === "function_definition") {
          const fnName = child.childForFieldName("name");
          if (fnName) {
            const name = getNodeText(fnName, content);
            addSymbol(name, filePath, child.startPosition.row + 1, "function", graph, symbols);
            const fnBody = child.childForFieldName("body");
            if (fnBody) extractCallsFromBody(fnBody, name, filePath, content, graph, symbols, PYTHON_BUILTINS);
          }
        }
      }
    }
    return;
  } else if (t === "decorated_definition") {
    const inner = node.child(node.childCount - 1);
    if (inner.type === "function_definition") {
      collectPythonDefs(inner, filePath, content, graph, symbols);
    } else if (inner.type === "class_definition") {
      collectPythonDefs(inner, filePath, content, graph, symbols);
    }
    return;
  }

  for (let i = 0; i < node.childCount; i++) {
    collectPythonDefs(node.child(i), filePath, content, graph, symbols);
  }
}

// ============================================================
// Shared helpers
// ============================================================

function addSymbol(
  name: string, filePath: string, line: number, type: string,
  graph: DepGraph, symbols: Map<string, string>
): void {
  const id = nodeId(filePath, name);
  graph.nodes[id] = { symbol: name, file: filePath, line, type };
  symbols.set(name, id);
}

function firstIdentifier(node: any, content: string): string | null {
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child.type === "identifier" || child.type === "property_identifier") {
      return getNodeText(child, content);
    }
  }
  return null;
}

function findFirstIdentNode(node: any): any {
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (child.type === "identifier") return child;
  }
  return null;
}

// ============================================================
// Graph persistence (unchanged)
// ============================================================

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
