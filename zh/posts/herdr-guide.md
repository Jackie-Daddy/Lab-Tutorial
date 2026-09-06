---
title: Herdr — AI 编程助手的终端指南
date: 2026-09-06
tags:
  - herdr
  - terminal
  - ai
  - server
  - tutorial
description: 用 Herdr 管理多个 AI 编程助手：从安装、分屏和状态追踪，到会话恢复、SSH 远程开发与命令行协作。
---
## 什么是 Herdr？

同时开着几个 AI 编程助手时，最麻烦的往往不是启动它们，而是搞清楚：哪个还在运行，哪个已经完成，哪个停在权限确认界面等你回答。

[Herdr](https://herdr.dev/) 是用 Rust 编写的终端工作区管理器。它把真实的终端进程放进窗格，提供分屏、标签页、后台会话，并识别 Claude Code、Codex、OpenCode 等编程助手的工作状态。你仍然在窗格里运行原来的命令，Herdr 负责组织终端、显示状态和提供控制接口。

**已经用过本网站的 [tmux](./how-to-use-tmux) 或 [Zellij](./zellij-guide) 教程？** 分屏和脱离会话的思路可以直接迁移。Herdr 更值得尝试的地方，是集中查看多个 Agent 的状态，以及通过 CLI 操作它们。工具能否识别某个 Agent，取决于对应的进程检测、屏幕规则或集成；普通 shell 程序也能照常运行。[官方 Agent 说明](https://herdr.dev/docs/agents/)

::: tip 版本说明
本文依据 2026-09-06 核对的稳定版 **v0.8.2** 文档编写。升级后若快捷键或参数不同，以 `herdr --help`、子命令的 `--help` 和界面内的快捷键帮助为准。[发布记录](https://github.com/herdrdev/herdr/releases/tag/v0.8.2)
:::

## 安装

**Linux / macOS：官方安装脚本**

```bash
curl -fsSL https://herdr.dev/install.sh | sh
```

**使用 Homebrew 的用户**

```bash
brew install herdr
```

**Windows：在 PowerShell 中安装**

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"
```

以上方式选一种即可。也可以从 [GitHub Releases](https://github.com/herdrdev/herdr/releases) 下载对应系统和 CPU 架构的二进制。Windows 的 ZIP 需要完整解压并保留同目录的运行库，不能只取出 `herdr.exe`。

安装完成后，新开一个终端检查：

```bash
herdr --version
herdr --help
```

Herdr 不会替你安装或登录 AI 编程助手。先确认要用的 CLI 能在普通终端中正常启动，再把它放进 Herdr。[官方安装说明](https://herdr.dev/docs/install/)

## 核心概念

先区分这四层，就不会把“新建工作区”和“新开一个终端”混在一起：

| 层级 | 含义 | 可以怎样组织 |
| --- | --- | --- |
| Session（会话） | 一个持久化的后台服务命名空间 | 日常先用默认会话 |
| Workspace（工作区） | 项目级容器 | 一个仓库或一个独立任务 |
| Tab（标签页） | 工作区内的一组布局 | 开发、日志、检查结果 |
| Pane（窗格） | 一个真实终端 | Agent、测试命令或普通 shell |

<TutorialDiagram name="herdr-hierarchy" />

工作区里的窗格会共享所在机器的文件系统。**新建 Workspace 不会自动隔离代码修改**；若多个 Agent 要并行修改同一仓库，先使用独立的 Git worktree，再分别打开对应目录。只是查看日志、运行测试时，可以按任务需要使用同一份代码。

通常一个默认 Session 加多个 Workspace 就够用。确实需要独立的运行状态时，再使用命名会话：

```bash
herdr session list
herdr session attach lab
```

`lab` 是你选择的会话名；命名会话各自维护窗格和运行状态，但仍共用全局配置文件。[概念说明](https://herdr.dev/docs/concepts/) · [命名会话](https://herdr.dev/docs/persistence-remote/)

## 五分钟上手

### 启动与分屏

在项目目录执行：

```bash
herdr
```

这会启动或连接默认后台会话。首次进入空会话时会自动创建工作区；已有会话会恢复原来的界面，不会因为你换了启动目录就自动切换到新项目。

在第一个窗格运行已安装的助手，例如 `claude`。然后按 **`Ctrl+B` → `v`** 向右分屏，在新窗格运行测试或查看 `git diff`。需要另一个项目时，用工作区菜单创建对应工作区。

鼠标也能完成大部分操作：点击切换窗格，拖动分隔线调整大小，右键打开菜单。拖选文本可以复制，不必用可能中断进程的 `Ctrl+C`。[快速入门](https://herdr.dev/docs/quick-start/)

### 常用快捷键

下表中的箭头表示：**先按 `Ctrl+B`，松开，再按后一个键**。大写字母要按住 `Shift`。

| 操作 | 默认快捷键 |
| --- | --- |
| 查看当前快捷键 | `Ctrl+B` → `?` |
| 向右 / 向下分屏 | `Ctrl+B` → `v` / `-` |
| 切换左 / 下 / 上 / 右窗格 | `Ctrl+B` → `h` / `j` / `k` / `l` |
| 放大 / 还原当前窗格 | `Ctrl+B` → `z` |
| 新建标签页 | `Ctrl+B` → `c` |
| 下一个 / 上一个标签页 | `Ctrl+B` → `n` / `p` |
| 工作区导航 | `Ctrl+B` → `w` |
| 新建工作区 | `Ctrl+B` → `N` |
| 进入复制模式 | `Ctrl+B` → `[` |
| 脱离界面，保留后台任务 | `Ctrl+B` → `q` |
| 关闭当前窗格 | `Ctrl+B` → `x` |

复制模式里可以用 `/` 搜索、`v` 开始选择、`y` 复制。**关闭窗格会影响其中的任务，离开时优先用脱离操作。** 完整按键以 [官方键盘指南](https://herdr.dev/docs/keyboard/) 和界面帮助为准。

## 看懂 Agent 状态

| 状态 | 表示什么 | 接下来做什么 |
| --- | --- | --- |
| `working` | 正在执行任务 | 可以切到其他工作区 |
| `blocked` | 识别到需要输入、批准或决策的界面 | 打开窗格，读清问题后回答 |
| `done` | 已完成，但你还没查看 | 检查输出、改动和测试结果 |
| `idle` | 已查看的完成状态，或正在等待输入 | 可以交付下一个任务 |
| `unknown` | 无法可靠判断 | 直接查看窗格内容 |

状态会汇总到标签页和工作区，方便找到需要处理的任务。但 **`done` 不是测试通过的证明**，`idle` 也不保证没有问题。依赖屏幕规则的 Agent 遇到新版提示界面时可能被误判，最终仍要查看实际输出。[状态定义](https://herdr.dev/docs/concepts/) · [检测机制](https://herdr.dev/docs/agents/)

### 安装可选集成

以已安装并完成首次初始化的 Claude Code、Codex CLI 为例，按需执行对应命令：

```bash
herdr integration install claude
herdr integration install codex
herdr integration status
```

这些命令会修改相应助手的用户配置，安装 Herdr 的 hook。**在 v0.8.2 中，这两个集成主要提供原生会话标识，用于重启后的对话恢复；它们的工作状态仍依赖屏幕规则。** 其他 Agent 的集成可能直接上报完整生命周期，不能一概而论。[集成说明](https://herdr.dev/docs/integrations/)

## 实际工作流：修改、验证、检查

以实验室代码仓库为例，可以在一个工作区中安排两个标签页：

- **开发**：一个 Agent 修改指定模块，另一个窗格运行项目原有的测试。
- **检查**：查看 `git diff`、日志和实验结果，确认修改符合预期。

<TutorialDiagram name="herdr-workflow" />

给 Agent 的任务尽量写清修改范围、验证命令和完成条件。例如：“修复数据加载器对空目录的处理；只修改相关模块；运行现有测试；最后说明修改原因和测试结果。”把测试失败输出带回同一任务，比反复要求“再检查一下”更具体。

如果再开一个 Agent 做审查，可以先要求它只读分析当前 diff。需要它同时修改代码时，给它独立 worktree 和明确的文件范围；Herdr 的状态栏不会替你解决 Git 冲突。

### 进阶：从命令行调度一个检查助手

以下示例在 **已有 Herdr 会话的 shell 窗格内、Git 仓库目录中** 执行，需要 `jq` 和已配置好的 `codex`。新窗格会使用当前目录；`reviewer` 必须是当前会话内未被占用的 Agent 名称。

```bash
# 创建窗格，并读取返回的真实 ID
split_json=$(herdr pane split --current --direction right --no-focus --cwd "$PWD")
review_pane=$(printf '%s\n' "$split_json" | jq -er '.result.pane.pane_id')

# 在新窗格启动助手，然后交付检查任务
herdr agent start reviewer --kind codex --pane "$review_pane"
herdr agent prompt reviewer "Review the current git diff. Do not edit files. Report bugs and missing tests." \
  --wait --timeout 120000

# 读取当前可见输出
herdr agent read reviewer --source visible
```

`--timeout` 的单位是毫秒。`--wait` 默认会在 `idle`、`done` 或 `blocked` 时返回，因此返回后仍要检查状态和输出；超时只说明等待超时。如果助手停在登录或批准界面，先进入窗格处理，再提交任务。`agent start` 使用已有空闲 shell 窗格，不能代替分屏命令。[自动化指南](https://herdr.dev/docs/agent-automation/) · [CLI 参数](https://herdr.dev/docs/cli-reference/)

## 会话保持与远程开发

### 脱离不等于停止

按 `Ctrl+B` → `q` 脱离，再运行 `herdr` 即可回来。后台服务仍在运行、所在机器保持运行且没有休眠时，窗格里的任务可以继续执行。

<TutorialDiagram name="herdr-lifecycle" />

| 发生什么 | 原进程是否继续 | 回来后会看到什么 |
| --- | --- | --- |
| 脱离客户端后重连 | 后台服务正常时会继续 | 原来的终端和运行状态 |
| SSH 断开后重连远端 | 远端服务正常时会继续 | 远端的原会话 |
| Herdr 服务停止或机器重启 | 不会 | 保存的布局和目录；符合条件的 Agent 可恢复原生对话 |

重启后的布局恢复不会重新执行任意训练、测试或开发服务器命令。恢复 Agent 对话还需要有效的官方集成会话标识；最近屏幕内容的磁盘保存属于另一个功能，默认关闭。[会话恢复说明](https://herdr.dev/docs/session-state/)

### 在实验室服务器上使用

最直接的方式是先 SSH，再在远端运行 Herdr。将 `lab-server` 换成你的 SSH 主机别名，并提前在远端安装 Herdr：

```bash
ssh lab-server
herdr
```

离开时脱离 Herdr，再退出 SSH。下次连接同一服务器、使用同一用户运行 `herdr`，即可回到默认会话。

也可以在本地安装 Herdr，使用 SSH 远程连接模式：

```bash
herdr --remote lab-server

# 连接远端的命名会话
herdr --remote lab-server --session lab
```

该模式使用正常的 OpenSSH 认证。先确认 `ssh lab-server` 能连接；若远端缺少匹配版本，交互式启动可能提示安装。v0.8.2 支持 Linux/macOS 远端主机，本地客户端可以是 Linux、macOS 或 Windows。[远程访问说明](https://herdr.dev/docs/persistence-remote/)

## 常用配置与更新

Linux/macOS 配置位于 `~/.config/herdr/config.toml`，Windows 位于 `%APPDATA%\herdr\config.toml`。没有配置文件也能使用。先通过 `herdr --default-config` 查看默认项，再按需合并下面的内容；已有同名 TOML 表时修改原表即可。

```toml
[keys]
prefix = "ctrl+a"

[ui]
mouse_capture = true

[ui.toast]
delivery = "herdr"
delay_seconds = 1
```

这里把前缀改为 `Ctrl+A`，此后文中的 `Ctrl+B` 操作也要相应替换。配置中的通知显示在 Herdr 内；需要 SSH 终端通知时，可查看官方文档里的 `terminal` 投递选项及终端支持情况。

```bash
herdr server reload-config
```

大部分界面配置可以热重载，启动时设置仍可能需要重启。[配置指南](https://herdr.dev/docs/configuration/)

更新时沿用安装渠道：官方脚本安装使用 `herdr update`，Homebrew 安装使用 `brew upgrade herdr`。需要重启后台服务的更新应放在任务结束后；不要在训练或 Agent 工作到一半时随手停止服务。[更新说明](https://herdr.dev/docs/install/)

## 常见问题

- **找不到 `herdr` 命令？** 新开终端，检查安装目录是否在 `PATH` 中；远程使用时还要检查远端用户的环境。
- **快捷键没反应？** 确认是先按前缀再按动作键，检查是否改过前缀、输入法是否处于英文模式，并用前缀加 `?` 查看当前绑定。
- **状态看起来不对？** 从 `herdr agent list` 找到目标，再用 `herdr agent explain <target>` 查看识别依据。若 Herdr 窗格内又启动了 tmux，Agent 会藏在另一层进程后面，影响识别。[检测排查](https://herdr.dev/docs/agents/)
- **新开终端怎么还是旧项目？** `herdr` 默认重连原会话；通过工作区菜单新建项目，或在目标目录执行 `herdr workspace create --cwd "$PWD" --label my-project`。[CLI 参考](https://herdr.dev/docs/cli-reference/)
- **怎样彻底停止？** 确认任务已结束后，默认会话用 `herdr server stop`；命名会话用 `herdr session stop lab`。这会停止会话中的窗格进程。[会话管理](https://herdr.dev/docs/persistence-remote/)

<div class="post-tags-section">
  <span class="label">标签:</span>
  <span class="tag-pill" v-for="tag in $frontmatter.tags" :key="tag">{{ tag }}</span>
</div>
