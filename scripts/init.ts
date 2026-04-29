import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("init")
    .description("初始化 codesense（环境检查 + 全局目录 + 注册项目 + CLAUDE.md + git hook）")
    .argument("[path]", "项目目录", ".")
    .action(async (projectDir: string) => {
      const { init } = await require("../src/install");
      const { notifyServer } = await require("../src/notify");
      const { resolveProjectName } = await require("../src/global");
      const absDir = require("path").resolve(projectDir);
      await init(projectDir);
      const name = resolveProjectName(absDir);
      await notifyServer("project-registered", { name, path: absDir });
    });
}
