#!/usr/bin/env node

import { Command } from "commander";

declare const __VERSION: string;
const VERSION = typeof __VERSION !== "undefined" ? __VERSION : "0.1.0-dev";

const program = new Command();

program
  .name("codesense")
  .description("本地语义代码搜索 - 通过向量索引定位代码片段，支持 AST 依赖追踪")
  .version(VERSION);

// index 命令
program
  .command("index")
  .description("为指定目录建立语义索引")
  .argument("[path]", "目标目录", ".")
  .option("--strategy <strategy>", "维度策略: auto | quality | performance", "auto")
  .option("--background", "后台模式构建索引（大型项目）")
  .action(async (path: string, options: { strategy: string; background: boolean }) => {
    const { buildIndex } = await require("./indexer");
    await buildIndex(path, { strategy: options.strategy, quiet: false });
  });

// search 命令
program
  .command("search")
  .description("语义搜索代码")
  .argument("<query>", "搜索查询（支持中英文）")
  .option("-k, --top-k <number>", "返回结果数量", "10")
  .option("-t, --type <type>", "过滤符号类型: function | class | module")
  .option("-l, --lang <lang>", "过滤语言: python | typescript | go ...")
  .option("-d, --dir <dir>", "过滤目录前缀")
  .option("--threshold <number>", "相似度阈值 (0-1)", "0.5")
  .action(
    async (
      query: string,
      options: { topK: string; type?: string; lang?: string; dir?: string; threshold: string }
    ) => {
      const { search } = await require("./search");
      const results = await search(query, {
        topK: parseInt(options.topK, 10),
        type: options.type,
        lang: options.lang,
        dir: options.dir,
        threshold: parseFloat(options.threshold),
      });
      console.log(JSON.stringify({ results }, null, 2));
    }
  );

// trace 命令
program
  .command("trace")
  .description("追踪符号的依赖关系")
  .argument("<symbol>", "符号名称")
  .option("--depth <number>", "展开深度", "3")
  .option("--direction <direction>", "方向: callers | callees | both", "both")
  .option("--format <format>", "输出格式: tree | json | dot", "tree")
  .action(
    async (
      symbol: string,
      options: { depth: string; direction: string; format: string }
    ) => {
      const { trace } = await require("./trace");
      await trace(symbol, {
        depth: parseInt(options.depth, 10),
        direction: options.direction as "callers" | "callees" | "both",
        format: options.format as "tree" | "json" | "dot",
      });
    }
  );

// update 命令
program
  .command("update")
  .description("增量更新索引（只处理变更文件）")
  .option("-q, --quiet", "静默模式")
  .action(async (options: { quiet: boolean }) => {
    const { updateIndex } = await require("./update");
    await updateIndex(".", { quiet: options.quiet });
  });

// status 命令
program
  .command("status")
  .description("查看索引状态")
  .action(async () => {
    const { showStatus } = await require("./config");
    await showStatus();
  });

// install 命令
program
  .command("install")
  .description("安装项目集成（CLAUDE.md 注入 + git hook）")
  .action(async () => {
    const { install } = await require("./install");
    await install();
  });

// uninstall 命令
program
  .command("uninstall")
  .description("卸载项目集成")
  .action(async () => {
    const { uninstall } = await require("./uninstall");
    await uninstall();
  });

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
