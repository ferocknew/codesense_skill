import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("uninstall")
    .description("卸载项目集成")
    .argument("[path]", "项目目录", ".")
    .action(async (projectDir: string) => {
      const { uninstall } = await require("../src/uninstall");
      await uninstall(projectDir);
    });
}
