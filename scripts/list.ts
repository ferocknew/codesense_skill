import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("list")
    .description("列出所有已注册的项目")
    .action(async () => {
      const { listProjects } = await require("../src/global");
      const { getProjectDir } = await require("../src/global");
      const { loadConfig } = await require("../src/config");
      const path = await import("path");
      const fs = await import("fs");

      const projects = listProjects();
      if (projects.length === 0) {
        console.log("没有已注册的项目。运行 `codesense init` 初始化。");
        return;
      }

      console.log(`已注册项目 (${projects.length}):\n`);
      for (const p of projects) {
        const outDir = getProjectDir(p.name);
        const configPath = path.join(outDir, "config.json");
        let status = "未建索引";
        if (fs.existsSync(configPath)) {
          const config = loadConfig(configPath);
          if (config) {
            status = `${config.dimensions}维, ${config.updatedAt.slice(0, 10)}`;
          }
        }
        console.log(`  ${p.name}`);
        console.log(`    路径: ${p.path}`);
        console.log(`    状态: ${status}\n`);
      }
    });
}
