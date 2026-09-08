---
title: Yazi — 现代化终端文件管理器入门
date: 2026-06-04
tags:
  - yazi
  - terminal
  - file-manager
  - rust
  - ranger
  - tutorial
description: 用 Yazi 管理终端文件：安装、导航、文件操作、标签页、搜索，以及图片预览和字体排查。
reviewed: 2026-09-07
scope: Yazi 26.9.1 默认键位；Linux、macOS 与 Windows
---

## 什么是 Yazi？

Yazi 是用 Rust 编写的终端文件管理器，提供异步任务处理、文件预览、多标签页与 Lua 插件。熟悉 Vim 的读者可以用 `h/j/k/l` 导航，但文件操作和标签页快捷键仍需要单独学习。

**与其他文件管理器的功能对比：**

| 特性 | ranger | lf | Yazi |
| --- | --- | --- | --- |
| 主要语言 | Python | Go | Rust |
| 扩展方式 | Python 配置与插件 | Shell 命令 | Lua 插件 |
| 多标签页 | 支持 | 交给终端多路复用器管理 | 支持 |
| 预览配置 | 配置预览脚本与显示后端 | 配置预览命令 | 内置预览器，可调用外部依赖 |

这不是性能基准测试。大目录、远程文件系统和预览程序都会影响响应速度；lf 也采用异步 I/O。依据：[ranger](https://github.com/ranger/ranger)、[lf](https://github.com/gokcehan/lf)、[Yazi 安装与依赖](https://yazi-rs.github.io/docs/installation/)。

<TutorialDiagram name="yazi-vs-ranger" />

## 安装

**Linux：以下示例仅适用于 x86_64 GNU/Linux。** 先检查 `uname -m`；其他架构或 musl 系统在 [26.9.1 发布页](https://github.com/sxyazi/yazi/releases/tag/v26.9.1) 选择匹配的压缩包。需要 `curl`、`unzip` 和用于类型识别的 `file`。

```bash
mkdir -p "$HOME/.local/bin"
yazi_tmp=$(mktemp -d)
curl -fL https://github.com/sxyazi/yazi/releases/download/v26.9.1/yazi-x86_64-unknown-linux-gnu.zip -o "$yazi_tmp/yazi.zip"
unzip "$yazi_tmp/yazi.zip" -d "$yazi_tmp"
install -m 755 "$yazi_tmp/yazi-x86_64-unknown-linux-gnu/yazi" "$HOME/.local/bin/yazi"
install -m 755 "$yazi_tmp/yazi-x86_64-unknown-linux-gnu/ya" "$HOME/.local/bin/ya"
export PATH="$HOME/.local/bin:$PATH"
yazi --version
ya --version
```

`yazi` 是文件管理器，`ya` 提供配套 CLI。将 `export PATH=...` 加入实际使用的 Bash/Zsh 启动文件后，新终端也能找到它们。

**Cargo 替代方式：** 当前官方说明要求通过 `yazi-build` 安装，不再使用旧的 `cargo install --locked yazi-fm yazi-cli`。先准备最新稳定 Rust 工具链和系统编译依赖，再运行：

```bash
cargo install --force yazi-build
```

**macOS（已安装 Homebrew）：**

```bash
brew install yazi
yazi --version
```

**Windows（PowerShell，WinGet 与 Scoop 二选一）：**

```powershell
winget install -e --id sxyazi.yazi
# 或
scoop install yazi
```

Windows 还需要 Git for Windows 提供的 `file.exe`。根据真实安装路径设置用户环境变量 `YAZI_FILE_ONE`，例如 `C:\Program Files\Git\usr\bin\file.exe`，然后重开终端。详细步骤见[官方 Windows 安装要求](https://yazi-rs.github.io/docs/installation/#windows)。

按需安装扩展工具：`fd` 用于按文件名搜索，`ripgrep` 用于搜索文件内容，`fzf` 用于模糊跳转，FFmpeg 和 Poppler 分别用于视频与 PDF 预览。完整依赖和平台包名见[官方安装页](https://yazi-rs.github.io/docs/installation/)。

## 基本操作

以下使用 **26.9.1 默认键位**，`g` → `g` 表示依次按两次小写 `g`。旧版本和自定义配置可能不同，可按 `~` 或 `F1` 查看帮助。[26.9.1 默认键位文件](https://github.com/sxyazi/yazi/blob/v26.9.1/yazi-config/preset/keymap-default.toml)

### 导航

| 操作 | 快捷键 |
| --- | --- |
| 向下 / 向上移动 | `j` / `k` 或 `↓` / `↑` |
| 进入光标所在目录 | `l` / `→` |
| 返回上级目录 | `h` / `←` |
| 跳到顶部 | `g` → `g` 或 `Home` |
| 跳到底部 | `G` 或 `End` |
| 向上 / 向下半页 | `Ctrl+U` / `Ctrl+D` |
| 用配置的程序打开文件 | `o` / `Enter` |

`Enter` 调用文件打开规则，进入目录使用 `l`。数字 `1`–`9` 用于切换标签页，不要套用 Vim 的 `50G` 行号跳转。[打开与进入的区别](https://yazi-rs.github.io/docs/faq/#why-cant-open-and-enter-be-a-single-action)

### 文件操作

| 操作 | 快捷键 |
| --- | --- |
| 复制 | `y` → 导航到目标目录 → `p` |
| 移动 | `x` → 导航到目标目录 → `p` |
| 新建文件 / 目录 | `a` → 名称；目录名以 `/` 结尾 |
| 重命名 | `r` |
| 移到回收站 | `d`，检查确认提示 |
| 永久删除 | `D`，检查确认提示 |
| 切换选中状态 | `Space` |
| 全选 | `Ctrl+A` |
| 取消选择 | `Esc` |

先选中文件再进行批量操作；无选择时通常作用于光标所在项。`D` 不经过回收站。操作依据见[官方快速入门](https://yazi-rs.github.io/docs/quick-start/#file-operations)。

### 标签页与退出

| 操作 | 快捷键 |
| --- | --- |
| 在当前目录新建标签页 | `t` → `t` |
| 关闭当前标签页（最后一个时退出） | `Ctrl+C` |
| 切到指定标签页 | `1`–`9` |
| 上一个 / 下一个标签页 | `[` / `]` |
| 退出整个 Yazi | `q` |

直接启动 `yazi` 后退出不会自动改变父 Shell 的目录。如需此功能，按[官方 Shell wrapper](https://yazi-rs.github.io/docs/quick-start/#shell-wrapper) 配置包装函数并用 `y` 启动；此时 `q` 退出并切换目录，`Q` 退出并保留原 Shell 目录。

### 查找、过滤与递归搜索

| 操作 | 快捷键 |
| --- | --- |
| 在当前列表查找文件名 | `/` → 关键词 → `Enter` |
| 下一个 / 上一个匹配 | `n` / `N` |
| 过滤当前列表 | `f` |
| 在目录树中搜索文件名 | `s`（需要 `fd`） |
| 在目录树中搜索文件内容 | `S`（需要 `ripgrep`） |
| 取消正在进行的搜索 | `Ctrl+S` |
| 显示 / 隐藏隐藏文件 | `.` |

`/` 的列表查找与 `s` / `S` 的目录树搜索用途不同。[官方查找与搜索说明](https://yazi-rs.github.io/docs/quick-start/#search-files)

<TutorialDiagram name="yazi-shortcuts" />

## Nerd Font 图标问题

图标显示成方框或问号时，检查负责显示终端的**本地客户端**字体。SSH 与 VS Code Remote 使用本地字体渲染，在远程服务器安装字体不会改变本地显示。[官方字体说明](https://yazi-rs.github.io/docs/faq/#why-are-the-icons-not-displayed-properly)

<TutorialDiagram name="yazi-nerdfont" />

从 [Nerd Fonts 下载页](https://www.nerdfonts.com/font-downloads) 获取 JetBrainsMono 等字体。在 Linux 桌面上，将字体文件放入 `~/.local/share/fonts/` 后执行：

```bash
fc-cache -fv
fc-list | rg -i 'nerd|jetbrains'
```

macOS 使用字体册，Windows 使用系统字体安装功能。安装后，在本地终端设置中选择 `JetBrainsMono Nerd Font Mono` 并重开终端；VS Code 对应设置为 `terminal.integrated.fontFamily`。

## 远程终端兼容性

`Terminal response timeout` 表示启动时的终端能力查询未及时收到回复，可能与终端版本、性能、SSH 延迟或多路复用器有关。先更新软件、比较直接在终端与 tmux/Zellij 内运行的结果；只有提示且功能正常时，官方 FAQ 允许忽略它。不要用不存在的 `[plugin] preload_images = false` 配置作为修复方案。[官方排查步骤](https://yazi-rs.github.io/docs/faq/#how-to-troubleshoot-terminal-response-timeout-errors)

图片预览取决于终端协议和所需依赖。官方兼容表已包含 VS Code 和 Windows Terminal（至少 v1.22.10352.0）；不能笼统写成“不支持”。通过下面的诊断查看 Yazi 实际检测到的环境与图片后端：

```bash
yazi --version
ya env
```

保留终端实际提供的 `TERM`、`TERM_PROGRAM` 等环境变量，随意改成 `xterm-256color` 可能干扰自动检测。跨 SSH、tmux 或 Zellij 时还需核对对应限制。[图片预览兼容表与诊断](https://yazi-rs.github.io/docs/image-preview/)

## 常见问题

- **无法打开、编辑或预览文件？** 先确认 `file` 可用；Windows 检查 `YAZI_FILE_ONE`。Linux/macOS 的文本编辑还需检查 `EDITOR` 或自定义 opener。
- **找不到 `ya`？** 二进制安装时需要同时复制 `yazi` 与 `ya`，并让安装目录位于 `PATH` 中。
- **快捷键与教程不同？** 检查 `yazi --version`、自定义 `keymap.toml` 和 `~` 帮助页。

本文于 2026-09-07 核对官方 26.9.1 文档和默认配置，未执行跨平台安装、图片预览或交互测试。

<PostTags />
