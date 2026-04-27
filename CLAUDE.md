# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

**codesense** 是一个 Claude Code skill，为本地代码库建立向量语义索引，让 Claude 能通过语义搜索精准定位代码片段。Node.js/TypeScript 实现，依赖 Ollama 本地 embedding（零 API 成本）。

项目目前处于设计阶段，完整设计文档见 `codesense_skill_design.md`。

## 技术栈

- **语言**: TypeScript (Node.js >=18)
- **向量存储**: LanceDB (`@lancedb/lancedb`)
- **AST 解析**: tree-sitter + 多语言解析器
- **Embedding**: Ollama (`qwen3-embedding:0.6b`，支持 MRL 2048→1024 维截断)
- **CLI 框架**: commander.js

## 目标文件结构

```
~/.claude/skills/codesense/
├── SKILL.md                    # Skill 定义（触发词、命令参考）
├── package.json / tsconfig.json
├── scripts/                    # install_hook.sh / uninstall_hook.sh
├── references/                 # chunking.md / cli_reference.md
└── src/
    ├── cli.ts                  # CLI 入口（commander.js）
    ├── chunker.ts              # AST 感知分块（tree-sitter）
    ├── embedder.ts             # Ollama embedding 客户端
    ├── index.ts                # LanceDB 索引管理
    ├── graph.ts                # AST 依赖图（deps.json）
    ├── search.ts               # 向量搜索
    ├── trace.ts                # 依赖追踪
    ├── update.ts               # 增量更新（manifest.json + chunk 哈希）
    └── install.ts              # CLAUDE.md 注入 + git hook 安装
```

## 核心架构

**数据流**：
1. **索引**: 代码文件 → tree-sitter AST 分块 → Ollama embedding → LanceDB 存储
2. **查询**: 用户问题 → Ollama 查询向量 → LanceDB Top-K 检索 → chunk + 元数据
3. **追踪**: 符号名 → AST 依赖图 (deps.json) → 展开 import/call 关系

**关键设计决策**：
- 全部 EXTRACTED 边（tree-sitter 提取），不做 LLM 推断关系
- MRL 维度策略：建索引用 2048 维，可截断到 1024 维
- 纯增量更新：manifest.json 记录文件哈希，只处理变更的 chunk
- Skill 模式（bash 命令调用），不做 MCP server

## 外部依赖（需预装）

- **Ollama**: 本地 embedding 服务，默认 `http://localhost:11434`
- **qwen3-embedding:0.6b**: `ollama pull qwen3-embedding:0.6b`

## 索引输出目录

```
codesense-out/
├── index.lance/          # LanceDB 向量索引
├── deps.json             # AST 依赖图
├── manifest.json         # 文件哈希映射（增量更新用）
└── config.json           # 索引配置（模型、维度、分块策略）
```
