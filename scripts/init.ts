import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("init")
    .description("初始化 codesense（环境检查 + 全局目录 + 注册项目 + CLAUDE.md + git hook）")
    .argument("[path]", "项目目录", ".")
    .action(async (projectDir: string) => {
      const { init } = await require("../src/install");
      await init(projectDir);
    });
}
