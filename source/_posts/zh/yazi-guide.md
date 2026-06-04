---
title: Yazi — 现代化终端文件管理器入门
title_en: Yazi — Getting Started with the Modern Terminal File Manager
date: 2026-06-04
tags: [yazi, terminal, file-manager, rust, ranger, tutorial]
lang: zh
slug: yazi-guide
description: 比 ranger 更快的终端文件管理器。异步 I/O、图片预览、vim 式操作、多标签页，让你的文件浏览效率翻倍。
---

## 什么是 Yazi？

Yazi 是用 Rust 编写的终端文件管理器，对标 ranger/lf。核心卖点：

- **异步 I/O**：目录加载和文件预览不阻塞操作，速度远超 ranger
- **图片预览**：支持 Kitty/iTerm2/Sixel/Überzug++ 等多种图片协议
- **内置功能丰富**：多标签页、批量重命名、模糊搜索、FIFO 管道、插件系统
- **vim 式操作**：`h/j/k/l` 导航，`y`/`p` 复制粘贴，零学习成本

**与其他文件管理器的对比：**

| 特性           | ranger        | lf           | Yazi          |
| -------------- | ------------- | ------------ | ------------- |
| 语言           | Python        | Go           | Rust          |
| 速度           | 慢（同步 IO） | 快           | 快（异步 IO） |
| 图片预览       | 需要外部脚本  | 需要外部脚本 | 内置支持      |
| 插件系统       | Python 脚本   | 无           | Lua 插件      |
| 多标签页       | 支持          | 不支持       | 支持（原生）  |
| 配置复杂度     | 高            | 低           | 低            |

![Yazi vs ranger vs lf 全方位对比](/images/yazi-vs-ranger.svg)

## 安装

**Linux**

```bash
# 方法 1：下载预编译二进制
wget https://github.com/sxyazi/yazi/releases/latest/download/yazi-x86_64-unknown-linux-gnu.zip
unzip yazi-x86_64-unknown-linux-gnu.zip
mv yazi-x86_64-unknown-linux-gnu/yazi ~/.local/bin/

# 方法 2：Cargo（需要 Rust 工具链）
cargo install --locked yazi-fm yazi-cli
```

**macOS**

```bash
brew install yazi
```

**Windows**

```powershell
winget install sxyazi.yazi
# 或
scoop install yazi
```

## 基本操作

Yazi 采用 vim 风格快捷键。

### 导航

| 操作        | 快捷键                           |
| ----------- | -------------------------------- |
| 上下移动    | `j` / `k` 或 `↑` / `↓` |
| 进入目录    | `l` / `→` / `Enter`       |
| 返回上级    | `h` / `←`                   |
| 跳到顶部    | `g`                            |
| 跳到底部    | `G`                            |
| 跳到第 N 行 | `N` + `G`（如 `50G`）      |

### 文件操作

| 操作           | 快捷键                       |
| -------------- | ---------------------------- |
| 复制           | `y` → 导航到目标 → `p` |
| 移动           | `x` → 导航到目标 → `p` |
| 新建文件       | `a` → 输入文件名          |
| 新建目录       | `a` → 输入 `dirname/`   |
| 重命名         | `r`                        |
| 删除（回收站） | `d`                        |
| 永久删除       | `D`                        |
| 多选           | `Space`                    |
| 全选           | `Ctrl+A`                   |

### 标签页

| 操作          | 快捷键                   |
| ------------- | ------------------------ |
| 新建标签页    | `t`                    |
| 关闭标签页    | `Ctrl+C` 或 `q`      |
| 切换标签页    | `1` / `2` / `3` … |
| 上一个/下一个 | `[` / `]`            |

### 搜索与过滤

| 操作           | 快捷键                           |
| -------------- | -------------------------------- |
| 文件搜索       | `/` → 输入关键词 → `Enter` |
| 跳转下一个匹配 | `n`                            |
| 跳转上一个匹配 | `N`                            |
| 切换隐藏文件   | `.`（句号）                    |

![Yazi 快捷键速查](/images/yazi-shortcuts.svg)

## Nerd Font 图标问题

Yazi 使用 Nerd Font 图标标识文件类型。如果看到菱形问号而不是文件夹/文件图标，说明终端字体不支持 Nerd Font。

![Nerd Font 图标安装前后对比](/images/yazi-nerdfont.svg)

**解决方法：**

```bash
# 1. 下载并安装 Nerd Font（推荐 JetBrainsMono）
mkdir -p ~/.local/share/fonts
cd ~/.local/share/fonts
wget https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip
unzip JetBrainsMono.zip -d JetBrainsMono
rm JetBrainsMono.zip
fc-cache -fv

# 2. 在终端设置中将字体改为 "JetBrainsMono Nerd Font Mono"
# VS Code: Ctrl+, → terminal.integrated.fontFamily
# Alacritty: font.normal.family = "JetBrainsMono Nerd Font Mono"
# Kitty: font_family JetBrainsMono Nerd Font Mono

# 3. 远程 SSH/VS Code Remote：
#    字体渲染发生在本地客户端，需要在本地机器上安装 Nerd Font
```

## 远程终端兼容性

在 VS Code/Windsurf 集成终端中，Yazi 可能报错 `Terminal response timeout`。快速修复：

```toml
# ~/.config/yazi/yazi.toml
[plugin]
preload_images = false
```

或临时解决：`TERM=xterm-256color yazi`

## 常见问题

- **Terminal response timeout？** VS Code 终端不支持图片协议查询。在 `yazi.toml` 中设置 `preload_images = false`。
- **图标全是菱形问号？** 没装 Nerd Font。用 `fc-list | grep Nerd` 检查。
- **无法预览图片？** 终端需支持图片协议（Kitty、WezTerm、iTerm2）。Windows Terminal 和 VS Code 集成终端不支持。
