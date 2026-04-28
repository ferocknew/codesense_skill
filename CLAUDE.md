# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- codesense-start -->
## codesense

本项目有 codesense 语义代码索引。

Rules:
- 回答"这段代码在哪"、"怎么实现 X"类问题时，先运行 `node "/Volumes/1T_M2/Downloads/code/codesense_skill/skill.js" search "<问题描述>"`
- 需要理解调用链、影响范围时，运行 `node "/Volumes/1T_M2/Downloads/code/codesense_skill/skill.js" trace "<符号名>"`
- 修改代码后，运行 `node "/Volumes/1T_M2/Downloads/code/codesense_skill/skill.js" update` 增量更新（如已安装 hook 则自动触发）
- 搜索返回的是 chunk 级结果，仍需读取源文件确认完整上下文
<!-- codesense-end -->

## 项目简介

**codesense** 是一个 Claude Code skill，为本地代码库建立向量语义索引，让 Claude 能通过语义搜索精准定位代码片段。Node.js/TypeScript 实现，依赖 Ollama 本地 embedding（零 API 成本）。

完整设计文档见 `codesense_skill_design.md`。

## 构建与开发

```bash
# 安装依赖
pnpm install

# 开发运行（通过 esbuild 即时编译 src/cli.ts）
node run.js <command> [args]

# 构建（esbuild 打包 src/cli.ts → skill.js + 更新 SKILL.md 版本号）
node build.js

# 调试命令
node run.js embed-test "测试文本"     # 测试 Ollama embedding 连接
node run.js chunk-test <文件或目录>    # 测试 AST 分块输出
```

- `run.js` 是开发入口（通过 esbuild 即时编译 src/cli.ts 后执行）
- `skill.js` 是构建产物（Claude Code skill 实际调用的）
- `build.js` 是构建脚本，将 src/cli.ts 打包为 skill.js

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
├── cli.ts          # CLI 入口（commander.js），从 scripts/ 加载命令注册
├── types.ts        # 共享类型定义（CodeChunk, DepGraph, SearchResult 等）和常量
├── global.ts       # 全局目录管理（~/.codesense/、registry.json、项目注册）
├── config.ts       # 索引配置管理（维度策略、config.json 读写、status 显示）
├── file-scanner.ts # 目录扫描（排除规则、扩展名→语言映射）
├── chunker.ts      # AST 感知分块（tree-sitter，核心模块，~500行）
├── embedder.ts     # Ollama embedding 客户端（批量/单条、MRL 截断）
├── indexer.ts      # 索引构建主流程（协调 scanner→chunker→embedder→LanceDB）
├── index.ts        # LanceDB 表操作封装
├── graph.ts        # AST 依赖图构建（提取 imports/calls/implements 边）
├── manifest.ts     # manifest.json 管理（文件哈希→chunk 哈希映射）
├── search.ts       # 向量搜索（LanceDB 查询 + 过滤 + 阈值 + --project 支持）
├── trace.ts        # 依赖追踪（沿 deps.json 展开 callers/callees）
├── update.ts       # 增量更新（对比 manifest，只处理变更 chunk）
├── install.ts      # init 命令实现（环境检查 + 全局目录 + CLAUDE.md 注入 + git hook）
├── uninstall.ts    # 卸载集成（从 registry 移除 + 清理索引数据）
├── server.ts       # HTTP 服务器（端口 54321，REST API + SSE 实时推送）
├── server-state.ts # 服务器内存状态（项目索引状态追踪）
├── auto-indexer.ts # 定时轮询自动索引（遍历注册项目，增量更新 + SSE 广播）
└── html/
    └── index.ts    # HTML 仪表板模板（内联 CSS/JS，SSE 客户端）

scripts/
├── init.ts         # init 命令注册
├── list.ts         # list 命令注册（列出已注册项目）
├── index_cmd.ts    # index 命令注册
├── search.ts       # search 命令注册（含 --project 选项）
├── trace.ts        # trace 命令注册
├── update.ts       # update 命令注册
├── status.ts       # status 命令注册
├── server.ts       # server 命令注册（--port, --interval）
└── uninstall.ts    # uninstall 命令注册
```

## 核心架构

**数据流**：
1. **init**: `install.ts` 检查 Ollama → 创建 `~/.codesense/` → 注册项目 → CLAUDE.md + git hook
2. **索引**: `indexer.ts` 协调 `file-scanner` → `chunker` → `embedder` → `index`（LanceDB），输出到 `~/.codesense/projects/<name>/`
3. **查询**: `search.ts` 接收查询 → `embedder` 向量化 → LanceDB Top-K → 过滤输出（支持 --project 指定/全部项目）
4. **追踪**: `trace.ts` 从 `deps.json`（由 `graph.ts` 生成）展开 import/call 关系树
5. **增量**: `update.ts` 对比 `manifest.json` 哈希，只重新处理变更文件

**关键设计决策**：
- 全局管理模式：所有项目索引统一存储在 `~/.codesense/projects/` 下
- 依赖图只用 EXTRACTED 边（tree-sitter 提取），不做 LLM 推断关系
- MRL 维度策略：auto 模式下 <5000 chunks 用 2048 维，否则 1024 维
- 纯增量更新：manifest.json 记录文件哈希，只处理变更的 chunk
- Skill 模式（bash 命令调用），不做 MCP server
- 命令注册式拆分：scripts/ 下每个文件导出 register(program)

## 外部依赖（需预装）

- **Ollama**: 本地 embedding 服务，默认 `http://localhost:11434`
- **qwen3-embedding:0.6b**: `ollama pull qwen3-embedding:0.6b`

## 全局目录结构

```
~/.codesense/
├── registry.json        # 项目注册表（name → {path, createdAt}）
├── global-config.json   # 全局配置（model, ollamaUrl）
├── projects/
│   └── <项目名>/
│       ├── index.lance/ # LanceDB 向量索引
│       ├── deps.json    # AST 依赖图
│       ├── manifest.json # 文件哈希映射（增量更新用）
│       └── config.json  # 索引配置（模型、维度、策略）
└── cache/
```

## 变更记录

### 2026-04-28 全局化改造

**目标**：将项目本地索引模式改为全局管理模式（`docs/update.md`）

**核心变更**：
1. **新增 `src/global.ts`** — 全局目录管理（`~/.codesense/`、registry.json、项目注册/注销）
2. **`install` → `init`** — 环境检查（Ollama + 模型）→ 创建全局目录 → 注册项目 → CLAUDE.md + git hook
3. **索引路径迁移** — 从本地 `codesense-out/` 改为 `~/.codesense/projects/<name>/`，涉及 config.ts、indexer.ts、search.ts、update.ts、trace.ts、index.ts
4. **新增 `list` 命令** — 列出所有已注册项目及索引状态
5. **`search --project`** — 支持指定项目名或 `--project all` 跨项目搜索
6. **`scripts/` 命令拆分** — 8 个命令注册文件，每个导出 `register(program)`，cli.ts 静态导入
7. **`run.js` 改造** — 开发模式改为 esbuild 即时编译（原 require ts 方式不可用）
8. **`build.js`** — entryPoints 从 `run.js` 改为 `src/cli.ts`

**踩坑与解决**：
- esbuild 不支持动态 `require()` 路径 → cli.ts 改为静态 import 所有 scripts/
- `run.js` 直接 require `.ts` 文件失败 → 改为 esbuild 即时编译到 tmp 文件再执行
- `build.js` 的 entryPoints 曾指向 `run.js`（esbuild 包装器）导致 skill.js 卡住 → 改为 `src/cli.ts`
- `OUTPUT_DIR` 常量删除后，trace.ts 仍引用旧常量和 getOutputDir → 一并迁移到 global.ts 的项目目录解析

