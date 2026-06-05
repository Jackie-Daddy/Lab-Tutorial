---
title: Claude Code — AI 驱动的终端编程助手完全指南
date: 2026-06-04
tags:
  - claude-code
  - ai
  - terminal
  - anthropic
  - mcp
  - plugins
  - tutorial
description: Anthropic 推出的命令行 AI 编程助手。理解整个项目、多文件重构、MCP 扩展、插件生态，把终端变成你的 AI 开发工作站。
---
## 什么是 Claude Code？

Claude Code 是 Anthropic 推出的命令行 AI 编程助手。与 GitHub Copilot 的编辑器内补全不同，Claude Code 运行在终端中，与你的代码仓库深度交互：

- 理解整个项目结构，不是单文件补全
- 多文件重构和批量修改
- 自动运行测试并修复失败
- 通过 MCP（Model Context Protocol）接入外部工具
- 插件生态系统，可安装社区开发的 Skills

**对比：**

| 特性       | GitHub Copilot | Cursor     | Claude Code            |
| ---------- | -------------- | ---------- | ---------------------- |
| 交互方式   | 编辑器内联补全 | IDE + Chat | 终端 CLI               |
| 上下文范围 | 当前文件       | 当前项目   | 整个仓库 + MCP 工具    |
| 批量修改   | 不支持         | 有限       | 原生支持               |
| 运行命令   | 不支持         | 有限       | 可直接执行 shell 命令  |
| 插件系统   | 无             | 无         | Skills + MCP 双层扩展  |
| 适用场景   | 写新代码       | 交互式编程 | 复杂重构、调试、自动化 |

![Claude Code vs Copilot vs Cursor](/images/claude-code-vs.svg)

## 安装

```bash
# 前置：Node.js ≥ 18
npm install -g @anthropic-ai/claude-code

# 启动
claude
```

首次启动时需要绑定 Anthropic API key，或配置第三方兼容端点（如 DeepSeek、OpenRouter 等）。

## 基本使用

```bash
# 交互式对话（最常用）
claude

# 单次任务
claude "帮我重构 src/utils.py，把重复代码提取出来"

# 在特定项目中启动
claude --project /path/to/project

# 会话内命令
/add-dir src/        # 添加目录到上下文
/init                # 为项目生成 CLAUDE.md（项目规范文件）
/config              # 修改配置
/clear               # 清空对话上下文
/compact             # 压缩上下文（节省 token）
/mcp                 # 管理 MCP 服务器
```

## MCP 服务器

**MCP（Model Context Protocol）** 是 Claude Code 的扩展机制，让它能调用外部工具。简单说：MCP 服务器 = Claude 的"外挂技能"。

![MCP 架构](/images/claude-code-mcp.svg)

### Codegraph — 代码智能图谱

将项目代码索引成知识图谱，让 Claude 能搜索符号定义和引用、追踪调用链路、分析修改影响范围。

```bash
codegraph init /path/to/your/project

# 配置 MCP 服务器（项目根目录 .mcp.json）
echo '{
  "mcpServers": {
    "codegraph": {
      "command": "codegraph",
      "args": ["serve", "--mcp", "--path", "/absolute/path/to/project"]
    }
  }
}' > .mcp.json
```

### GitHub CLI MCP

让 Claude 直接操作 GitHub（创建 PR、查看 Issue、回复评论等）：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"]
    }
  }
}
```

## 插件系统（Skills & Plugins）

### Superpowers — 开发流程元插件

最重要的插件，为软件开发定义完整工作流规范：

| Skill                              | 触发场景     | 效果                           |
| ---------------------------------- | ------------ | ------------------------------ |
| `brainstorming`                  | 任何新功能前 | 强制先构思再实现，防止方向错误 |
| `test-driven-development`        | 写代码前     | 先写测试，再写实现             |
| `writing-plans`                  | 复杂任务     | 先出计划，审查后再动手         |
| `verification-before-completion` | 声称完成前   | 必须跑验证，不能空口说"修好了" |
| `systematic-debugging`           | 遇到 bug     | 结构化调试，不是改一行试一行   |

安装：

```bash
/claude add plugin superpowers@claude-plugins-official
```

![推荐插件生态](/images/claude-code-plugins.svg)

### Code Review & Simplifier

```bash
/code-review           # 审查当前 diff
/code-review --fix     # 审查并自动修复问题
/simplify              # 消除重复、简化逻辑
```

### Andrej Karpathy Skills — 编码准则

来自 Karpathy 的 LLM 编程最佳实践：避免过度工程化、最小改动原则、明确暴露假设、定义可验证的成功标准。

安装前需添加自定义 marketplace：

```json
// ~/.claude/settings.json
{
  "extraKnownMarketplaces": {
    "karpathy-skills": {
      "source": {
        "source": "github",
        "repo": "forrestchang/andrej-karpathy-skills"
      }
    }
  }
}
```

然后：

```bash
/claude add plugin andrej-karpathy-skills@karpathy-skills
```

### Academic Research Skills

如果你的工作涉及论文写作：

```bash
/claude add plugin academic-research-skills@academic-research-skills
```

常用指令：

```bash
/ars-plan          # 章节规划
/ars-outline       # 详细大纲
/ars-full          # 全流程写论文
/ars-revision      # 根据审稿意见修订
/ars-abstract      # 生成双语摘要
/ars-citation-check # 检查引文错误
```

## 高级配置

### 使用第三方 API 端点

```json
// ~/.claude/settings.json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-api-key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]"
  }
}
```

### 项目级配置（CLAUDE.md）

在每个项目根目录创建 `CLAUDE.md`，Claude Code 每次启动时自动加载：

```markdown
# CLAUDE.md

## 项目概述
这是一个视频异常检测研究项目。

## 环境
- Python 3.10, PyTorch 2.x
- Conda 环境: avqa
- 数据在 datasets/ 目录下

## 编码规范
- 优先使用 Codegraph MCP 进行代码搜索
- 每次修改后必须运行测试
- commit 格式: type: 简短描述
```

## 效率技巧

1. **用 `CLAUDE.md` 管理项目约定**：编码规范、常用命令、架构说明全放里面
2. **组合使用 Slash Commands**：`/brainstorming` → `/plan` → TDD 实现 → `/code-review` → `/simplify`
3. **让 Claude 写 commit message**：`claude "根据当前 diff 写一个规范的 commit message"`
4. **利用 MCP 做代码考古**：`claude "追溯这个 bug 是怎么引入的，从出错函数往回追踪"`
5. **批量修改用 Claude**：`claude "把整个项目里的 print 改成 logging"`

![日常工作流](/images/claude-code-workflow.svg)

## 常见问题

- **API key 配置在哪？** `~/.claude/settings.json` 中的 `env.ANTHROPIC_AUTH_TOKEN`，或通过环境变量传入。
- **如何切换到更便宜的模型？** 修改 `ANTHROPIC_MODEL` 环境变量。
- **MCP 服务器连接失败？** 检查命令是否安装、`.mcp.json` 路径是否为绝对路径、运行 `claude mcp list` 查看状态。

<div class="post-tags-section">
  <span class="label">标签:</span>
  <span class="tag-pill" v-for="tag in $frontmatter.tags" :key="tag">{{ tag }}</span>
</div>
