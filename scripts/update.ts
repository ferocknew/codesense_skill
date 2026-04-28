import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("update")
    .description("增量更新索引（只处理变更文件）")
    .option("-q, --quiet", "静默模式")
    .option("-f, --files <files...>", "只处理指定文件（相对路径，多个用空格分隔）")
    .action(async (options: { quiet: boolean; files?: string[] }) => {
      const { updateIndex } = await require("../src/update");
      await updateIndex(".", { quiet: options.quiet, files: options.files });
    });
}
