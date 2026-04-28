import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("server")
    .description("启动后台 HTTP 服务（Web 状态页 + 知识图谱可视化）")
    .option("-p, --port <number>", "端口号", "54321")
    .action(async (options: { port: string }) => {
      const { startServer } = await require("../src/server");
      await startServer({ port: parseInt(options.port, 10) });
    });
}
