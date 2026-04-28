import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("list")
    .description("列出所有已注册的项目")
    .action(async () => {
      const { listProjects } = await require("../src/global");
      const { loadConfig } = await require("../src/config");

      const projects = listProjects();
      if (projects.length === 0) {
        console.log("没有已注册的项目。运行 `codesense init` 初始化。");
        return;
      }

      console.log(`已注册项目 (${projects.length}):\n`);
      for (const p of projects) {
        const config = loadConfig(p.name);
        let status = "未建索引";
        if (config) {
          status = `${config.dimensions}维, ${config.updatedAt.slice(0, 10)}`;
        }
        console.log(`  ${p.name}`);
        console.log(`    路径: ${p.path}`);
        console.log(`    状态: ${status}\n`);
      }
    });
}
