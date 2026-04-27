#!/usr/bin/env node

const { buildSync } = require("esbuild");
const fs = require("fs");
const path = require("path");

// 生成时间戳版本号 YYMMDD.HHmmSS
function getTimestamp() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");
  const HH = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${yy}${MM}${DD}.${HH}${mm}${ss}`;
}

// 更新 SKILL.md 中的版本号
function updateSkillVersion(version) {
  const skillMdPath = path.join(__dirname, "SKILL.md");
  if (!fs.existsSync(skillMdPath)) {
    console.log("⚠ SKILL.md 不存在，跳过版本号更新");
    return;
  }

  let content = fs.readFileSync(skillMdPath, "utf8");
  if (content.includes("version:")) {
    content = content.replace(/version: [\d.]+/, `version: ${version}`);
  }

  fs.writeFileSync(skillMdPath, content);
  console.log(`✓ SKILL.md 版本号已更新: ${version}`);
}

const version = getTimestamp();

console.log("开始打包 codesense...\n");

// 原生依赖，不打包进 skill.js（运行时从 node_modules 加载）
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
    entryPoints: ["run.js"],
    bundle: true,
    platform: "node",
    outfile: "skill.js",
    external,
    minify: false,
    sourcemap: false,
    banner: {
      js: `// codesense - 本地语义代码搜索 v${version}\n`,
    },
    define: {
      __VERSION: `"${version}"`,
    },
  });
  console.log(`✓ run.js -> skill.js (v${version})`);
} catch (e) {
  console.error("✗ 打包失败:", e.message);
  process.exit(1);
}

updateSkillVersion(version);

console.log("\n打包完成！");
console.log(`版本号: v${version}`);
console.log("\n使用方式:");
console.log("  node skill.js index <目录路径>");
console.log("  node skill.js search \"查询语句\"");
console.log("  node skill.js trace <符号名>");
console.log("  node skill.js status");
console.log("  node skill.js update");
console.log("  node skill.js install");
