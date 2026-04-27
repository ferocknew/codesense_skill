# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

**codesense** 是一个 Claude Code skill，为本地代码库建立向量语义索引，让 Claude 能通过语义搜索精准定位代码片段。Node.js/TypeScript 实现，依赖 Ollama 本地 embedding（零 API 成本）。

完整设计文档见 `codesense_skill_design.md`。

## 构建与开发

```bash
# 安装依赖
pnpm install

# 开发运行（直接 ts-node 模式）
node run.js <command> [args]
# 或
node run.js dev <command>   # same thing

# 构建（esbuild 打包为 skill.js + 更新 SKILL.md 版本号）
node build.js

# 调试命令
node run.js embed-test "测试文本"     # 测试 Ollama embedding 连接
node run.js chunk-test <文件或目录>    # 测试 AST 分块输出
```

构建产物为单个 `skill.js`（通过 esbuild bundle），原生模块（tree-sitter、LanceDB）标记为 external，运行时从 `node_modules` 加载。版本号格式 `YYMMDD.HHmmSS`，构建时自动写入 `SKILL.md`。

## 技术栈

- **语言**: TypeScript (Node.js >=18, ES2022, CommonJS)
- **构建**: esbuild（bundle 到 skill.js）
- **向量存储**: LanceDB (`@lancedb/lancedb`)
- **AST 解析**: tree-sitter + 多语言解析器
- **Embedding**: Ollama (`qwen3-embedding:0.6b`，支持 MRL 2048→1024 维截断)
- **CLI 框架**: commander.js

## 源码结构

```
src/
├── cli.ts          # CLI 入口（commander.js），定义所有命令和选项
├── types.ts        # 共享类型定义（CodeChunk, DepGraph, SearchResult 等）和常量
├── config.ts       # 索引配置管理（维度策略、config.json 读写、status 显示）
├── file-scanner.ts # 目录扫描（排除规则、扩展名→语言映射）
├── chunker.ts      # AST 感知分块（tree-sitter，核心模块，~500行）
├── embedder.ts     # Ollama embedding 客户端（批量/单条、MRL 截断）
├── indexer.ts      # 索引构建主流程（协调 scanner→chunker→embedder→LanceDB）
├── index.ts        # LanceDB 表操作封装
├── graph.ts        # AST 依赖图构建（提取 imports/calls/implements 边）
├── manifest.ts     # manifest.json 管理（文件哈希→chunk 哈希映射）
├── search.ts       # 向量搜索（LanceDB 查询 + 过滤 + 阈值）
├── trace.ts        # 依赖追踪（沿 deps.json 展开 callers/callees）
├── update.ts       # 增量更新（对比 manifest，只处理变更 chunk）
├── install.ts      # 项目集成安装（CLAUDE.md 注入 + git hook）
└── uninstall.ts    # 卸载集成
```

## 核心架构

**数据流**：
1. **索引**: `indexer.ts` 协调 `file-scanner` → `chunker` → `embedder` → `index`（LanceDB），同时 `graph.ts` 构建依赖图
2. **查询**: `search.ts` 接收查询 → `embedder` 向量化 → LanceDB Top-K → 过滤输出
3. **追踪**: `trace.ts` 从 `deps.json`（由 `graph.ts` 生成）展开 import/call 关系树
4. **增量**: `update.ts` 对比 `manifest.json` 哈希，只重新处理变更文件

**关键设计决策**：
- 依赖图只用 EXTRACTED 边（tree-sitter 提取），不做 LLM 推断关系
- MRL 维度策略：auto 模式下 <5000 chunks 用 2048 维，否则 1024 维
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
