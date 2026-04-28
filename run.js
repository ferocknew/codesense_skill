#!/usr/bin/env node

// 开发运行：通过 esbuild 即时编译后执行
const { buildSync } = require("esbuild");
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os"); // kept for potential future use

const tmpFile = path.join(__dirname, `.codesense-dev-${Date.now()}.js`);

const external = [
  "tree-sitter",
  "tree-sitter-python",
  "tree-sitter-javascript",
  "tree-sitter-typescript",
  "tree-sitter-go",
  "tree-sitter-rust",
  "tree-sitter-java",
  "tree-sitter-c",
  "tree-sitter-cpp",
  "@lancedb/lancedb",
];

try {
  buildSync({
    entryPoints: [path.join(__dirname, "src", "cli.ts")],
    bundle: true,
    platform: "node",
    outfile: tmpFile,
    external,
    minify: false,
    sourcemap: false,
    define: {
      __VERSION: '"0.1.0-dev"',
    },
    logLevel: "warning",
  });

  execFileSync(process.execPath, [tmpFile, ...process.argv.slice(2)], {
    stdio: "inherit",
    cwd: __dirname,
  });
} finally {
  try { fs.unlinkSync(tmpFile); } catch {}
}
