import * as crypto from "crypto";
import { CodeChunk } from "./types";

interface Parser {
  parse(input: string): any;
  setLanguage(language: any): void;
}

// 延迟加载 tree-sitter，避免 esbuild 解析 .node 文件
let _Parser: any = null;
function getParserClass(): any {
  if (!_Parser) {
    _Parser = require("tree-sitter");
  }
  return _Parser;
}

const _languageCache: Record<string, any> = {};
function getLanguage(lang: string): any {
  if (_languageCache[lang]) return _languageCache[lang];

  let mod: any;
  switch (lang) {
    case "python":
      mod = require("tree-sitter-python");
      break;
    case "javascript":
      mod = require("tree-sitter-javascript");
      break;
    case "typescript":
      mod = require("tree-sitter-typescript").typescript;
      break;
    case "tsx":
      mod = require("tree-sitter-typescript").tsx;
      break;
    case "go":
      mod = require("tree-sitter-go");
      break;
    case "rust":
      mod = require("tree-sitter-rust");
      break;
    case "java":
      mod = require("tree-sitter-java");
      break;
    case "c":
      mod = require("tree-sitter-c");
      break;
    case "cpp":
      mod = require("tree-sitter-cpp");
      break;
    default:
      return null;
  }

  _languageCache[lang] = mod;
  return mod;
}

function computeHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

export function buildEmbeddingInput(chunk: CodeChunk): string {
  return `${chunk.context}\n\n${chunk.symbol} (${chunk.chunkType}, ${chunk.filePath}:${chunk.lineStart}):\n${chunk.text}`;
}

export function chunkFile(filePath: string, content: string, language: string): CodeChunk[] {
  switch (language) {
    case "python":
    case "javascript":
    case "typescript":
    case "tsx":
    case "go":
    case "rust":
    case "java":
    case "c":
    case "cpp":
      return chunkWithTreeSitter(filePath, content, language);
    case "markdown":
      return chunkMarkdown(filePath, content);
    case "yaml":
    case "json":
    case "toml":
      return chunkConfig(filePath, content, language);
    default:
      return chunkFallback(filePath, content, language);
  }
}

function chunkWithTreeSitter(filePath: string, content: string, language: string): CodeChunk[] {
  const ParserClass = getParserClass();
  const langMod = getLanguage(language);
  if (!ParserClass || !langMod) {
    return chunkFallback(filePath, content, language);
  }

  let parser: Parser;
  try {
    parser = new ParserClass();
    parser.setLanguage(langMod);
  } catch {
    return chunkFallback(filePath, content, language);
  }

  let tree: any;
  try {
    tree = parser.parse(content);
  } catch {
    return chunkFallback(filePath, content, language);
  }

  const root = tree.rootNode;
  const chunks: CodeChunk[] = [];
  const imports = extractImports(root, content, language);

  switch (language) {
    case "python":
      chunkPython(root, content, filePath, imports, chunks);
      break;
    case "javascript":
    case "typescript":
    case "tsx":
      chunkTypeScript(root, content, filePath, imports, chunks);
      break;
    case "go":
      chunkGo(root, content, filePath, imports, chunks);
      break;
    case "rust":
      chunkRust(root, content, filePath, imports, chunks);
      break;
    case "java":
      chunkJava(root, content, filePath, imports, chunks);
      break;
    case "c":
    case "cpp":
      chunkCFamily(root, content, filePath, imports, language, chunks);
      break;
    default:
      chunkFallback(filePath, content, language);
  }

  if (chunks.length === 0) {
    return chunkFallback(filePath, content, language);
  }

  return chunks;
}

function extractImports(root: any, content: string, language: string): string {
  const importNodes = findNodesByTypes(root, IMPORT_TYPES[language] || []);
  if (importNodes.length === 0) return "";
  return importNodes.map((n: any) => getNodeText(n, content)).join("\n");
}

const IMPORT_TYPES: Record<string, string[]> = {
  python: ["import_statement", "import_from_statement"],
  javascript: ["import_statement", "import_declaration"],
  typescript: ["import_statement", "import_declaration"],
  tsx: ["import_statement", "import_declaration"],
  go: ["import_declaration"],
  rust: ["use_declaration"],
  java: ["import_declaration"],
  c: ["preproc_include"],
  cpp: ["preproc_include"],
};

function findNodesByTypes(node: any, types: string[]): any[] {
  const results: any[] = [];
  if (types.includes(node.type)) {
    results.push(node);
  }
  for (let i = 0; i < node.childCount; i++) {
    results.push(...findNodesByTypes(node.child(i), types));
  }
  return results;
}

function getNodeText(node: any, content: string): string {
  return content.slice(node.startIndex, node.endIndex);
}

function makeChunk(
  node: any,
  content: string,
  filePath: string,
  chunkType: CodeChunk["chunkType"],
  context: string
): CodeChunk {
  const text = content.slice(node.startIndex, node.endIndex);
  return {
    text,
    symbol: extractSymbol(node, content, chunkType),
    chunkType,
    filePath,
    lineStart: node.startPosition.row + 1,
    lineEnd: node.endPosition.row + 1,
    language: "",
    context,
    textHash: computeHash(text),
  };
}

function extractSymbol(node: any, content: string, chunkType: string): string {
  // 尝试从不同类型的节点中提取名称
  const nameFields = ["name", "declarator"];
  for (const field of nameFields) {
    const child = node.childForFieldName
      ? node.childForFieldName(field)
      : null;
    if (child) {
      if (field === "declarator" && child.childForFieldName) {
        const innerName = child.childForFieldName("name");
        if (innerName) return getNodeText(innerName, content);
      }
      return getNodeText(child, content);
    }
  }

  // 对于 method_definition 等，找 identifier 子节点
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i);
    if (
      child.type === "identifier" ||
      child.type === "property_identifier" ||
      child.type === "type_identifier" ||
      child.type === "field_identifier"
    ) {
      return getNodeText(child, content);
    }
  }

  return `${chunkType}_L${node.startPosition.row + 1}`;
}

// Python 分块
function chunkPython(
  root: any,
  content: string,
  filePath: string,
  imports: string,
  chunks: CodeChunk[]
): void {
  const topNodes = root.children;
  let currentClass = "";
  let currentClassDoc = "";

  for (const node of topNodes) {
    if (node.type === "class_definition") {
      currentClass = getNodeText(node.childForFieldName("name"), content);
      const body = node.childForFieldName("body");
      currentClassDoc = "";
      if (body && body.childCount > 0) {
        const first = body.child(0);
        if (first.type === "expression_statement" && first.child(0).type === "string") {
          currentClassDoc = getNodeText(first, content);
        }
      }
      chunks.push({
        ...makeChunk(node, content, filePath, "class", imports),
        language: "python",
        context: imports,
      });

      // 处理类内方法
      if (body) {
        for (let i = 0; i < body.childCount; i++) {
          const child = body.child(i);
          if (child.type === "function_definition" || child.type === "decorated_definition") {
            const fn = child.type === "decorated_definition"
              ? child.child(child.childCount - 1)
              : child;
            if (fn.type === "function_definition") {
              const ctx = [imports, currentClassDoc ? `${currentClass}: ${currentClassDoc}` : `class ${currentClass}`]
                .filter(Boolean).join("\n");
              chunks.push({
                ...makeChunk(fn, content, filePath, "method", ctx),
                language: "python",
                context: ctx,
              });
            }
          }
        }
      }
      currentClass = "";
      currentClassDoc = "";
    } else if (node.type === "function_definition") {
      chunks.push({
        ...makeChunk(node, content, filePath, "function", imports),
        language: "python",
        context: imports,
      });
    } else if (node.type === "decorated_definition") {
      const inner = node.child(node.childCount - 1);
      if (inner.type === "function_definition") {
        chunks.push({
          ...makeChunk(node, content, filePath, "function", imports),
          language: "python",
          context: imports,
        });
      }
    }
  }
}

// TypeScript/JavaScript 分块
function chunkTypeScript(
  root: any,
  content: string,
  filePath: string,
  imports: string,
  chunks: CodeChunk[]
): void {
  const walkAndExtract = (node: any, parentClass = "") => {
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      const type = child.type;

      if (type === "function_declaration" || type === "generator_function_declaration") {
        const ctx = parentClass ? `${imports}\nclass ${parentClass}` : imports;
        chunks.push({
          ...makeChunk(child, content, filePath, parentClass ? "method" : "function", ctx),
          language: "typescript",
          context: ctx,
        });
      } else if (type === "class_declaration" || type === "class") {
        const className = child.childForFieldName?.("name")
          ? getNodeText(child.childForFieldName("name"), content)
          : "";
        const body = child.childForFieldName?.("body");
        if (body) {
          walkAndExtract(body, className);
        }
        chunks.push({
          ...makeChunk(child, content, filePath, "class", imports),
          language: "typescript",
          context: imports,
        });
      } else if (type === "method_definition" || type === "public_field_definition") {
        if (child.childCount > 0 && child.child(child.childCount - 1).type === "function_expression") {
          const ctx = parentClass ? `${imports}\nclass ${parentClass}` : imports;
          chunks.push({
            ...makeChunk(child, content, filePath, "method", ctx),
            language: "typescript",
            context: ctx,
          });
        }
      } else if (type === "lexical_declaration" || type === "variable_declaration") {
        // const fn = () => {} 模式
        for (let j = 0; j < child.childCount; j++) {
          const decl = child.child(j);
          if (decl.type === "variable_declarator") {
            const value = decl.childForFieldName?.("value");
            if (value && (value.type === "arrow_function" || value.type === "function_expression")) {
              const ctx = parentClass ? `${imports}\nclass ${parentClass}` : imports;
              chunks.push({
                ...makeChunk(child, content, filePath, "function", ctx),
                language: "typescript",
                context: ctx,
              });
            }
          }
        }
      } else if (type === "export_statement") {
        // export function / export class
        for (let j = 0; j < child.childCount; j++) {
          const inner = child.child(j);
          if (
            inner.type === "function_declaration" ||
            inner.type === "class_declaration" ||
            inner.type === "lexical_declaration"
          ) {
            walkAndExtract({ childCount: 1, child: () => inner } as any, parentClass);
          }
        }
      } else if (child.childCount > 0 && !["string", "comment", "number"].includes(type)) {
        walkAndExtract(child, parentClass);
      }
    }
  };

  walkAndExtract(root);
}

// Go 分块
function chunkGo(
  root: any,
  content: string,
  filePath: string,
  imports: string,
  chunks: CodeChunk[]
): void {
  const pkgDecl = root.children.find((n: any) => n.type === "package_clause");
  const pkgName = pkgDecl ? getNodeText(pkgDecl, content) : "";

  for (const node of root.children) {
    if (node.type === "function_declaration") {
      chunks.push({
        ...makeChunk(node, content, filePath, "function", `${pkgName}\n${imports}`),
        language: "go",
        context: `${pkgName}\n${imports}`,
      });
    } else if (node.type === "method_declaration") {
      const receiver = node.childForFieldName?.("receiver");
      const receiverText = receiver ? getNodeText(receiver, content) : "";
      const ctx = `${pkgName}\n${imports}\nreceiver: ${receiverText}`;
      chunks.push({
        ...makeChunk(node, content, filePath, "method", ctx),
        language: "go",
        context: ctx,
      });
    } else if (node.type === "type_declaration") {
      chunks.push({
        ...makeChunk(node, content, filePath, "class", `${pkgName}\n${imports}`),
        language: "go",
        context: `${pkgName}\n${imports}`,
      });
    }
  }
}

// Rust 分块
function chunkRust(
  root: any,
  content: string,
  filePath: string,
  imports: string,
  chunks: CodeChunk[]
): void {
  for (const node of root.children) {
    if (node.type === "function_item") {
      chunks.push({
        ...makeChunk(node, content, filePath, "function", imports),
        language: "rust",
        context: imports,
      });
    } else if (node.type === "struct_item" || node.type === "enum_item" || node.type === "trait_item") {
      chunks.push({
        ...makeChunk(node, content, filePath, "class", imports),
        language: "rust",
        context: imports,
      });
    } else if (node.type === "impl_item") {
      const body = node.childForFieldName?.("body");
      if (body) {
        for (let i = 0; i < body.childCount; i++) {
          const child = body.child(i);
          if (child.type === "function_item") {
            chunks.push({
              ...makeChunk(child, content, filePath, "method", imports),
              language: "rust",
              context: imports,
            });
          }
        }
      }
    }
  }
}

// Java 分块
function chunkJava(
  root: any,
  content: string,
  filePath: string,
  imports: string,
  chunks: CodeChunk[]
): void {
  for (const node of root.children) {
    if (node.type === "class_declaration" || node.type === "interface_declaration" || node.type === "enum_declaration") {
      const name = node.childForFieldName?.("name");
      const className = name ? getNodeText(name, content) : "";
      chunks.push({
        ...makeChunk(node, content, filePath, "class", imports),
        language: "java",
        context: imports,
      });
      const body = node.childForFieldName?.("body");
      if (body) {
        for (let i = 0; i < body.childCount; i++) {
          const child = body.child(i);
          if (child.type === "method_declaration" || child.type === "constructor_declaration") {
            chunks.push({
              ...makeChunk(child, content, filePath, "method", `${imports}\nclass ${className}`),
              language: "java",
              context: `${imports}\nclass ${className}`,
            });
          }
        }
      }
    }
  }
}

// C/C++ 分块
function chunkCFamily(
  root: any,
  content: string,
  filePath: string,
  imports: string,
  language: string,
  chunks: CodeChunk[]
): void {
  for (const node of root.children) {
    if (node.type === "function_definition") {
      chunks.push({
        ...makeChunk(node, content, filePath, "function", imports),
        language,
        context: imports,
      });
    } else if (node.type === "class_specifier" || node.type === "struct_specifier") {
      chunks.push({
        ...makeChunk(node, content, filePath, "class", imports),
        language,
        context: imports,
      });
    }
  }
}

// Markdown 分块
function chunkMarkdown(filePath: string, content: string): CodeChunk[] {
  const lines = content.split("\n");
  const chunks: CodeChunk[] = [];
  let currentSection = "";
  let currentStartLine = 1;
  let headingStack: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)/);
    if (match) {
      // 保存上一个 section
      if (currentSection.trim()) {
        const text = currentSection.trim();
        chunks.push({
          text,
          symbol: headingStack[headingStack.length - 1] || `section_L${currentStartLine}`,
          chunkType: "section",
          filePath,
          lineStart: currentStartLine,
          lineEnd: i,
          language: "markdown",
          context: headingStack.slice(0, -1).join(" > "),
          textHash: computeHash(text),
        });
      }

      const level = match[1].length;
      headingStack = headingStack.slice(0, level - 1);
      headingStack.push(match[2].trim());
      currentSection = lines[i] + "\n";
      currentStartLine = i + 1;
    } else {
      currentSection += lines[i] + "\n";
    }
  }

  // 最后一个 section
  if (currentSection.trim()) {
    const text = currentSection.trim();
    chunks.push({
      text,
      symbol: headingStack[headingStack.length - 1] || `section_L${currentStartLine}`,
      chunkType: "section",
      filePath,
      lineStart: currentStartLine,
      lineEnd: lines.length,
      language: "markdown",
      context: headingStack.slice(0, -1).join(" > "),
      textHash: computeHash(text),
    });
  }

  return chunks.length > 0 ? chunks : chunkFallback(filePath, content, "markdown");
}

// 配置文件分块（整文件一个 chunk）
function chunkConfig(filePath: string, content: string, language: string): CodeChunk[] {
  if (!content.trim()) return [];
  return [
    {
      text: content,
      symbol: filePath.split("/").pop() || filePath,
      chunkType: "config",
      filePath,
      lineStart: 1,
      lineEnd: content.split("\n").length,
      language,
      context: "",
      textHash: computeHash(content),
    },
  ];
}

// Fallback 分块（按空行分段）
function chunkFallback(filePath: string, content: string, language: string): CodeChunk[] {
  if (!content.trim()) return [];

  const lines = content.split("\n");
  const chunks: CodeChunk[] = [];
  let currentBlock: string[] = [];
  let blockStart = 1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "" && currentBlock.length > 0) {
      const text = currentBlock.join("\n").trim();
      if (text) {
        chunks.push({
          text,
          symbol: `block_L${blockStart}`,
          chunkType: "block",
          filePath,
          lineStart: blockStart,
          lineEnd: i,
          language: language || "unknown",
          context: "",
          textHash: computeHash(text),
        });
      }
      currentBlock = [];
      blockStart = i + 2;
    } else {
      currentBlock.push(lines[i]);
    }
  }

  if (currentBlock.length > 0) {
    const text = currentBlock.join("\n").trim();
    if (text) {
      chunks.push({
        text,
        symbol: `block_L${blockStart}`,
        chunkType: "block",
        filePath,
        lineStart: blockStart,
        lineEnd: lines.length,
        language: language || "unknown",
        context: "",
        textHash: computeHash(text),
      });
    }
  }

  return chunks;
}
