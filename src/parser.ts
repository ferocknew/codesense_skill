let _Parser: any = null;

export function getParserClass(): any {
  if (!_Parser) {
    _Parser = require("tree-sitter");
  }
  return _Parser;
}

const _languageCache: Record<string, any> = {};

export function getLanguage(lang: string): any {
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

export function getNodeText(node: any, content: string): string {
  return content.slice(node.startIndex, node.endIndex);
}
