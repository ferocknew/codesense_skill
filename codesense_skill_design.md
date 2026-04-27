# codesense — 本地语义代码搜索 Skill 设计说明

## 1. 项目概述

**codesense** 是一个 Claude Code skill，为本地的代码库建立向量语义索引，让 Claude 能够通过语义搜索精准定位代码片段。

**核心价值**：grep 只能搜字符串，codesense 能搜"意思"。查询"创建实体"能命中 `create_entities()`，即使函数名里没有"创建"二字。

**灵感来源**：借鉴 graphify 的三个集成策略（CLAUDE.md 注入、git commit hook、结构化关系），但用向量搜索替代 LLM 语义提取——免费、本地、确定性。

**技术选型**：Node.js/TypeScript 实现。Claude Code 等 LLM agent 工具链中 Node.js 是必装的，Python 不一定存在。使用 Node.js 确保零额外依赖。

## 2. 核心架构

```
                        ┌──────────────────────────┐
                        │      用户 / Claude        │
                        └─────────┬────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              codesense search            codesense trace
            "怎么处理认证？"           "authenticate"
                    │                           │
                    ▼                           ▼
            ┌──────────────┐          ┌──────────────┐
            │  LanceDB     │          │  AST 依赖图   │
            │  向量索引     │          │  (JSON 文件)  │
            └──────┬───────┘          └──────┬───────┘
                   │                         │
                   │    ┌──────────────┐     │
                   └───→│  codesense   │←────┘
                        │  index 引擎  │
                        └──────┬───────┘
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼              ▼
          ┌────────────┐ ┌──────────┐ ┌───────────┐
          │ tree-sitter │ │  Ollama  │ │  LanceDB  │
          │ AST 分块    │ │ embedding│ │  写入     │
          └────────────┘ └──────────┘ └───────────┘
```

**数据流**：

1. **索引阶段**：代码文件 → tree-sitter AST 分块 → Ollama 生成向量 → LanceDB 存储
2. **查询阶段**：用户问题 → Ollama 生成查询向量 → LanceDB Top-K 检索 → 返回 chunk + 元数据
3. **追踪阶段**：从命中的符号名 → AST 依赖图展开 import/call 关系

## 3. Skill 文件结构

```
~/.claude/skills/codesense/
├── SKILL.md                    # Skill 定义（必须）
├── package.json                # Node.js 依赖声明
├── tsconfig.json               # TypeScript 配置
├── scripts/
│   ├── install_hook.sh         # 安装 git post-commit hook
│   └── uninstall_hook.sh       # 卸载 hook
├── references/
│   ├── chunking.md             # 分块策略详细说明
│   └── cli_reference.md        # CLI 命令完整参考
└── src/                        # TypeScript 核心代码
    ├── cli.ts                  # CLI 入口（commander.js）
    ├── chunker.ts              # AST 感知分块
    ├── embedder.ts             # Ollama embedding 客户端
    ├── index.ts                # LanceDB 索引管理
    ├── graph.ts                # AST 依赖图
    ├── search.ts               # 向量搜索
    ├── trace.ts                # 依赖追踪
    ├── update.ts               # 增量更新
    └── install.ts              # CLAUDE.md 注入 + hook 安装
```

## 4. SKILL.md 模板

```yaml
---
name: codesense
description: "本地语义代码搜索 - 通过向量索引定位代码片段，支持 AST 依赖追踪。触发：/codesense"
trigger: /codesense
triggers:
  - codesense
  - 代码搜索
  - 语义搜索
  - code search
  - semantic search
---

# codesense — 本地语义代码搜索

## 前置检查

运行 codesense 命令前，先确认索引是否存在：

```bash
ls codesense-out/index.lance 2>/dev/null && echo "Index exists" || echo "No index found"
```

如果没有索引，先运行 `/codesense index`。

如果提示依赖缺失，运行安装：

```bash
cd "$CLAUDE_SKILL_DIR" && npm install
```

## 命令参考

### /codesense index [path]
为指定目录建立索引。默认当前目录。
- AST 感知分块（函数/类/方法粒度）
- Ollama 本地 embedding（零 API 成本）
- 输出到 `codesense-out/`

### /codesense search "查询语句"
语义搜索代码。返回最相关的代码片段 + 文件路径 + 行号。
- 支持中文和英文查询
- 返回 Top-K 结果（默认 10）
- 可通过 `--type function|class|module` 过滤符号类型
- 可通过 `--lang python|typescript|go` 过滤语言

### /codesense trace "符号名"
从指定符号出发，沿 AST 依赖图展开调用链。
- 显示 import 关系、调用关系
- 支持 `--depth N` 控制展开深度（默认 3）
- 支持 `--direction callers|callees` 控制方向

### /codesense update
增量更新索引。对比文件哈希，只重新处理变更的 chunk。

### /codesense install
安装项目集成：
1. 向 CLAUDE.md 注入 codesense 使用说明
2. 安装 git post-commit hook（自动增量更新）

### /codesense serve
启动 MCP stdio server，暴露 codesense 工具给其他 AI 代理。

## Claude 使用规则

1. 回答代码定位类问题时，先用 `codesense search` 搜索，再读取命中的源文件
2. 需要理解调用链或影响范围时，用 `codesense trace` 展开依赖
3. 修改代码后，提醒用户运行 `codesense update`（如已安装 hook 则自动触发）
4. 不要把搜索结果当作完整答案——搜索命中后仍需读取源文件确认上下文
```

## 5. CLI 命令设计

### 5.1 `codesense index [path]`

**输入**：目录路径（默认 `.`）

**流程**：
1. 扫描目录，排除 `.git`、`node_modules`、`__pycache__`、`.venv` 等
2. 按文件类型选择对应的 tree-sitter 解析器
3. AST 感知分块（详见第 6.1 节）
4. 对每个 chunk 调用 Ollama embedding API
5. 写入 LanceDB 索引
6. 同时提取 AST 依赖图，写入 `codesense-out/deps.json`
7. 保存 manifest（文件哈希映射表）到 `codesense-out/manifest.json`

**输出**：
```
codesense-out/
├── index.lance/          # LanceDB 向量索引
├── deps.json             # AST 依赖图（符号级）
├── manifest.json         # 文件哈希映射（用于增量更新）
└── config.json           # 索引配置（模型名、维度、分块策略）
```

### 5.2 `codesense search "query"`

**参数**：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--top-k` | 10 | 返回结果数量 |
| `--type` | all | 过滤符号类型（function/class/module） |
| `--lang` | all | 过滤语言 |
| `--dir` | all | 过滤目录前缀 |
| `--threshold` | 0.5 | 相似度阈值（0-1） |

**输出格式**（JSON）：
```json
{
  "results": [
    {
      "score": 0.87,
      "symbol": "create_entities",
      "type": "function",
      "file": "src/service/mem/entity.py",
      "line_start": 45,
      "line_end": 78,
      "text": "def create_entities(entities: list[EntityCreate], user_id: str) -> ...",
      "context": "class EntityService(MemoryServiceBase):"
    }
  ]
}
```

### 5.3 `codesense trace "symbol_name"`

**参数**：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--depth` | 3 | 展开深度 |
| `--direction` | both | callers / callees / both |
| `--format` | tree | tree / json / dot |

**输出示例**：
```
authenticate() [src/app/utils/auth.py:23]
  ├── callers (谁调用了它)
  │   ├── verify_token() [src/app/application.py:15]
  │   │   └── LoggingMiddleware.dispatch() [src/app/utils/auth.py:67]
  │   └── get_user_id() [src/app/utils/auth.py:31]
  └── callees (它调用了谁)
      ├── jwt.decode() [external]
      └── raise AuthorizationError [src/app/utils/auth.py:12]
```

### 5.4 `codesense update`

**流程**：
1. 读取 `manifest.json`（文件路径 → SHA256 哈希）
2. 扫描当前文件，对比哈希
3. 删除已变更文件的旧 chunk（从 LanceDB 和 deps.json）
4. 对变更文件重新分块 → embedding → 写入
5. 更新 manifest

**纯增量，只处理变更部分。**

### 5.5 `codesense install`

**两步操作**：

**Step 1 — 注入 CLAUDE.md**：
在项目 `CLAUDE.md` 末尾追加：
```markdown
## codesense

本项目有 codesense 语义代码索引。

Rules:
- 回答代码定位问题时，先运行 `codesense search "<问题描述>"` 搜索相关代码
- 需要理解调用链或影响范围时，运行 `codesense trace "<符号名>"`
- 修改代码后，运行 `codesense update` 增量更新索引（如已安装 hook 则自动触发）
```

**Step 2 — 安装 git hook**：
写入 `.git/hooks/post-commit`：
```bash
#!/bin/sh
# codesense auto-update on commit
codesense update --quiet 2>/dev/null || true
```

### 5.6 `codesense status`

查看索引状态：
- 索引是否存在、chunk 数量、维度配置
- 上次更新时间
- 建索引进度（后台模式时）

## 6. 核心模块设计

### 6.0 向量维度策略

qwen3-embedding 支持 MRL（Matryoshka Representation Learning），可以用 2048 维生成向量，搜索时截断到 1024 维而不损失精度。

| 项目规模 | chunk 数 | 推荐维度 | 索引大小 | 搜索延迟 |
|----------|----------|----------|----------|----------|
| 小型（<5000 chunk） | <5K | 2048 | ~80MB | ~4ms |
| 中型（5000-20000 chunk） | 5K-20K | 1024 | ~80MB | ~2ms |
| 大型（>20000 chunk） | >20K | 1024 | ~160MB+ | ~3ms |

**配置方式**（`codesense-out/config.json`）：

```json
{
  "model": "qwen3-embedding:0.6b",
  "dimensions": 1024,
  "dimensions_full": 2048,
  "strategy": "auto"
}
```

- `strategy: "auto"` — chunk 数 <5000 用 2048，>=5000 用 1024
- `strategy: "quality"` — 强制 2048 维
- `strategy: "performance"` — 强制 1024 维

**MRL 截断**：建索引时始终请求 2048 维向量，存储时根据配置截断到目标维度。未来如需升级精度，只需重新截断，不需要重新 embedding。

**后台索引模式**：当 chunk 数 >10000 或用户指定 `--background` 时，索引在子进程中后台构建：

```bash
codesense index . --background    # 后台建索引，不阻塞终端
codesense status                   # 查看索引进度
```

### 6.1 分块策略（chunker.ts）

**原则**：AST 感知，按代码语义边界分块。

| 语言 | 分块粒度 | 上下文附加 |
|------|----------|-----------|
| Python | 函数/方法/类 | 所属类的 docstring + 模块顶部 import |
| TypeScript/JavaScript | 函数/类/箭头函数 | 所属类的 JSDoc + 顶部 import |
| Vue SFC | `<script>` 块按函数分、`<template>` 整块 | 组件名 + props 定义 |
| Go | 函数/方法/结构体 | 所属结构体定义 + package 声明 |
| Markdown | 按 `##` 标题分段 | 父级标题作为上下文前缀 |
| 配置文件（.yaml/.json/.toml） | 整文件一个 chunk | 文件路径 |
| 其他 | 按空行分段，每段 256-512 token | 文件路径 |

**Chunk 数据结构**：
```typescript
interface CodeChunk {
  text: string              // 代码文本
  symbol: string            // 符号名（函数名/类名）
  chunkType: string         // function / class / method / module / section
  filePath: string          // 相对路径
  lineStart: number         // 起始行号
  lineEnd: number           // 结束行号
  language: string          // python / typescript / go / ...
  context: string           // 附加上下文（类 docstring、import 列表等）
  textHash: string          // SHA256(text)，用于增量更新
}
```

**Embedding 输入拼接**：
```
{context}\n\n{symbol} ({chunk_type}, {file_path}:{line_start}):\n{text}
```
这样 embedding 既包含代码内容，也包含位置和类型信息。

### 6.2 向量索引（index.ts）

**依赖**：`@lancedb/lancedb`（Node.js SDK）

```typescript
import * as lancedb from "@lancedb/lancedb"

const db = await lancedb.connect("./codesense-out")
const table = await db.createTable("chunks", [
  {
    vector: new Float32Array(1024),   // 或 2048 维，按配置
    text: "def create_entities(...",
    symbol: "create_entities",
    chunkType: "function",
    filePath: "src/service/mem/entity.py",
    lineStart: 45,
    lineEnd: 78,
    language: "python",
    textHash: "abc123...",
  }
])
```

**查询**：
```typescript
const results = await table
  .search(queryVector)
  .where("language = 'python'")    // 可选元数据过滤
  .limit(10)
  .toArray()
```

### 6.3 依赖图（graph.ts）

**数据结构**（`deps.json`）：
```json
{
  "nodes": {
    "entity_createentities": {
      "symbol": "create_entities",
      "file": "src/service/mem/entity.py",
      "line": 45,
      "type": "function"
    }
  },
  "edges": [
    {
      "from": "entity_createentities",
      "to": "entitydao_batch_create",
      "relation": "calls",
      "confidence": "EXTRACTED"
    },
    {
      "from": "entity_createentities",
      "to": "observationdao_batch_add",
      "relation": "calls",
      "confidence": "EXTRACTED"
    }
  ]
}
```

**与 graphify 的关键区别**：
- 所有边都是 `EXTRACTED`（tree-sitter 提取，确定性）
- 没有 `INFERRED` 边（不花钱让 LLM 猜关系）
- 没有聚类/社区检测（不需要，向量搜索直接定位）

### 6.4 增量更新（update.ts）

**manifest.json 结构**：
```json
{
  "src/service/mem/entity.py": "abc123...",
  "src/db_dao/entity_dao.py": "def456...",
  ...
}
```

**更新流程**：
1. 计算所有文件的新哈希
2. 对比旧哈希，找出 `added`、`modified`、`deleted` 文件
3. `deleted`：从 LanceDB 和 deps.json 中删除对应 chunk
4. `modified`：删除旧 chunk + 重新分块 + embedding + 写入
5. `added`：分块 + embedding + 写入
6. 更新 manifest.json

### 6.5 Embedding 客户端（embedder.ts）

**依赖**：Node.js 内置 `fetch`（Node 18+）

```typescript
interface EmbeddingConfig {
  baseUrl: string       // 默认 "http://localhost:11434"
  model: string         // 默认 "qwen3-embedding:0.6b"
  dimensions: number    // 1024 或 2048，按配置
}

class OllamaEmbedder {
  private config: EmbeddingConfig

  constructor(config?: Partial<EmbeddingConfig>) {
    this.config = {
      baseUrl: "http://localhost:11434",
      model: "qwen3-embedding:0.6b",
      dimensions: 1024,
      ...config,
    }
  }

  async embed(texts: string[]): Promise<number[][]> {
    const resp = await fetch(`${this.config.baseUrl}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.config.model, input: texts }),
    })
    const data = await resp.json() as { embeddings: number[][] }
    // MRL 截断：API 返回 2048 维，按配置截断到目标维度
    return data.embeddings.map(e => e.slice(0, this.config.dimensions))
  }

  async embedQuery(text: string): Promise<number[]> {
    return (await this.embed([text]))[0]
  }
}
```

**批量策略**：每次最多 32 个 chunk，避免 Ollama OOM。

## 7. 集成方式

### 7.1 CLAUDE.md 注入

**注入时机**：`codesense install`

**注入内容**（追加到项目 CLAUDE.md 末尾）：

```markdown
## codesense

本项目有 codesense 语义代码索引（`codesense-out/`）。

Rules:
- 回答"这段代码在哪"、"怎么实现 X"类问题时，先运行 `codesense search "<问题描述>"`
- 需要理解调用链、影响范围时，运行 `codesense trace "<符号名>"`
- 修改代码后，运行 `codesense update` 增量更新（如已安装 hook 则自动触发）
- 搜索返回的是 chunk 级结果，仍需读取源文件确认完整上下文
```

### 7.2 Git Post-commit Hook

**安装**：`codesense install` 自动写入 `.git/hooks/post-commit`

```bash
#!/bin/sh
# codesense auto-update: only process changed files
codesense update --quiet 2>/dev/null || true
```

**卸载**：`codesense uninstall` 移除 hook 内容 + CLAUDE.md 段落

## 8. 依赖清单

### 运行时依赖（package.json）

| 依赖 | 版本 | 用途 |
|------|------|------|
| `tree-sitter` | ^0.21 | AST 解析核心（Node.js 原生绑定） |
| `tree-sitter-python` | ^0.23 | Python 解析器 |
| `tree-sitter-javascript` | ^0.23 | JS 解析器 |
| `tree-sitter-typescript` | ^0.23 | TypeScript 解析器 |
| `tree-sitter-go` | ^0.23 | Go 解析器 |
| `tree-sitter-rust` | ^0.23 | Rust 解析器 |
| `tree-sitter-java` | ^0.23 | Java 解析器 |
| `tree-sitter-c` | ^0.23 | C 解析器 |
| `tree-sitter-cpp` | ^0.23 | C++ 解析器 |
| `@lancedb/lancedb` | ^0.18 | 向量存储和检索（Node.js SDK） |
| `commander` | ^12 | CLI 参数解析 |

**为什么选 Node.js**：Claude Code、Cursor、Windsurf 等 LLM agent 工具链都依赖 Node.js，用户不需要额外安装 Python。`npm install` 一步搞定。

### 外部依赖

| 依赖 | 用途 | 安装方式 |
|------|------|----------|
| **Ollama** | 本地 embedding 服务 | [ollama.com](https://ollama.com) |
| **qwen3-embedding:0.6b** | 1024/2048 维 embedding 模型 | `ollama pull qwen3-embedding:0.6b` |
| **Node.js** | >=18（fetch API 原生支持） | Claude Code 已自带 |

### 可选依赖

| 依赖 | 用途 |
|------|------|
| `tree-sitter-*` 更多语言 | 按项目需要安装更多解析器 |
| `chalk` | CLI 彩色输出 |
| `ora` | 进度条显示 |

## 9. 与 graphify 的对比

### 从 graphify 继承的优点

| 策略 | graphify 做法 | codesense 做法 |
|------|---------------|----------------|
| CLAUDE.md 注入 | `graphify claude install` | `codesense install`（相同模式） |
| Git hook | `graphify hook install` | `codesense install`（相同模式） |
| 结构化关系 | LLM 推断 INFERRED 边 | tree-sitter 提取 EXTRACTED 边（确定性） |
| 增量更新 | manifest.json + 文件哈希 | manifest.json + chunk 哈希（更细粒度） |

### 关键改进

| 维度 | graphify | codesense |
|------|----------|-----------|
| **核心查询方式** | 图遍历（BFS/DFS） | 向量相似度搜索 |
| **能回答的问题** | "A 和 B 什么关系" | "哪段代码做了 X" |
| **首次索引成本** | LLM token（花钱） | Ollama 本地（免费） |
| **增量更新成本** | 可能需要 LLM | 本地 embedding（免费） |
| **关系准确性** | INFERRED 边有噪声 | 全部 EXTRACTED，确定性 |
| **结果粒度** | 文件级或符号级 | chunk 级（函数体） |
| **grep 能替代吗** | 基本能 | **不能**——语义匹配 |

### 设计取舍

| 选择 | 理由 |
|------|------|
| **Node.js 而非 Python** | Claude Code 等 agent 工具链必装 Node.js，Python 不一定存在 |
| 不用知识图谱 | AST 依赖图已足够表示结构关系，不需要社区检测或超边 |
| 不用 LLM 语义提取 | 花钱且有噪声，向量搜索本身就是语义理解 |
| 不做 HTML 可视化 | skill 的消费者是 Claude，不是人，不需要可视化 |
| 不做 Obsidian 导出 | 同上，skill 不需要人类可浏览的输出 |
| **MRL 向量维度策略** | 建索引用 2048 维，搜索时可截断到 1024 维，兼顾精度和性能 |
| **后台索引模式** | 大型项目不阻塞终端，后台慢慢建索引 |
| **不做 MCP server** | 只用 skill 模式，Claude 通过 bash 命令调用，减少复杂度 |
