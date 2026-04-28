# codesense — 本地语义代码搜索

grep 只能搜字符串，codesense 能搜"意思"。查询"创建实体"能命中 `create_entities()`，即使函数名里没有"创建"二字。

为本地代码库建立向量语义索引，让 Claude 能通过语义搜索精准定位代码片段，并沿 AST 依赖图追踪调用链。零 API 成本，全部本地运行。

## 安装

```bash
# 1. 安装依赖
pnpm install

# 2. 确保已安装 Ollama 和 embedding 模型
ollama pull qwen3-embedding:0.6b

# 3. 构建
node build.js
```

> **入口文件说明**：`run.js` 是开发时的入口（通过 esbuild 即时编译 TypeScript），`skill.js` 是构建产物，作为 Claude Code skill 的使用入口。日常开发用 `node run.js`，skill 调用用 `node skill.js`。

## 使用

```bash
# 初始化（检查环境 + 注册项目）
node skill.js init

# 建立索引
node skill.js index <目录路径>

# 列出已注册项目
node skill.js list

# 语义搜索
node skill.js search "怎么处理认证？"

# 依赖追踪
node skill.js trace "authenticate"

# 增量更新（只处理变更文件）
node skill.js update

# 查看索引状态
node skill.js status

# 安装项目集成（CLAUDE.md 注入 + git post-commit hook）
node skill.js install

# 卸载集成
node skill.js uninstall
```

## 实际效果

**语义搜索** — 用自然语言描述意图，找到对应代码：

```bash
node skill.js search "JWT authentication"
```

```
→ src/auth/middleware.ts:45  verifyToken()      score: 0.89
→ src/services/session.ts:78 validateSession()  score: 0.84
→ src/routes/login.ts:12     handleLogin()      score: 0.76
```

**依赖追踪** — 从一个符号出发，展开完整调用链：

```bash
node skill.js trace "verifyToken"
```

```
verifyToken() [src/auth/middleware.ts:45]
  ├── callers
  │   ├── apiRouter()         [src/routes/api.ts:23]
  │   └── LoggingMiddleware() [src/middleware/log.ts:12]
  └── callees
      ├── jwt.decode()        [external]
      └── raise AuthError     [src/errors.ts:8]
```

### search 参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `-k, --top-k` | 10 | 返回结果数量 |
| `-t, --type` | all | 过滤符号类型（function/class/module） |
| `-l, --lang` | all | 过滤语言（python/typescript/go） |
| `-d, --dir` | all | 过滤目录前缀 |
| `--threshold` | 0.5 | 相似度阈值（0-1） |

### trace 参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--depth` | 3 | 展开深度 |
| `--direction` | both | callers / callees / both |
| `--format` | tree | tree / json / dot |

### 维度策略

`index` 命令支持 `--strategy` 参数控制向量维度：

| 策略 | 行为 |
|------|------|
| `auto`（默认） | <5000 chunk 用 2048 维，>=5000 用 1024 维 |
| `quality` | 强制 2048 维 |
| `performance` | 强制 1024 维 |

## 核心架构

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
        │  向量索引     │          │  (deps.json)  │
        └──────┬───────┘          └──────┬───────┘
               │                         │
               │    ┌──────────────┐     │
               └───→│  index 引擎  │←────┘
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

1. **索引**：代码文件 → tree-sitter AST 分块 → Ollama 生成向量 → LanceDB 存储
2. **查询**：用户问题 → Ollama 查询向量 → LanceDB Top-K 检索 → chunk + 元数据
3. **追踪**：符号名 → AST 依赖图（deps.json）→ 展开 import/call 关系
4. **增量更新**：对比 manifest.json 文件哈希，只处理变更的 chunk

### 分块策略

AST 感知，按代码语义边界分块：

| 语言 | 分块粒度 | 上下文附加 |
|------|----------|-----------|
| Python | 函数/方法/类 | 所属类 docstring + 顶部 import |
| TypeScript/JavaScript | 函数/类/箭头函数 | JSDoc + 顶部 import |
| Go | 函数/方法/结构体 | 结构体定义 + package 声明 |
| Rust | 函数/结构体/impl | 所在 impl 块 |
| Java | 方法/类/接口 | 类注释 |
| C/C++ | 函数/类/结构体 | 头文件 include |
| Markdown | 按标题分段 | 父级标题 |
| 配置文件 | 整文件一个 chunk | 文件路径 |

Embedding 输入格式：`{context}\n\n{symbol} ({chunk_type}, {file_path}:{line_start}):\n{text}`

### 依赖图

所有关系边均由 tree-sitter 提取（EXTRACTED），不做 LLM 推断，确定性无噪声。支持三种关系：`imports`、`calls`、`implements`。

### 项目集成

`install` 命令执行两步操作：

1. **CLAUDE.md 注入** — 在项目 CLAUDE.md 末尾追加 codesense 使用说明（带 marker 定位，`uninstall` 可精准移除）
2. **Git post-commit hook** — 每次提交后自动执行增量更新

## 索引输出

```
codesense-out/
├── index.lance/          # LanceDB 向量索引
├── deps.json             # AST 依赖图
├── manifest.json         # 文件哈希映射（增量更新用）
└── config.json           # 索引配置（模型、维度、策略）
```

## 技术栈

| 组件 | 技术 |
|------|------|
| 语言 | TypeScript (Node.js >=18) |
| 构建 | esbuild（打包为 skill.js） |
| 向量存储 | LanceDB |
| AST 解析 | tree-sitter + 多语言解析器 |
| Embedding | Ollama `qwen3-embedding:0.6b`（MRL 2048→1024 维截断） |
| CLI | commander.js |

## 外部依赖

| 依赖 | 用途 | 安装 |
|------|------|------|
| Ollama | 本地 embedding 服务 | [ollama.com](https://ollama.com) |
| qwen3-embedding:0.6b | 1024/2048 维 embedding 模型 | `ollama pull qwen3-embedding:0.6b` |

## 为什么选 Node.js

Claude Code、Cursor、Windsurf 等 LLM agent 工具链都依赖 Node.js，用户不需要额外安装 Python runtime。`pnpm install` 一步搞定所有依赖。
