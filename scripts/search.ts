import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("search")
    .description("语义搜索代码")
    .argument("<query>", "搜索查询（支持中英文）")
    .option("-k, --top-k <number>", "返回结果数量", "10")
    .option("-t, --type <type>", "过滤符号类型: function | class | module")
    .option("-l, --lang <lang>", "过滤语言: python | typescript | go ...")
    .option("-d, --dir <dir>", "过滤目录前缀")
    .option("--threshold <number>", "相似度阈值 (0-1)", "0.5")
    .option("-p, --project <project>", "指定项目名（或 all 搜索全部项目）")
    .action(
      async (
        query: string,
        options: { topK: string; type?: string; lang?: string; dir?: string; threshold: string; project?: string }
      ) => {
        const { search } = await require("../src/search");
        const results = await search(query, {
          topK: parseInt(options.topK, 10),
          type: options.type,
          lang: options.lang,
          dir: options.dir,
          threshold: parseFloat(options.threshold),
          project: options.project,
        });
        console.log(JSON.stringify({ results }, null, 2));
      }
    );
}
