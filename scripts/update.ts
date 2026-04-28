import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("update")
    .description("增量更新索引（自动检测 git 变更文件）")
    .option("-q, --quiet", "静默模式")
    .action(async (options: { quiet: boolean }) => {
      const { updateIndex } = await require("../src/update");
      await updateIndex(".", { quiet: options.quiet });
    });
}
