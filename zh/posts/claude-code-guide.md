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
reviewed: 2026-09-07
scope: Claude Code 终端 CLI；2026-09-07 官方文档
---
## 什么是 Claude Code？

Claude Code 是 Anthropic 的 AI 编程助手，本文介绍它的终端 CLI。它可以读取项目文件、跨文件修改代码、运行命令和测试，并通过 MCP 连接外部工具。实际结果仍需检查 diff、测试输出和任务要求。[产品概览](https://code.claude.com/docs/en/overview)

**如何理解不同工具的入口？**

| 工具 | 常见工作入口 | 本文的区分 |
| --- | --- | --- |
| GitHub Copilot | 编辑器补全、IDE Agent、云端 Agent | 补全只是其中一种模式 |
| Cursor | IDE 中的 Agent 与代码编辑 | Agent 可以编辑文件和运行命令 |
| Claude Code | 终端 CLI，也提供其他客户端 | 下文聚焦从 shell 启动的工作流 |

这些产品都有持续演进的 Agent 能力，不能用“Copilot 只能看当前文件”或“Cursor 不支持批量修改”概括。[GitHub Agent 文档](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent) · [Cursor Agent 文档](https://cursor.com/docs/agent/overview)

<TutorialDiagram name="claude-code-vs" />

## 安装

macOS、Linux 或 WSL 使用官方原生安装器：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows PowerShell 使用：

```powershell
irm https://claude.ai/install.ps1 | iex
```

选择符合平台的一种方式。原生安装不要求先安装 Node.js；其他方式与系统要求以[安装文档](https://code.claude.com/docs/en/setup)为准。

```bash
claude --version
claude --help
cd /path/to/project
claude
```

把 `/path/to/project` 换成你的项目目录。首次启动按提示登录支持 Claude Code 的账户，或使用 Anthropic Console API 凭据；并非所有用户都必须手动配置 API key。[认证说明](https://code.claude.com/docs/en/authentication)

## 基本使用

在项目目录的 shell 中执行：

```bash
# 交互式会话
claude

# 带初始任务的交互式会话
claude "帮我重构 src/utils.py，把重复代码提取出来"

# 非交互输出，完成后退出
claude -p "解释 src/utils.py 的主要职责，不修改文件"

# 进入指定项目，再启动
cd /path/to/project
claude
```

`claude "任务"` 仍会进入交互模式；脚本需要输出后退出时用 `-p`。项目目录由当前工作目录决定，没有这里原先写的 `--project` 启动参数。[CLI 参考](https://code.claude.com/docs/en/cli-reference)

以下内容在 **Claude Code 会话内**输入，每条单独发送，不是在 Bash 中执行：

```text
/init
/config
/clear
/compact
/mcp
```

`/init` 生成项目指令草稿，编辑后再使用；其余命令分别用于设置、新对话、上下文压缩和 MCP 管理。输入 `/` 查看当前安装实际提供的命令。`/add-dir /path/to/other-project` 是增加文件访问目录，不会把目录内全部内容立即塞入上下文。[命令参考](https://code.claude.com/docs/en/commands)

## MCP 服务器

**MCP（Model Context Protocol）** 让 Claude Code 调用服务器提供的工具。服务器是否支持代码索引、搜索或修改远程数据，取决于具体实现，不能从“MCP”这个名称推断。

<TutorialDiagram name="claude-code-mcp" />

### 选择服务器与配置作用域

先确认服务器的维护者、安装方式和官方 README，再配置启动命令或 HTTP 地址。`claude mcp add` 默认保存为当前项目下的个人配置；`--scope project` 使用可共享的 `.mcp.json`，`--scope user` 才是跨项目配置。修改已有 `.mcp.json` 时合并 `mcpServers`，不要覆盖其他服务器。[MCP 配置说明](https://code.claude.com/docs/en/mcp)

### GitHub 官方远程 MCP

下面使用 GitHub 维护的 HTTP 服务，不需要安装一个名为“GitHub CLI MCP”的 npm 包。在项目 `.mcp.json` 中合并：

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_PAT}"
      }
    }
  }
}
```

启动 `claude` 前，通过你的凭据管理方式将 GitHub PAT 提供到当前 shell 的 `GITHUB_PAT` 环境变量中，并只授权所需仓库与操作。Claude Code 支持在 MCP 配置的 headers 中展开环境变量，因此无需把真实令牌写进仓库。[环境变量展开](https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcpjson) · [GitHub 安装指南](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md)

```bash
claude mcp list
claude mcp get github
```

再在会话内用 `/mcp` 检查连接。工具能否访问私有仓库、创建 PR 或回复评论，取决于令牌权限与工具授权。

## 插件系统（Skills & Plugins）

### Superpowers — 开发流程插件

Superpowers 是可选的社区工作流插件，覆盖需求讨论、计划、测试、调试和完成前验证。安装不代表这些检查已经执行，仍要读实际结果。[项目 README](https://github.com/obra/superpowers)

| Skill | 用途 |
| --- | --- |
| `brainstorming` | 澄清需求和设计 |
| `test-driven-development` | 先确认失败测试，再实现 |
| `writing-plans` | 拆解实施步骤 |
| `verification-before-completion` | 声称完成前检查验证证据 |
| `systematic-debugging` | 按证据排查错误 |

在 Claude Code 会话中安装：

```text
/plugin marketplace add anthropics/claude-plugins-official
/plugin install superpowers@claude-plugins-official
```

如果市场已添加，可省略第一条。安装后按界面提示激活或重启，通过 `/plugin` 检查状态。[插件安装说明](https://code.claude.com/docs/en/discover-plugins)

<TutorialDiagram name="claude-code-plugins" />

### 内置 Code Review 与 Simplify

当前官方命令参考列出了以下内置工作流。先在 `/` 菜单确认你的版本可用，再按需逐条执行：

```text
/code-review
/code-review --fix
/simplify
```

`/code-review` 检查正确性问题和清理机会，`--fix` 会修改代码；`/simplify` 侧重清理并直接应用修改，不代替正确性审查。之后仍需检查 diff、重新验证。[内置工作流](https://code.claude.com/docs/en/commands)

注意另行安装的旧 `code-review` 插件是 PR 审查工具，其脚本可调用 `gh pr comment` 发布评论。不要把它当成同一个只读本地检查；使用插件前查看实际来源与说明。[插件命令源码](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-review/commands/code-review.md)

### Karpathy Skills — 社区整理的编码准则

这是社区根据 Karpathy 的公开观察整理的项目，并非 Karpathy 本人维护的官方插件。内容侧重暴露假设、保持简单、限定改动范围和定义验证标准。[项目说明](https://github.com/multica-ai/andrej-karpathy-skills)

```text
/plugin marketplace add multica-ai/andrej-karpathy-skills
/plugin install andrej-karpathy-skills@karpathy-skills
```

### 研究写作类 Skills

研究类插件没有统一的 `/ars-*` 命令集。选择有明确仓库、维护者和安装说明的插件，先在 `/plugin` 或其 README 中核对实际命令。也可以把实验记录要求、文献来源要求和章节流程写成项目自己的 Skill；结构见[官方 Skills 文档](https://code.claude.com/docs/en/skills)。

## 高级配置

### API 凭据与网关

- 直接调用 Anthropic API 时使用 `ANTHROPIC_API_KEY`。
- 使用要求 Bearer 令牌的网关时，按网关文档配置 `ANTHROPIC_AUTH_TOKEN`。
- `ANTHROPIC_BASE_URL` 指定网关地址；仅修改地址不代表认证或 API 兼容性已经正确。

这些变量可以由 shell 或安全的凭据管理流程提供。自定义端点需支持 Claude Code 所需的 API；不能假定任意 OpenAI 兼容端点都能直接使用。模型标识以所用服务的实际支持列表为准。[认证变量](https://code.claude.com/docs/en/authentication) · [网关说明](https://code.claude.com/docs/en/llm-gateway)

### 项目级配置（CLAUDE.md）

在项目根目录维护 `CLAUDE.md`，写清环境、修改边界和验证方法。已有文件时合并内容。它提供会话指令，不会安装依赖或保证模型遵从。[项目记忆](https://code.claude.com/docs/en/memory)

```markdown
# 项目说明

## 项目概述
这是一个视频异常检测研究项目。

## 环境
- Python 版本与依赖以项目锁文件为准
- 使用项目规定的虚拟环境
- 数据在 datasets/ 目录下，不要修改原始数据

## 编码规范
- 修改前查找现有实现，限定在任务相关文件内
- 运行 README 中与本次修改相关的验证命令，报告实际结果
- commit 格式: type: 简短描述
```

## 效率技巧

1. **用 `CLAUDE.md` 管理项目约定**：保留可核对的环境与验证命令。
2. **先明确范围再实施**：复杂任务先用 `/plan`；安装插件后从菜单确认其实际命令。
3. **让 Claude 起草提交说明**：`claude "根据当前 diff 起草 commit message，不要提交"`。
4. **追溯 bug**：提供错误输出、复现步骤和相关提交，要求指出依据。
5. **批量修改后复核**：分阶段查看 diff 并运行项目检查，不能只依据“完成了”的回复。

<TutorialDiagram name="claude-code-workflow" />

## 常见问题

- **找不到 `claude`？** 新开终端，检查安装目录是否在 `PATH`，再查安装文档。
- **API key 配置后仍未生效？** 区分 `ANTHROPIC_API_KEY` 与网关 Bearer 凭据；在会话中用 `/status` 确认当前认证方式，不要输出真实密钥。
- **怎样切换模型？** 在 `/model` 查看当前账户可选项；脚本参数和环境变量用法见 CLI 参考。
- **MCP 连接失败？** 用 `claude mcp list` 和 `/mcp` 查看错误；本地服务器检查可执行文件路径，HTTP 服务器检查 URL、网络和认证变量。

<PostTags />
