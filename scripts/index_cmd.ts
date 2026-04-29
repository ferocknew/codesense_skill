import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("index")
    .description("为指定目录建立语义索引")
    .argument("[path]", "目标目录", ".")
    .option("--strategy <strategy>", "维度策略: auto | quality | performance", "auto")
    .option("--background", "后台模式构建索引（大型项目）")
    .action(async (dir: string, options: { strategy: string; background: boolean }) => {
      const { buildIndex } = await require("../src/indexer");
      const { notifyServer } = await require("../src/notify");
      const { resolveProjectName } = await require("../src/global");
      const absDir = require("path").resolve(dir);
      const name = resolveProjectName(absDir);

      await notifyServer("index-started", { name });
      const start = Date.now();
      try {
        await buildIndex(absDir, {
          strategy: options.strategy,
          quiet: false,
          onProgress: (phase: string, current: number, total: number) => {
            notifyServer("index-progress", { project: name, phase, current, total });
          },
        });
        await notifyServer("index-completed", { name, durationMs: Date.now() - start });
      } catch (e: any) {
        await notifyServer("index-failed", { name, error: e.message });
        throw e;
      }
    });
}
