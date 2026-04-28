import * as fs from "fs";
import * as path from "path";
import { OllamaEmbedder } from "./embedder";
import { ensureGlobalDir, loadGlobalConfig, saveGlobalConfig, registerProject, resolveProjectName } from "./global";

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

export async function init(projectDir?: string): Promise<void> {
  const absDir = path.resolve(projectDir || ".");
  const projectName = resolveProjectName(absDir);

  // Step 1: 检查 Ollama
  console.log("检查 Ollama 服务...");
  const embedder = new OllamaEmbedder();
  const health = await embedder.checkHealth();

  if (!health.ok) {
    console.error(`✗ Ollama 不可用: ${health.error}`);
    console.error("  请先安装并启动 Ollama: https://ollama.com");
    process.exit(1);
  }
  console.log("✓ Ollama 服务正常");

  if (!health.modelAvailable) {
    console.error(`✗ 模型 qwen3-embedding:0.6b 未找到`);
    console.error("  请运行: ollama pull qwen3-embedding:0.6b");
    process.exit(1);
  }
  console.log("✓ 模型 qwen3-embedding:0.6b 已就绪");

  // Step 2: 创建全局目录
  ensureGlobalDir();
  console.log("✓ 全局目录已就绪 (~/.codesense/)");

  // Step 3: 写入 global-config（首次或更新）
  const existingConfig = loadGlobalConfig();
  saveGlobalConfig(existingConfig);
  console.log("✓ 全局配置已写入");

  // Step 4: 注册项目
  registerProject(projectName, absDir);
  console.log(`✓ 项目 "${projectName}" 已注册`);

  // Step 5: 注入 CLAUDE.md
  const claudeMdPath = path.resolve(absDir, "CLAUDE.md");
  const injection = getClaudeMdInjection();
  if (fs.existsSync(claudeMdPath)) {
    const content = fs.readFileSync(claudeMdPath, "utf-8");
    if (content.includes(CLAUDE_MD_MARKER)) {
      console.log("  CLAUDE.md 已包含 codesense 段落，跳过。");
    } else {
      fs.writeFileSync(claudeMdPath, content + injection, "utf-8");
      console.log("✓ 已向 CLAUDE.md 注入 codesense 使用说明");
    }
  } else {
    fs.writeFileSync(claudeMdPath, injection.trimStart(), "utf-8");
    console.log("✓ 已创建 CLAUDE.md 并注入 codesense 使用说明");
  }

  // Step 6: 安装 git post-commit hook
  const hookDir = path.resolve(absDir, ".git", "hooks");
  const hookPath = path.join(hookDir, "post-commit");
  const skillCmd = getSkillCommand();
  const hookContent = `${HOOK_MARKER}\n${skillCmd} update --quiet 2>/dev/null || true`;

  if (!fs.existsSync(path.resolve(absDir, ".git"))) {
    console.log("⚠ 未检测到 git 仓库，跳过 hook 安装。");
  } else {
    if (!fs.existsSync(hookDir)) {
      fs.mkdirSync(hookDir, { recursive: true });
    }

    if (fs.existsSync(hookPath)) {
      const content = fs.readFileSync(hookPath, "utf-8");
      if (content.includes(HOOK_MARKER)) {
        console.log("  post-commit hook 已包含 codesense，跳过。");
      } else {
        fs.writeFileSync(hookPath, content + "\n" + hookContent + "\n", "utf-8");
        console.log("✓ 已向 post-commit hook 追加 codesense 更新");
      }
    } else {
      fs.writeFileSync(hookPath, `#!/bin/sh\n${hookContent}\n`, "utf-8");
      fs.chmodSync(hookPath, 0o755);
      console.log("✓ 已创建 post-commit hook（codesense 自动更新）");
    }
  }

  console.log(`\n初始化完成！项目: ${projectName}`);
  console.log(`  运行 \`codesense index ${absDir}\` 建立首次索引。`);
}
