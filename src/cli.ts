#!/usr/bin/env node

import { Command } from "commander";

declare const __VERSION: string;
const VERSION = typeof __VERSION !== "undefined" ? __VERSION : "0.1.0-dev";

const program = new Command();

program
  .name("codesense")
  .description("本地语义代码搜索 - 通过向量索引定位代码片段，支持 AST 依赖追踪")
  .version(VERSION);

// 静态导入所有命令注册模块（确保 esbuild 可以 bundle）
import { register as registerInit } from "../scripts/init";
import { register as registerList } from "../scripts/list";
import { register as registerIndex } from "../scripts/index_cmd";
import { register as registerSearch } from "../scripts/search";
import { register as registerTrace } from "../scripts/trace";
import { register as registerUpdate } from "../scripts/update";
import { register as registerStatus } from "../scripts/status";
import { register as registerUninstall } from "../scripts/uninstall";
import { register as registerClear } from "../scripts/clear";
import { register as registerServer } from "../scripts/server";

registerInit(program);
registerList(program);
registerIndex(program);
registerSearch(program);
registerTrace(program);
registerUpdate(program);
registerStatus(program);
registerUninstall(program);
registerClear(program);
registerServer(program);

// embed-test 隐藏命令（调试用）
program
  .command("embed-test")
  .description("测试 embedding 连接")
  .argument("<text>", "测试文本")
  .action(async (text: string) => {
    const { OllamaEmbedder } = await require("./embedder");
    const embedder = new OllamaEmbedder();
    const health = await embedder.checkHealth();
    if (!health.ok) {
      console.error("Ollama 不可用:", health.error);
      process.exit(1);
    }
    console.log("Ollama 状态:", health);
    const vec = await embedder.embedQuery(text);
    console.log(`向量维度: ${vec.length}`);
    console.log(`前5个值: [${vec.slice(0, 5).map((v: number) => v.toFixed(6)).join(", ")}]`);
  });

// chunk-test 隐藏命令（调试用）
program
  .command("chunk-test")
  .description("测试 AST 分块")
  .argument("<path>", "文件或目录路径")
  .action(async (filePath: string) => {
    const { chunkFile } = await require("./chunker");
    const { scanDirectory } = await require("./file-scanner");
    const fs = await import("fs");
    const path = await import("path");
    const { EXT_TO_LANGUAGE } = await require("./types");

    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const ext = path.extname(filePath);
      const lang = (EXT_TO_LANGUAGE as Record<string, string>)[ext] || "unknown";
      const content = fs.readFileSync(filePath, "utf-8");
      const chunks = chunkFile(filePath, content, lang);
      console.log(JSON.stringify(chunks, null, 2));
    } else {
      const files = scanDirectory(filePath);
      let total = 0;
      for (const f of files) {
        const content = fs.readFileSync(f.filePath, "utf-8");
        const chunks = chunkFile(f.filePath, content, f.language);
        total += chunks.length;
        console.log(`${f.filePath} (${f.language}): ${chunks.length} chunks`);
      }
      console.log(`\n总计: ${files.length} 文件, ${total} chunks`);
    }
  });

program.parse();
