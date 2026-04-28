---
name: codesense
description: "本地语义代码搜索 - 通过向量索引定位代码片段，支持 AST 依赖追踪。触发：/codesense"
version: 260428.103337
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

运行 codesense 命令前，先确认依赖和索引状态：

```bash
# 检查 node_modules 是否存在
ls "$CLAUDE_SKILL_DIR/node_modules" 2>/dev/null && echo "deps ok" || echo "need install"

# 如果依赖缺失，先安装
cd "$CLAUDE_SKILL_DIR" && pnpm install
```

如果是首次使用，先运行 `init` 命令。

## 运行方式

```bash
# 初始化（检查 Ollama + 创建全局目录 + 注册当前项目）
node "$CLAUDE_SKILL_DIR/skill.js" init

# 建立索引（存储到 ~/.codesense/projects/<项目名>/）
node "$CLAUDE_SKILL_DIR/skill.js" index <目录路径>

# 列出已注册项目
node "$CLAUDE_SKILL_DIR/skill.js" list

# 语义搜索（当前项目）
node "$CLAUDE_SKILL_DIR/skill.js" search "查询语句"

# 语义搜索（指定项目）
node "$CLAUDE_SKILL_DIR/skill.js" search "查询语句" --project projectA

# 语义搜索（所有项目）
node "$CLAUDE_SKILL_DIR/skill.js" search "查询语句" --project all

# 依赖追踪
node "$CLAUDE_SKILL_DIR/skill.js" trace "符号名"

# 增量更新
node "$CLAUDE_SKILL_DIR/skill.js" update

# 查看状态
node "$CLAUDE_SKILL_DIR/skill.js" status
```

## 命令参考

### init [path]
初始化 codesense。默认当前目录。
- 检查 Ollama 服务和 qwen3-embedding:0.6b 模型
- 创建 `~/.codesense/` 全局目录
- 注册当前项目到 registry
- 注入 CLAUDE.md 使用说明 + 安装 git post-commit hook

### index [path]
为指定目录建立语义索引。默认当前目录。
- AST 感知分块（函数/类/方法粒度）
- Ollama 本地 embedding（零 API 成本）
- 输出到 `~/.codesense/projects/<项目名>/`

### list
列出所有已注册的项目及其索引状态。

### search "query"
语义搜索代码。返回最相关的代码片段 + 文件路径 + 行号。
- `-k, --top-k N` 返回结果数量（默认 10）
- `-t, --type` 过滤符号类型（function/class/module）
- `-l, --lang` 过滤语言（python/typescript/go）
- `-d, --dir` 过滤目录前缀
- `--threshold` 相似度阈值（0-1，默认 0.5）
- `-p, --project <name>` 指定项目（或 `all` 搜索全部项目）

### trace "symbol"
从指定符号出发，沿 AST 依赖图展开调用链。
- `--depth N` 展开深度（默认 3）
- `--direction callers|callees|both` 方向（默认 both）
- `--format tree|json|dot` 输出格式（默认 tree）

### update
增量更新索引。对比文件哈希，只重新处理变更的 chunk。

### status [project]
查看索引状态。可指定项目名，默认显示当前项目或全部项目。

### uninstall [path]
卸载项目集成。从 registry 移除、清理索引数据、移除 CLAUDE.md 和 hook。

## Claude 使用规则

1. 回答代码定位类问题时，先用 `search` 搜索，再读取命中的源文件
2. 需要理解调用链或影响范围时，用 `trace` 展开依赖
3. 修改代码后，提醒用户运行 `update`（如已安装 hook 则自动触发）
4. 不要把搜索结果当作完整答案——搜索命中后仍需读取源文件确认上下文

## 全局目录结构

```
~/.codesense/
├── registry.json        # 项目注册表
├── global-config.json   # 全局配置
├── projects/
│   └── <项目名>/
│       ├── index.lance  # LanceDB 向量索引
│       ├── deps.json    # AST 依赖图
│       ├── manifest.json # 文件哈希映射
│       └── config.json  # 索引配置
└── cache/
```

## 外部依赖

- **Ollama**: 本地 embedding 服务（默认 `http://localhost:11434`）
- **qwen3-embedding:0.6b**: embedding 模型（`ollama pull qwen3-embedding:0.6b`）

## 支持的语言

| 语言 | AST 分块 |
|------|----------|
| Python | 函数/方法/类 |
| TypeScript/JavaScript | 函数/类/箭头函数 |
| Go | 函数/方法/结构体 |
| Rust | 函数/结构体/impl |
| Java | 方法/类/接口 |
| C/C++ | 函数/类/结构体 |
| Markdown | 按标题分段 |
| 配置文件 | 整文件一个 chunk |
