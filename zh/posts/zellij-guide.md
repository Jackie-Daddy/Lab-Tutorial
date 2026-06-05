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
---
## 什么是 Zellij？

Zellij 是一个用 Rust 编写的终端多路复用器（Terminal Multiplexer）。如果你用过 tmux，可以把它看作"开箱即用的现代化 tmux"。如果你没用过 tmux——简单说，Zellij 让你在一个终端窗口里同时运行多个终端会话，还能让它们在后台保持运行。

**与 tmux 的对比：**

![Zellij vs tmux](/images/zellij-vs-tmux.svg)

| 特性     | tmux                 | Zellij                     |
| -------- | -------------------- | -------------------------- |
| 默认配置 | 需要大量配置才能好用 | 开箱即用，底部有快捷键提示 |
| 浮动窗格 | 不支持               | 原生支持浮动/嵌入窗格      |
| 布局系统 | 手动管理             | 支持布局模板（KDL 格式）   |
| 插件系统 | 第三方脚本           | 原生 WASM 插件             |
| 协作编辑 | 不内置               | 原生多用户会话共享         |
| 状态栏   | 需要配置             | 默认美观，支持自定义       |
| 配置语言 | tmux.conf            | KDL（可读性更好）          |

## 安装

**Linux**

```bash
# 方法 1：直接下载预编译二进制（推荐，无需 root 权限）
wget https://github.com/zellij-org/zellij/releases/latest/download/zellij-x86_64-unknown-linux-musl.tar.gz
tar -xzf zellij-x86_64-unknown-linux-musl.tar.gz
mv zellij ~/.local/bin/
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

# 方法 2：使用包管理器（需要 sudo）
sudo apt install zellij          # Ubuntu/Debian
sudo dnf install zellij          # Fedora
```

**macOS**

```bash
brew install zellij
```

**Windows (WSL)**：在 WSL 内部使用 Linux 的安装方法即可。

## 核心概念

Zellij 的分层结构：

![Zellij 分层架构](/images/zellij-hierarchy.svg)

Zellij 采用**模态操作**，类似 vim。默认的前缀键是 `Ctrl+O`，按下后进入快捷键模式，底部状态栏会显示可选操作。

**会话生命周期**：理解下面这四步，你就理解了 Zellij 的核心价值：

![Zellij 会话生命周期](/images/zellij-lifecycle.svg)

## 基本操作

### 会话管理

| 操作                 | 命令 / 快捷键                     |
| -------------------- | --------------------------------- |
| 新建会话             | `zellij`                        |
| 以指定名称新建       | `zellij -s project-name`        |
| 脱离会话（后台运行） | `Ctrl+O` → `D`               |
| 重新连接             | `zellij attach` 或 `zellij a` |
| 列出所有会话         | `zellij list-sessions`          |
| 删除会话             | `zellij delete-session <name>`  |
| 彻底退出             | `Ctrl+O` → 输入 `quit` 回车  |

### 窗格（Pane）操作

先按 `Ctrl+O` 进入快捷键模式，然后：

| 操作     | 按键                  |
| -------- | --------------------- |
| 向右分屏 | `R`                 |
| 向下分屏 | `D`                 |
| 移动焦点 | 方向键 或 `h/j/k/l` |
| 关闭窗格 | `X`                 |
| 全屏切换 | `F`                 |
| 浮动窗格 | `W`                 |
| 重命名   | `C`                 |

分屏过程一目了然 —— 从单窗格到三窗格，只需几次按键：

![Zellij 窗格操作速成](/images/zellij-panes.svg)

### 标签页（Tab）操作

| 操作          | 按键                        |
| ------------- | --------------------------- |
| 新建标签页    | `Ctrl+O` → `N`         |
| 切换到第 N 个 | `Ctrl+O` → `1` ~ `9` |
| 前后切换      | `Ctrl+O` → `H` / `L` |
| 关闭          | `Ctrl+O` → `X`         |
| 重命名        | `Ctrl+O` → `R`         |

### 其他实用功能

| 操作         | 快捷键                                         |
| ------------ | ---------------------------------------------- |
| 滚动回看输出 | `Ctrl+O` → `S`（scroll 模式），方向键滚动 |
| 搜索历史输出 | 滚动模式下按 `/`                             |
| 调整窗格大小 | `Ctrl+O` → `R`（resize 模式）             |
| 锁定界面     | `Ctrl+G`（防误触）                           |

## 进阶配置

Zellij 的配置文件是 `~/.config/zellij/config.kdl`，使用 KDL 格式。下面是一个推荐的 vim 式导航配置：

```kdl
keybinds clear-defaults=true {
    locked {
        bind "Ctrl g" { SwitchToMode "normal"; }
    }
    pane {
        bind "h" { MoveFocus "left"; }
        bind "j" { MoveFocus "down"; }
        bind "k" { MoveFocus "up"; }
        bind "l" { MoveFocus "right"; }
        bind "d" { NewPane "down"; SwitchToMode "normal"; }
        bind "r" { NewPane "right"; SwitchToMode "normal"; }
        bind "x" { ClosePane; SwitchToMode "normal"; }
        bind "f" { ToggleFocusFullscreen; SwitchToMode "normal"; }
    }
    tab {
        bind "n" { NewTab; SwitchToMode "normal"; }
        bind "x" { CloseTab; SwitchToMode "normal"; }
        bind "1" { GoToTab 1; SwitchToMode "normal"; }
        bind "2" { GoToTab 2; SwitchToMode "normal"; }
    }
}
```

**布局模板**：在 `~/.config/zellij/layouts/` 下放置 `.kdl` 文件定义预设窗格布局：

```kdl
// ~/.config/zellij/layouts/dev.kdl
layout {
    tab name="editor" {
        pane size=1 borderless=true {
            plugin location="zellij:status-bar"
        }
        pane { command "yazi" }
        pane split_direction="vertical" { pane }
    }
}
```

然后 `zellij --layout dev` 即可启动预设布局。

![Zellij 开发布局](/images/zellij-layout.svg)

## 远程开发

Zellij 在 SSH 远程开发时最大的优势是**会话持久化**——SSH 断开后 Zellij 会话仍在服务器运行，下次 `zellij attach` 即可恢复所有窗格状态。

```bash
# SSH 连接后自动 attach 或创建新会话
ssh myserver -t "zellij attach --create"
```

## 常见问题

- **状态栏图标乱码？** 安装 Nerd Font，或临时使用简化 UI：`zellij options --simplified-ui true`
- **SSH 断开后会话丢失？** 正常不会。Zellij daemon 在后台维持所有会话。重新 SSH 后 `zellij attach` 即可。
- **鼠标不好用？** 按住 `Shift` 临时禁用鼠标捕获，或永久禁用：`zellij options --disable-mouse-mode`
- **`Ctrl+O` 冲突？** 在 `config.kdl` 中改前缀键，或按 `Ctrl+G` 锁定界面暂时禁用快捷键。

<div class="post-tags-section">
  <span class="label">标签:</span>
  <span class="tag-pill" v-for="tag in $frontmatter.tags" :key="tag">{{ tag }}</span>
</div>
