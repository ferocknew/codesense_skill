import * as fs from "fs";
import * as path from "path";
import { CLAUDE_MD_MARKER, CLAUDE_MD_END_MARKER, HOOK_MARKER } from "./install";

export async function uninstall(): Promise<void> {
  // Step 1: 移除 CLAUDE.md 中的 codesense 段落
  const claudeMdPath = path.resolve("CLAUDE.md");
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
      console.log("CLAUDE.md 中未找到 codesense 段落。");
    }
  }

  // Step 2: 移除 git hook 中的 codesense 部分
  const hookPath = path.resolve(".git", "hooks", "post-commit");
  if (fs.existsSync(hookPath)) {
    let content = fs.readFileSync(hookPath, "utf-8");
    if (content.includes(HOOK_MARKER)) {
      // 移除 codesense 相关行
      const lines = content.split("\n");
      const filtered = [];
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
      console.log("post-commit hook 中未找到 codesense 部分。");
    }
  }

  console.log("codesense 集成已卸载。索引数据（codesense-out/）未删除。");
}
