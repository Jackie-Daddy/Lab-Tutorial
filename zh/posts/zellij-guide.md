---
title: Zellij — 现代化终端多路复用器完全指南
date: 2026-06-04
tags:
  - zellij
  - terminal
  - tmux
  - rust
  - server
  - tutorial
description: 比 tmux 更开箱即用的终端多路复用器。分屏、标签页、浮动窗格、会话保持，一个工具搞定所有终端需求。
reviewed: 2026-09-07
scope: Zellij 0.45.1 默认键位；Linux、macOS 与 WSL
---

## 什么是 Zellij？

Zellij 是用 Rust 编写的终端多路复用器。一个会话中可以组织多个标签页和窗格，分别运行编辑器、Shell 与监控命令；客户端脱离后，会话可以继续在原机器上运行。

**与 tmux 的使用方式对比：**

<TutorialDiagram name="zellij-vs-tmux" />

| 特性 | tmux | Zellij |
| --- | --- | --- |
| 操作提示 | 前缀键、命令与键位帮助 | 多种操作模式、底部快捷键提示 |
| 浮动界面 | `display-popup` 弹出窗口 | 可浮动、嵌入的窗格 |
| 布局 | 内置布局、命令与脚本 | KDL 布局文件 |
| 扩展 | 命令、脚本与第三方插件 | WASM 插件 |
| 会话共享 | 多个客户端连接同一会话 | 多个客户端连接同一会话 |
| 配置 | `tmux.conf` | `config.kdl` |

两者都能直接使用，也都支持状态栏与会话共享；选择取决于操作习惯和现有工作流。参见 [tmux 入门文档](https://github.com/tmux/tmux/wiki/Getting-Started) 与 [Zellij 文档](https://zellij.dev/documentation/)。

## 安装

**Linux / WSL：以下二进制示例仅适用于 x86_64。** 先用 `uname -m` 确认架构；ARM64 等其他架构请在 [0.45.1 发布页](https://github.com/zellij-org/zellij/releases/tag/v0.45.1) 选择对应资产。需要已安装 `curl`、`tar`。

```bash
mkdir -p "$HOME/.local/bin"
zellij_tmp=$(mktemp -d)
curl -fL https://github.com/zellij-org/zellij/releases/download/v0.45.1/zellij-x86_64-unknown-linux-musl.tar.gz -o "$zellij_tmp/zellij.tar.gz"
tar -xzf "$zellij_tmp/zellij.tar.gz" -C "$zellij_tmp"
install -m 755 "$zellij_tmp/zellij" "$HOME/.local/bin/zellij"
export PATH="$HOME/.local/bin:$PATH"
zellij --version
```

`export` 只影响当前 Shell。需要长期使用时，将这一行加入实际使用的 Bash/Zsh 启动文件。WSL 中安装的是 Linux 程序。

**macOS（已安装 Homebrew）：**

```bash
brew install zellij
zellij --version
```

已有 Rust 工具链时，也可以选择 `cargo install --locked zellij`。包管理器版本可能与本文不同；不要假设所有 Ubuntu/Debian 仓库都包含 Zellij。其他方式见[官方安装说明](https://zellij.dev/documentation/installation)。

## 核心概念

Zellij 的分层结构：

<TutorialDiagram name="zellij-hierarchy" />

Zellij 使用**模态操作**。本文按 **0.45.1 默认键位、Normal 模式起步**说明：`Ctrl+P` 进入窗格模式，`Ctrl+T` 进入标签页模式，`Ctrl+O` 只进入会话模式。它们是不同模式的入口。

`Ctrl+P` → `r` 表示先按组合键、松开，再按小写 `r`。大小写有区别；自定义键位或其他预设以当前状态栏为准。[0.45.1 默认键位](https://github.com/zellij-org/zellij/blob/v0.45.1/zellij-utils/assets/config/default.kdl)

**会话生命周期：**

<TutorialDiagram name="zellij-lifecycle" />

## 基本操作

### 会话管理

| 操作 | 命令 / 快捷键 |
| --- | --- |
| 新建会话 | `zellij` |
| 创建命名会话 | `zellij -s project-name` |
| 脱离，保持后台运行 | `Ctrl+O` → `d` |
| 连接指定会话 | `zellij attach project-name` |
| 查看会话列表 | `zellij list-sessions` |
| 结束当前会话及其窗格 | `Ctrl+Q`（非 Locked 模式） |
| 结束指定运行中的会话 | `zellij kill-session project-name` |
| 删除已退出会话的恢复记录 | `zellij delete-session project-name` |

离开前希望任务继续运行时，应使用 **detach**。`Ctrl+Q` 和 `kill-session` 会结束会话；`delete-session` 清除恢复记录，和断开客户端用途不同。未指定名称的 `attach` 行为取决于已有会话数量。[CLI 命令](https://zellij.dev/documentation/commands)、[会话恢复与删除](https://zellij.dev/documentation/session-resurrection)

### 窗格（Pane）操作

每次从 Normal 模式先按 `Ctrl+P`，然后：

| 操作 | 按键 |
| --- | --- |
| 向右 / 向下新建窗格 | `r` / `d` |
| 移动焦点 | 方向键或 `h/j/k/l` |
| 关闭当前窗格 | `x` |
| 切换窗格全屏 | `f` |
| 显示 / 隐藏浮动窗格 | `w` |
| 当前窗格在浮动与嵌入间切换 | `e` |
| 重命名窗格 | `c` → 输入名称 → `Enter` |

分屏等操作会返回 Normal 模式；连续执行时重新按 `Ctrl+P`。方向移动可在 Pane 模式中连续进行，完成后按 `Enter` 返回。

<TutorialDiagram name="zellij-panes" />

### 标签页（Tab）操作

| 操作 | 快捷键 |
| --- | --- |
| 新建标签页 | `Ctrl+T` → `n` |
| 切到第 1–9 个标签页 | `Ctrl+T` → `1`–`9` |
| 前一个 / 后一个标签页 | `Ctrl+T` → `h` / `l` |
| 关闭当前标签页及其窗格 | `Ctrl+T` → `x` |
| 重命名标签页 | `Ctrl+T` → `r` → 名称 → `Enter` |

### 回看、搜索与调整大小

| 操作 | 快捷键 |
| --- | --- |
| 回看输出 | `Ctrl+S` → `j/k` 或方向键 |
| 搜索输出 | `Ctrl+S` → `s` → 关键词 → `Enter` |
| 搜索下一个 / 上一个结果 | 搜索模式中 `n` / `p` |
| 调整大小 | `Ctrl+N` → `+` / `-` 或方向键 |
| 暂时将按键交给窗格程序 | `Ctrl+G` 进入 Locked；再按 `Ctrl+G` 返回 |

这些表格对应[默认配置中的各模式](https://github.com/zellij-org/zellij/blob/v0.45.1/zellij-utils/assets/config/default.kdl)。Locked 是键盘输入模式，不能作为访问控制锁屏。

## 进阶配置

先查看当前安装版本的默认配置：

```bash
zellij setup --dump-config
```

常用路径是 `~/.config/zellij/config.kdl`；首次启动可能已经创建配置，请先查看再修改。环境变量、命令行参数和 macOS 原生配置路径也会影响查找顺序，详见[配置文档](https://zellij.dev/documentation/configuration)。

默认已经支持 Vim 式导航。若只想修改少量键位，保留默认值再添加覆盖，例如为 Normal 模式增加 `Alt+r` 向右分屏：

```kdl
keybinds {
  normal {
    bind "Alt r" { NewPane "Right"; }
  }
}
```

不要把不完整片段改成 `keybinds clear-defaults=true`：这会同时移除进入、退出各模式的默认绑定。

**布局模板：** 创建 `~/.config/zellij/layouts/dev.kdl`，用两个左右并排的窗格和底部状态栏组织工作区。运行前需安装 `yazi`；也可以去掉 `command="yazi"`，改用普通 Shell。

```kdl
layout {
  tab name="editor" {
    pane split_direction="vertical" {
      pane command="yazi"
      pane
    }
    pane size=1 borderless=true {
      plugin location="zellij:status-bar"
    }
  }
}
```

```bash
zellij --layout dev
```

`split_direction="vertical"` 创建左右排列的子窗格；默认方向是上下排列。[布局文档](https://zellij.dev/documentation/layouts)

<TutorialDiagram name="zellij-layout" />

## 远程开发

在**服务器上**启动 Zellij，SSH 客户端断开后，服务器与会话进程仍存活时任务才能继续。下次连接同一主机、同一用户的会话：

```bash
ssh -t myserver 'zellij attach --create project-name'
```

服务器重启、作业被终止或主动退出会话后，不能继续原来的进程。Zellij 的 session resurrection 可以重建布局并提供重新运行命令的入口；它不会恢复训练进程的内存状态。[会话恢复说明](https://zellij.dev/documentation/session-resurrection)

## 常见问题

- **状态栏箭头显示异常？** 在配置根级加入 `simplified_ui true`，或在本地终端选择支持相应字符的字体。
- **鼠标选择与复制冲突？** 在配置根级加入 `mouse_mode false`，并新建会话使该选项生效。
- **编辑器与快捷键冲突？** 用 `Ctrl+G` 进入 Locked 模式，完成后再次按 `Ctrl+G` 返回；也可以调整具体模式绑定。

选项含义见[官方配置选项](https://zellij.dev/documentation/options)。本文于 2026-09-07 核对官方文档与 0.45.1 配置源码，未在各平台执行安装或交互测试。

<PostTags />
