---
title: 如何愉快的使用 tmux 在服务器后台跑任务
title_en: How to Happily Use tmux for Background Tasks on Servers
date: 2026-06-04
tags: [tmux, terminal, server, tutorial]
lang: zh
slug: how-to-use-tmux
description: tmux 把会话和终端窗口解耦——关掉窗口 ≠ 结束任务。从安装到配置文件，30 秒上手。
---

## 前言

我们有时想在后台跑任务，但普通终端一旦关闭（断网、关机、SSH 掉线），任务就跟着中断了。tmux 让任务运行在一个**独立于你终端的会话**里：你随时可以「断开」走人，之后再「重新连上」，任务这期间一直在服务器上跑。

一句话理解 tmux：**它把「会话」和「你的终端窗口」解耦了。** 关掉窗口 ≠ 结束任务。

## 安装

大多数服务器已经预装，输入 `tmux -V` 能看到版本就说明有了。没有的话：

```bash
# Ubuntu / Debian
sudo apt install tmux
# CentOS / RHEL
sudo yum install tmux
# macOS
brew install tmux
```

## 一个核心概念：前缀键（prefix）

tmux 的所有快捷键都要先按**前缀键**唤醒，默认是 `Ctrl+B`。本文写作 `Ctrl+B, D` 表示：按住 `Ctrl+B` → 松开 → 再按 `D`。

## 核心工作流（30 秒上手）

```bash
# 1. 新建一个名为 train 的会话
tmux new -s train

# 2. 在里面正常跑命令（python、bash 都行）
python train.py

# 3. 按 Ctrl+B, D 断开会话（detach）
#    终端回到普通界面，但 train.py 仍在后台运行

# 4. 关掉 SSH、合上电脑都没问题。下次想看进度：
tmux attach -t train
```

![](./images/tmux-workflow.svg)

`detach`（断开）是 tmux 的灵魂：它不结束任务，只是把你和会话分开。任务跑完、确认不再需要后，在会话里直接 `exit`，或用 `tmux kill-session -t train` 杀掉。

## 常用命令速查

| 操作 | 命令 / 快捷键 |
| --- | --- |
| 新建会话 | `tmux new -s 名字` |
| 查看所有会话 | `tmux ls` |
| 重新连接会话 | `tmux attach -t 名字`（简写 `tmux a -t 名字`） |
| 断开当前会话（任务继续跑） | `Ctrl+B, D` |
| 杀死指定会话 | `tmux kill-session -t 名字` |
| 重命名会话 | `tmux rename-session -t 旧名 新名` |
| 进入滚动模式（看历史输出） | `Ctrl+B, [`，用方向键/`PgUp` 翻页 |
| 退出滚动模式 | `q` |

![](./images/tmux-cheatsheet.svg)

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

![](./images/tmux-config.svg)

保存后让配置生效（无需重启 tmux）：

```bash
tmux source-file ~/.tmux.conf
```

## 常见疑问

- **会话名忘了怎么办？** `tmux ls` 列出所有会话，找不到想要的名字时，会话很可能已经结束了。
- **`attach` 报错 `no sessions`？** 说明当前没有任何活动会话，任务可能已经跑完或被杀掉。
- **任务到底有没有在跑？** attach 进去看输出，或在会话外用 `nvidia-smi` / `ps -ef | grep python` 确认进程还在。
- **tmux vs nohup？** `nohup python a.py &` 也能后台跑，但看不到实时输出、不能交互。tmux 给你一个完整可重连的终端，更适合需要盯进度或随时介入的任务。
