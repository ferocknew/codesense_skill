# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
├── embedder.ts     # Embedding 客户端（Ollama 批量/单条、MRL 截断、可配 batchSize/delay、createEmbedderFromGlobalConfig 工厂函数）
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
    ├── index.ts    # HTML 模板
    ├── css.ts      # CSS 样式导出
    └── dashboard.ts # JavaScript 逻辑（Sigma.js/Graphology 图谱 + 设置面板）

scripts/
├── init.ts         # init 命令注册
├── list.ts         # list 命令注册（列出已注册项目）
├── index_cmd.ts    # index 命令注册（自动转发 server 后台执行）
├── search.ts       # search 命令注册（含 --project 选项）
├── trace.ts        # trace 命令注册
├── update.ts       # update 命令注册（自动转发 server 后台执行）
├── forward.ts      # Server 检测与转发（ensureServer + forwardToServer）
├── status.ts       # status 命令注册
├── server.ts       # server 命令注册（--port）
├── clear.ts        # clear 命令注册（清除索引数据）
└── uninstall.ts    # uninstall 命令注册（只移除集成，不删索引）
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

### 2026-04-29 Embedding 设置 + 后台索引 + Bug 修复

**Embedding 参数可配置**（降低低配机器 CPU 压力）：
- `EmbeddingConfig` 新增 `batchSize`（默认 32）/ `batchDelay`（默认 0ms）字段
- `GlobalConfig`（DB `global_config` 表）同步扩展，存取新 key
- `embedder.ts` 新增 `createEmbedderFromGlobalConfig(dimensions)` 工厂函数，从 DB 读全局配置构建 embedder
- `indexer.ts`/`update.ts`/`search.ts` 全部改用工厂函数，embedder 不再硬编码参数
- Dashboard 设置面板：齿轮按钮 → 滑入面板 → Ollama URL / Model / Batch Size / Batch Delay
- Server API：`GET/PUT /api/settings`（含参数校验：batchSize 1-100，batchDelay 0-10000ms）

**CLI index/update 后台化**：
- `scripts/forward.ts`：`ensureServer()` 检测 server 运行状态，未运行则 detached spawn 启动
- `forwardToServer()` 向 server POST 任务请求，CLI 秒返回
- `index`/`update` 命令先尝试转发 server，不可达才本地执行兜底
- 新增 `--local` 参数强制本地执行

**Bug 修复 + 行为优化**：
- `install.ts` 的 `installDependencies()` 路径错误：`path.resolve(__dirname, "..")` 在打包后多跳一级，改为 `__dirname`
- 页面刷新后进度条消失：初始化时从 `/api/status` 恢复 `indexing` 状态的项目进度条
- `uninstall` 不再删除索引数据：只移除 CLAUDE.md 注入 + git hook，索引保留供 re-init 复用
- 新增 `clear` 命令：彻底删除索引数据（原 uninstall 的删除行为）
- `init` 检测已有索引：有则提示"索引已存在，无需重建"
- `skill.js` 已加入 git 跟踪（`.gitignore` 已移除排除）

### 2026-04-29 Dashboard 图谱重构 + 实时化 + 全局化

- **图谱重构**：Sigma.js + Graphology 替换 ECharts，力导向布局，节点可拖拽/缩放/点击详情
- **实时通知**：`notifyServer()` CLI→Server HTTP POST，SSE 即时广播前端（零延迟）
- **进度条**：indexer 5 阶段进度（scanning→chunking→embedding→writing→deps），项目卡片实时显示
- **git hook**：异步 `nohup` 不阻塞 commit，husky 兼容
- **全局化**：`~/.codesense/` 全局目录 + SQLite 元数据，`list`/`search --project`，manifest 增量更新
- **AST 依赖**：tree-sitter 替换正则，跨文件 import 映射，搜索去重
- 修改 `src/html/` 下文件需 `node build.js` + 重启服务器

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **codesense_skill** (881 symbols, 1737 relationships, 74 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/codesense_skill/context` | Codebase overview, check index freshness |
| `gitnexus://repo/codesense_skill/clusters` | All functional areas |
| `gitnexus://repo/codesense_skill/processes` | All execution flows |
| `gitnexus://repo/codesense_skill/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

<!-- codesense-start -->
## codesense

本项目有 codesense 语义代码索引。

Rules:
- 回答"这段代码在哪"、"怎么实现 X"类问题时，先运行 `node "/Volumes/1T_M2/Downloads/code/codesense_skill/skill.js" search "<问题描述>"`
- 需要理解调用链、影响范围时，运行 `node "/Volumes/1T_M2/Downloads/code/codesense_skill/skill.js" trace "<符号名>"`
- 修改代码后，运行 `node "/Volumes/1T_M2/Downloads/code/codesense_skill/skill.js" update` 增量更新（如已安装 hook 则自动触发）
- 搜索返回的是 chunk 级结果，仍需读取源文件确认完整上下文
<!-- codesense-end -->
