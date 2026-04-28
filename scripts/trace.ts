import { Command } from "commander";

export function register(program: Command): void {
  program
    .command("trace")
    .description("追踪符号的依赖关系")
    .argument("<symbol>", "符号名称")
    .option("--depth <number>", "展开深度", "3")
    .option("--direction <direction>", "方向: callers | callees | both", "both")
    .option("--format <format>", "输出格式: tree | json | dot", "tree")
    .action(
      async (
        symbol: string,
        options: { depth: string; direction: string; format: string }
      ) => {
        const { trace } = await require("../src/trace");
        await trace(symbol, {
          depth: parseInt(options.depth, 10),
          direction: options.direction as "callers" | "callees" | "both",
          format: options.format as "tree" | "json" | "dot",
        });
      }
    );
}
