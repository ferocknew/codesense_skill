import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("status")
    .description("查看索引状态")
    .argument("[project]", "项目名称（可选，默认当前项目）")
    .action(async (project?: string) => {
      const { showStatus } = await require("../src/config");
      await showStatus(project);
    });
}
