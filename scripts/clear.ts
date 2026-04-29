import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("clear")
    .description("清除项目的索引数据（不卸载集成）")
    .argument("[path]", "项目目录", ".")
    .action(async (projectDir: string) => {
      const { clearProject } = await require("../src/uninstall");
      const { notifyServer } = await require("../src/notify");
      const { resolveProjectName } = await require("../src/global");
      const absDir = require("path").resolve(projectDir);
      await clearProject(projectDir);
      const name = resolveProjectName(absDir);
      await notifyServer("project-unregistered", { name });
    });
}
