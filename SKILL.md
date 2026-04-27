---
name: codesense
description: "本地语义代码搜索 - 通过向量索引定位代码片段，支持 AST 依赖追踪。触发：/codesense"
version: 260427.203139
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

# 检查索引是否存在
ls codesense-out/index.lance 2>/dev/null && echo "Index exists" || echo "No index found"
```

如果没有索引，先运行 index 命令。

## 运行方式

```bash
# 建立索引
node "$CLAUDE_SKILL_DIR/skill.js" index <目录路径>

# 语义搜索
node "$CLAUDE_SKILL_DIR/skill.js" search "查询语句"

# 依赖追踪
node "$CLAUDE_SKILL_DIR/skill.js" trace "符号名"

# 增量更新
node "$CLAUDE_SKILL_DIR/skill.js" update

# 查看状态
node "$CLAUDE_SKILL_DIR/skill.js" status

# 安装集成
node "$CLAUDE_SKILL_DIR/skill.js" install
```

## 命令参考

### index [path]
为指定目录建立语义索引。默认当前目录。
- AST 感知分块（函数/类/方法粒度）
- Ollama 本地 embedding（零 API 成本）
- 输出到 `codesense-out/`

### search "query"
语义搜索代码。返回最相关的代码片段 + 文件路径 + 行号。
- `-k, --top-k N` 返回结果数量（默认 10）
- `-t, --type` 过滤符号类型（function/class/module）
- `-l, --lang` 过滤语言（python/typescript/go）
- `-d, --dir` 过滤目录前缀
- `--threshold` 相似度阈值（0-1，默认 0.5）

### trace "symbol"
从指定符号出发，沿 AST 依赖图展开调用链。
- `--depth N` 展开深度（默认 3）
- `--direction callers|callees|both` 方向（默认 both）
- `--format tree|json|dot` 输出格式（默认 tree）

### update
增量更新索引。对比文件哈希，只重新处理变更的 chunk。

### status
查看索引状态：chunk 数量、维度配置、上次更新时间。

### install
安装项目集成：向 CLAUDE.md 注入使用说明 + 安装 git post-commit hook。

### uninstall
卸载集成。

## Claude 使用规则

1. 回答代码定位类问题时，先用 `search` 搜索，再读取命中的源文件
2. 需要理解调用链或影响范围时，用 `trace` 展开依赖
3. 修改代码后，提醒用户运行 `update`（如已安装 hook 则自动触发）
4. 不要把搜索结果当作完整答案——搜索命中后仍需读取源文件确认上下文

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
