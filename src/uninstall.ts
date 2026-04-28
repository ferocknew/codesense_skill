import * as fs from "fs";
import * as path from "path";
import { CLAUDE_MD_MARKER, CLAUDE_MD_END_MARKER, HOOK_MARKER } from "./install";
import { resolveProjectName, getProjectDir } from "./global";
import { dbDeleteProjectData } from "./database";

export async function uninstall(projectDir?: string): Promise<void> {
  const absDir = path.resolve(projectDir || ".");
  const projectName = resolveProjectName(absDir);

  // Step 1: 从 registry 移除项目（CASCADE 删除所有项目数据）
  dbDeleteProjectData(projectName);
  console.log(`✓ 项目 "${projectName}" 数据已从数据库移除`);

  // Step 2: 清理 LanceDB 索引目录
  const projectDataDir = getProjectDir(projectName);
  if (fs.existsSync(projectDataDir)) {
    fs.rmSync(projectDataDir, { recursive: true, force: true });
    console.log(`✓ 已清理索引数据: ${projectDataDir}`);
  }

  // Step 3: 移除 CLAUDE.md 中的 codesense 段落
  const claudeMdPath = path.resolve(absDir, "CLAUDE.md");
  if (fs.existsSync(claudeMdPath)) {
    let content = fs.readFileSync(claudeMdPath, "utf-8");
    if (content.includes(CLAUDE_MD_MARKER)) {
      const startIdx = content.indexOf(CLAUDE_MD_MARKER);
      const endIdx = content.indexOf(CLAUDE_MD_END_MARKER);
      if (endIdx !== -1) {
        const endOfMarker = endIdx + CLAUDE_MD_END_MARKER.length;
        content = content.slice(0, startIdx) + content.slice(endOfMarker);
        content = content.replace(/\n{3,}/g, "\n\n").trimEnd();
        if (content.trim()) {
          fs.writeFileSync(claudeMdPath, content + "\n", "utf-8");
        } else {
          fs.unlinkSync(claudeMdPath);
        }
        console.log("✓ 已从 CLAUDE.md 移除 codesense 段落");
      }
    } else {
      console.log("  CLAUDE.md 中未找到 codesense 段落。");
    }
  }

  // Step 4: 移除 git hook 中的 codesense 部分
  const hookPath = path.resolve(absDir, ".git", "hooks", "post-commit");
  if (fs.existsSync(hookPath)) {
    let content = fs.readFileSync(hookPath, "utf-8");
    if (content.includes(HOOK_MARKER)) {
      const lines = content.split("\n");
      const filtered: string[] = [];
      let skip = false;
      for (const line of lines) {
        if (line.includes(HOOK_MARKER)) {
          skip = true;
          continue;
        }
        if (skip && (line.includes("codesense") || line.trim() === "")) {
          continue;
        }
        skip = false;
        filtered.push(line);
      }

      const remaining = filtered.join("\n").trim();
      if (remaining && remaining !== "#!/bin/sh") {
        fs.writeFileSync(hookPath, remaining + "\n", "utf-8");
        console.log("✓ 已从 post-commit hook 移除 codesense 更新");
      } else {
        fs.unlinkSync(hookPath);
        console.log("✓ 已删除空的 post-commit hook");
      }
    } else {
      console.log("  post-commit hook 中未找到 codesense 部分。");
    }
  }

  console.log(`\ncodesense 集成已卸载。项目: ${projectName}`);
}
