import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("index")
    .description("为指定目录建立语义索引")
    .argument("[path]", "目标目录", ".")
    .option("--strategy <strategy>", "维度策略: auto | quality | performance", "auto")
    .option("--background", "后台模式构建索引（大型项目）")
    .action(async (path: string, options: { strategy: string; background: boolean }) => {
      const { buildIndex } = await require("../src/indexer");
      await buildIndex(path, { strategy: options.strategy, quiet: false });
    });
}
