---
title: 如何愉快的使用 tmux 在服务器后台跑任务
date: 2025-09-25
tags:
  - tmux
  - terminal
  - server
  - tutorial
description: tmux 把会话和终端窗口解耦——关掉窗口 ≠ 结束任务。从安装到配置文件，30 秒上手。
reviewed: 2026-09-07
scope: Linux/macOS；tmux 3.x
---
## 前言

我们有时想在后台跑任务，但直接在 SSH 终端中启动的前台任务可能随终端关闭或连接中断而退出。tmux 让任务运行在一个**独立于你终端的会话**里：你随时可以「断开」走人，之后再「重新连上」，任务这期间一直在服务器上跑。

一句话理解 tmux：**它把「会话」和「你的终端窗口」解耦了。** 关掉窗口 ≠ 结束任务。

这里说的是在**服务器上**启动 tmux：服务器及 tmux 服务必须持续运行。服务器重启、休眠或进程被管理员/调度系统终止时，tmux 不能让任务继续，也不会自动恢复训练。[官方入门](https://github.com/tmux/tmux/wiki/Getting-Started)

## 安装

先输入 `tmux -V` 检查是否已安装。没有的话：

```bash
# Ubuntu / Debian
sudo apt install tmux
# Fedora / 较新的 RHEL 系发行版
sudo dnf install tmux
# macOS
brew install tmux
```

## 一个核心概念：前缀键（prefix）

本文的会话快捷键要先按**前缀键**，默认是 `Ctrl+B`。`Ctrl+B, d` 表示：按住 `Ctrl+B` → 松开 → 再按小写 `d`，不要加 `Shift`。复制模式内的方向键、`q` 等不需要前缀。

## 核心工作流（30 秒上手）

```bash
# 1. 新建一个名为 train 的会话
tmux new -s train

# 2. 在里面正常跑命令（python、bash 都行）
python train.py

# 3. 按 Ctrl+B, d 断开会话（detach）
#    终端回到普通界面，但 train.py 仍在后台运行

# 4. 关掉 SSH、合上电脑都没问题。下次想看进度：
tmux attach -t train
```

<TutorialDiagram name="tmux-workflow" />

`detach`（断开）是 tmux 的灵魂：它不结束任务，只是把你和会话分开。任务跑完、确认不再需要后，在会话里直接 `exit`，或用 `tmux kill-session -t train` 杀掉。

## 常用命令速查

| 操作 | 命令 / 快捷键 |
| --- | --- |
| 新建会话 | `tmux new -s 名字` |
| 查看所有会话 | `tmux ls` |
| 重新连接会话 | `tmux attach -t 名字`（简写 `tmux a -t 名字`） |
| 断开当前会话（任务继续跑） | `Ctrl+B, d` |
| 杀死指定会话 | `tmux kill-session -t 名字` |
| 重命名会话 | `tmux rename-session -t 旧名 新名` |
| 进入滚动模式（看历史输出） | `Ctrl+B, [`，用方向键/`PgUp` 翻页 |
| 退出滚动模式 | `q` |

<TutorialDiagram name="tmux-cheatsheet" />

## 配置文件：让 tmux 更好用

默认 tmux 不能用鼠标滚轮翻历史，体验略差。编辑 `~/.tmux.conf`：

```bash
vim ~/.tmux.conf
```

写入以下内容：

```bash
set -g mouse on              # 启用鼠标：可滚轮翻页、可点选窗格
setw -g mode-keys vi         # 复制模式使用 vi 键位
set -g history-limit 10000   # 增大历史滚动行数
```

<TutorialDiagram name="tmux-config" />

已有 tmux 会话运行时，可重新加载配置：

```bash
tmux source-file ~/.tmux.conf
```

## 常见疑问

- **会话名忘了怎么办？** `tmux ls` 列出所有会话，找不到想要的名字时，会话很可能已经结束了。
- **`attach` 报错 `no sessions`？** 说明当前没有任何活动会话，任务可能已经跑完或被杀掉。
- **任务到底有没有在跑？** attach 进去看输出，或在会话外用 `nvidia-smi` / `ps -ef | grep python` 确认进程还在。
- **tmux vs nohup？** `nohup python -u a.py > train.log 2>&1 &` 可让任务忽略挂断信号，并把输出写入日志；用 `tail -f train.log` 能持续查看输出。它不提供可重新接入的交互终端，tmux 则可以。两者都不能跨服务器重启保持原进程。[nohup 手册](https://www.gnu.org/software/coreutils/manual/html_node/nohup-invocation.html)

<PostTags />
