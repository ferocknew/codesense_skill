import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("index")
    .description("为指定目录建立语义索引")
    .argument("[path]", "目标目录", ".")
    .option("--strategy <strategy>", "维度策略: auto | quality | performance", "auto")
    .option("--local", "强制本地执行，不转发给 server")
    .action(async (dir: string, options: { strategy: string; local: boolean }) => {
      const { resolveProjectName } = await require("../src/global");
      const absDir = require("path").resolve(dir);
      const name = resolveProjectName(absDir);

      if (!options.local) {
        const { forwardToServer } = await require("./forward");
        const forwarded = await forwardToServer("index", name);
        if (forwarded) return;
      }

      // 本地执行（server 不可用时的兜底）
      const { buildIndex } = await require("../src/indexer");
      const { notifyServer } = await require("../src/notify");

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
