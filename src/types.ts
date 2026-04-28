// codesense 共享类型定义和常量

export interface CodeChunk {
  text: string;
  symbol: string;
  chunkType: "function" | "class" | "method" | "module" | "section" | "config" | "block";
  filePath: string;
  lineStart: number;
  lineEnd: number;
  language: string;
  context: string;
  textHash: string;
}

export interface EmbeddingConfig {
  baseUrl: string;
  model: string;
  dimensions: number;
  dimensionsFull: number;
}

export interface IndexConfig {
  model: string;
  dimensions: number;
  dimensionsFull: number;
  strategy: "auto" | "quality" | "performance";
  createdAt: string;
  updatedAt: string;
}

export interface DepNode {
  symbol: string;
  file: string;
  line: number;
  type: string;
}

export interface DepEdge {
  from: string;
  to: string;
  relation: "imports" | "calls" | "implements";
  confidence: "EXTRACTED";
}

export interface DepGraph {
  nodes: Record<string, DepNode>;
  edges: DepEdge[];
}

export interface SearchResult {
  score: number;
  symbol: string;
  type: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  text: string;
  context: string;
}

export interface TraceResult {
  symbol: string;
  file: string;
  line: number;
  callers: TraceNode[];
  callees: TraceNode[];
}

export interface TraceNode {
  symbol: string;
  file: string;
  line: number;
  type: string;
  relation: string;
  children: TraceNode[];
}

export type Manifest = Record<string, string>;

// 常量
export const DEFAULT_BATCH_SIZE = 32;
export const DEFAULT_TOP_K = 10;
export const DEFAULT_THRESHOLD = 0.5;
export const DEFAULT_TRACE_DEPTH = 3;

export const DEFAULT_EMBEDDING_CONFIG: EmbeddingConfig = {
  baseUrl: "http://localhost:11434",
  model: "qwen3-embedding:0.6b",
  dimensions: 1024,
  dimensionsFull: 2048,
};

export const EXCLUDE_DIRS = new Set([
  ".git",
  "node_modules",
  "__pycache__",
  ".venv",
  "venv",
  "env",
  ".env",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "target",
  "bin",
  "obj",
  ".idea",
  ".vscode",
  ".cache",
  "codesense-out",
]);

export const EXT_TO_LANGUAGE: Record<string, string> = {
  ".py": "python",
  ".js": "javascript",
  ".jsx": "javascript",
  ".ts": "typescript",
  ".tsx": "tsx",
  ".go": "go",
  ".rs": "rust",
  ".java": "java",
  ".c": "c",
  ".h": "c",
  ".cpp": "cpp",
  ".cc": "cpp",
  ".cxx": "cpp",
  ".hpp": "cpp",
  ".md": "markdown",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".json": "json",
  ".toml": "toml",
  ".vue": "vue",
  ".svelte": "svelte",
};

export const TREE_SITTER_LANGUAGES = new Set([
  "python",
  "javascript",
  "typescript",
  "tsx",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
]);
