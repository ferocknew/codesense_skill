import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { OllamaEmbedder } from "./embedder";
import { ensureGlobalDir, registerProject, resolveProjectName } from "./global";
import { getDb, dbSaveGlobalConfig } from "./database";

export const CLAUDE_MD_MARKER = "<!-- codesense-start -->";
export const CLAUDE_MD_END_MARKER = "<!-- codesense-end -->";

function getSkillCommand(): string {
  return `node "${path.resolve(__dirname, "skill.js")}"`;
}

function getClaudeMdInjection(): string {
  const cmd = getSkillCommand();
  return `
${CLAUDE_MD_MARKER}
## codesense

本项目有 codesense 语义代码索引。

Rules:
- 回答"这段代码在哪"、"怎么实现 X"类问题时，先运行 \`${cmd} search "<问题描述>"\`
- 需要理解调用链、影响范围时，运行 \`${cmd} trace "<符号名>"\`
- 修改代码后，运行 \`${cmd} update\` 增量更新（如已安装 hook 则自动触发）
- 搜索返回的是 chunk 级结果，仍需读取源文件确认完整上下文
${CLAUDE_MD_END_MARKER}
`;
}

export const HOOK_MARKER = "# codesense auto-update";

// Phase 1: 环境准备（不依赖 node_modules）
function checkNodeVersion(): void {
  const major = parseInt(process.versions.node.split(".")[0], 10);
  if (major < 22) {
    console.error(`✗ Node.js 版本过低: v${process.versions.node}，需要 >= 22`);
    console.error("  请升级 Node.js: https://nodejs.org");
    process.exit(1);
  }
  console.log(`✓ Node.js v${process.versions.node}`);
}

function findPackageManager(): { cmd: string; name: string } {
  try {
    execSync("pnpm --version", { stdio: "pipe" });
    return { cmd: "pnpm", name: "pnpm" };
  } catch {}
  try {
    execSync("npm --version", { stdio: "pipe" });
    return { cmd: "npm", name: "npm" };
  } catch {}
  return { cmd: "", name: "" };
}

function installDependencies(): void {
  const skillDir = path.resolve(__dirname, "..");
  const nodeModules = path.join(skillDir, "node_modules");

  if (fs.existsSync(nodeModules)) {
    console.log("✓ 依赖已安装");
    return;
  }

  const pm = findPackageManager();
  if (!pm.cmd) {
    console.error("✗ 未找到 pnpm 或 npm");
    console.error("  请安装 pnpm: npm install -g pnpm");
    process.exit(1);
  }

  console.log(`安装依赖 (${pm.name} install)...`);
  try {
    execSync(`${pm.cmd} install`, { cwd: skillDir, stdio: "inherit" });
    console.log("✓ 依赖安装完成");
  } catch {
    console.error("✗ 依赖安装失败，请手动运行: " + pm.cmd + " install");
    process.exit(1);
  }
}

// Phase 2: 外部服务
async function checkOllama(): Promise<void> {
  console.log("检查 Ollama 服务...");
  const embedder = new OllamaEmbedder();
  const health = await embedder.checkHealth();

  if (!health.ok) {
    console.error(`✗ Ollama 不可用: ${health.error}`);
    console.error("  请先安装并启动 Ollama: https://ollama.com");
    process.exit(1);
  }
  console.log("✓ Ollama 服务正常");
}

async function checkOrPullModel(): Promise<void> {
  const modelName = "qwen3-embedding:0.6b";
  const embedder = new OllamaEmbedder();
  const health = await embedder.checkHealth();

  if (health.modelAvailable) {
    console.log(`✓ 模型 ${modelName} 已就绪`);
    return;
  }

  console.log(`⚠ 模型 ${modelName} 未找到`);
  console.log(`  需要下载模型 (约 500MB)，是否继续？`);

  // 非交互模式直接 pull，交互模式询问
  if (!process.stdin.isTTY) {
    console.log(`  正在下载 ${modelName}...`);
    try {
      execSync(`ollama pull ${modelName}`, { stdio: "inherit" });
      console.log(`✓ 模型 ${modelName} 下载完成`);
    } catch {
      console.error(`✗ 模型下载失败，请手动运行: ollama pull ${modelName}`);
      process.exit(1);
    }
    return;
  }

  // 简单的 stdin 确认
  process.stdout.write("  输入 y 确认下载: ");
  const answer = await new Promise<string>((resolve) => {
    process.stdin.once("data", (data) => resolve(data.toString().trim().toLowerCase()));
    setTimeout(() => resolve("n"), 30000);
  });

  if (answer !== "y" && answer !== "yes") {
    console.error(`✗ 请手动运行: ollama pull ${modelName} 后重新 init`);
    process.exit(1);
  }

  console.log(`  正在下载 ${modelName}...`);
  try {
    execSync(`ollama pull ${modelName}`, { stdio: "inherit" });
    console.log(`✓ 模型 ${modelName} 下载完成`);
  } catch {
    console.error(`✗ 模型下载失败，请手动运行: ollama pull ${modelName}`);
    process.exit(1);
  }
}

// Phase 3: 数据初始化
function initializeDatabase(): void {
  ensureGlobalDir();
  getDb(); // 触发建库建表 + JSON 迁移
  dbSaveGlobalConfig({ model: "qwen3-embedding:0.6b", ollamaUrl: "http://localhost:11434" });
  console.log("✓ 数据库已初始化 (~/.codesense/codesense.db)");
}

// Phase 4: 项目集成
function integrateProject(absDir: string, projectName: string): void {
  // 注册项目
  registerProject(projectName, absDir);
  console.log(`✓ 项目 "${projectName}" 已注册`);

  // 生成项目级配置
  checkProjectConfig(absDir);

  // CLAUDE.md 检查与注入
  checkClaudeMd(absDir);

  // git hook 检查与注入
  checkGitHook(absDir);

  // 未提交变更提示
  checkUncommittedChanges(absDir);
}

const PROJECT_CONFIG_DIR = ".codesense";
const PROJECT_CONFIG_FILE = "index.json";
const DEFAULT_PROJECT_CONFIG = {
  excludeFiles: ["SKILL.md", "README.md", "CLAUDE.md", "*.test.ts", "*.test.js", "*.spec.ts", "*.spec.js", "*.min.js", "*.min.css", "*.bundle.js"],
  excludeDirs: [] as string[],
};

function checkProjectConfig(absDir: string): void {
  const configDir = path.join(absDir, PROJECT_CONFIG_DIR);
  const configPath = path.join(configDir, PROJECT_CONFIG_FILE);

  if (fs.existsSync(configPath)) {
    console.log("✓ 项目配置 .codesense/index.json 已存在");
    return;
  }

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(DEFAULT_PROJECT_CONFIG, null, 2) + "\n", "utf-8");
  console.log("✓ 已创建 .codesense/index.json（默认排除规则）");
}

export function loadProjectConfig(absDir: string): typeof DEFAULT_PROJECT_CONFIG | null {
  const configPath = path.join(absDir, PROJECT_CONFIG_DIR, PROJECT_CONFIG_FILE);
  if (!fs.existsSync(configPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch {
    return null;
  }
}

function checkClaudeMd(absDir: string): void {
  const claudeMdPath = path.resolve(absDir, "CLAUDE.md");
  const injection = getClaudeMdInjection();

  if (!fs.existsSync(claudeMdPath)) {
    // 文件不存在 → 创建
    fs.writeFileSync(claudeMdPath, injection.trimStart(), "utf-8");
    console.log("✓ 已创建 CLAUDE.md 并注入 codesense 使用说明");
    return;
  }

  const content = fs.readFileSync(claudeMdPath, "utf-8");
  if (!content.includes(CLAUDE_MD_MARKER)) {
    // 文件存在但缺少 marker → 追加
    fs.writeFileSync(claudeMdPath, content + injection, "utf-8");
    console.log("✓ 已向 CLAUDE.md 注入 codesense 使用说明");
    return;
  }

  // marker 存在，检查内容是否完整
  const startIdx = content.indexOf(CLAUDE_MD_MARKER);
  const endIdx = content.indexOf(CLAUDE_MD_END_MARKER);
  if (endIdx === -1 || endIdx <= startIdx) {
    // marker 损坏 → 修复：删除残留内容，重新注入
    const before = content.slice(0, startIdx);
    fs.writeFileSync(claudeMdPath, before + injection, "utf-8");
    console.log("✓ CLAUDE.md codesense 段落已修复（之前的内容不完整）");
    return;
  }

  console.log("✓ CLAUDE.md codesense 段落正常");
}

function checkGitHook(absDir: string): void {
  const gitDir = path.resolve(absDir, ".git");
  if (!fs.existsSync(gitDir)) {
    console.log("⚠ 当前目录不是 git 仓库。");
    console.log("  codesense 依赖 git 进行增量更新，正在执行 git init...");
    try {
      execSync("git init", { cwd: absDir, stdio: "inherit" });
      console.log("✓ git 仓库已初始化");
    } catch {
      console.error("✗ git init 失败，请手动运行: git init");
      process.exit(1);
    }
  }

  const skillCmd = getSkillCommand();
  const hookCmd = `nohup ${skillCmd} update --quiet </dev/null >/dev/null 2>&1 &`;

  // 检测是否使用 husky（core.hooksPath 指向 .husky/_）
  let hooksPath: string | null = null;
  try {
    const hp = execSync("git config core.hooksPath", { cwd: absDir, encoding: "utf-8", timeout: 3000 }).trim();
    if (hp) hooksPath = hp;
  } catch {}

  if (hooksPath) {
    // husky 模式：在 .husky/ 根目录创建 post-commit
    const huskyDir = path.resolve(absDir, hooksPath, "..");
    const huskyHook = path.join(huskyDir, "post-commit");
    writeOrUpdateHook(huskyHook, skillCmd, hookCmd);
  } else {
    // 标准 git hook
    const hookDir = path.join(gitDir, "hooks");
    if (!fs.existsSync(hookDir)) fs.mkdirSync(hookDir, { recursive: true });
    writeOrUpdateHook(path.join(hookDir, "post-commit"), skillCmd, hookCmd);
  }
}

function writeOrUpdateHook(hookPath: string, skillCmd: string, hookCmd: string): void {
  const hookContent = `#!/bin/sh\n${HOOK_MARKER}\n${hookCmd}\n`;

  if (!fs.existsSync(hookPath)) {
    fs.writeFileSync(hookPath, hookContent, "utf-8");
    fs.chmodSync(hookPath, 0o755);
    console.log("✓ 已创建 post-commit hook（codesense 自动更新）");
    return;
  }

  const content = fs.readFileSync(hookPath, "utf-8");
  if (!content.includes(HOOK_MARKER)) {
    fs.writeFileSync(hookPath, content + "\n" + HOOK_MARKER + "\n" + hookCmd + "\n", "utf-8");
    console.log("✓ 已向 post-commit hook 追加 codesense 更新");
    return;
  }

  // marker 存在，检查命令行是否需要更新
  const lines = content.split("\n");
  const markerIdx = lines.findIndex((l) => l.includes(HOOK_MARKER));
  if (markerIdx >= 0 && markerIdx + 1 < lines.length) {
    const cmdLine = lines[markerIdx + 1];
    if (cmdLine.includes(skillCmd) && cmdLine.trim() !== hookCmd) {
      lines[markerIdx + 1] = hookCmd;
      fs.writeFileSync(hookPath, lines.join("\n"), "utf-8");
      console.log("✓ post-commit hook 已更新（异步模式）");
      return;
    }
  }

  try {
    fs.accessSync(hookPath, fs.constants.X_OK);
    console.log("✓ post-commit hook 正常");
  } catch {
    fs.chmodSync(hookPath, 0o755);
    console.log("✓ post-commit hook 已修复可执行权限");
  }
}

function checkUncommittedChanges(absDir: string): void {
  try {
    const output = execSync("git status --porcelain", {
      cwd: absDir,
      encoding: "utf-8",
      timeout: 5000,
    }).trim();

    if (!output) return;

    const lines = output.split("\n");
    const staged = lines.filter((l) => l.match(/^[MADRC]/)).length;
    const unstaged = lines.filter((l) => l.match(/^ [MADRC?]/)).length;

    if (staged > 0 || unstaged > 0) {
      console.log(`⚠ 有未提交的变更 (${staged} 已暂存, ${unstaged} 未暂存)`);
      console.log("  提交后 post-commit hook 将自动触发增量更新");
    }
  } catch {
    // git 不可用或不在 git 仓库，忽略
  }
}

export async function init(projectDir?: string): Promise<void> {
  const absDir = path.resolve(projectDir || ".");
  const projectName = resolveProjectName(absDir);

  console.log("codesense 初始化\n");

  // Phase 1: 环境准备
  console.log("--- 环境检查 ---");
  checkNodeVersion();
  installDependencies();

  // Phase 2: 外部服务
  console.log("\n--- 外部服务 ---");
  await checkOllama();
  await checkOrPullModel();

  // Phase 3: 数据初始化
  console.log("\n--- 数据初始化 ---");
  initializeDatabase();

  // Phase 4: 项目集成
  console.log("\n--- 项目集成 ---");
  integrateProject(absDir, projectName);

  console.log(`\n初始化完成！项目: ${projectName}`);
  console.log(`  运行 \`codesense index ${absDir}\` 建立首次索引。`);
}
