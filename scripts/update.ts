import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("update")
    .description("增量更新索引（自动检测 git 变更文件）")
    .option("-q, --quiet", "静默模式")
    .action(async (options: { quiet: boolean }) => {
      const { updateIndex } = await require("../src/update");
      const { notifyServer } = await require("../src/notify");
      const { resolveProjectName } = await require("../src/global");
      const absDir = require("path").resolve(".");
      const name = resolveProjectName(absDir);

      await notifyServer("update-started", { name });
      const start = Date.now();
      try {
        await updateIndex(".", {
          quiet: options.quiet,
          onProgress: (phase: string, current: number, total: number) => {
            notifyServer("update-progress", { project: name, phase, current, total });
          },
        });
        await notifyServer("update-completed", { name, durationMs: Date.now() - start });
      } catch (e: any) {
        await notifyServer("update-failed", { name, error: e.message });
        throw e;
      }
    });
}
