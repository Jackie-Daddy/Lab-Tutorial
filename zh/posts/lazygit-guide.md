---
title: Lazygit — 告别手打 Git 命令，用终端 GUI 管理仓库
date: 2026-06-04
tags:
  - lazygit
  - git
  - terminal
  - go
  - tutorial
description: 一个 Go 写的 Git 终端 GUI，把所有 Git 操作集中在一个交互式界面中。暂存、提交、分支、rebase、冲突解决，全键盘 1-2 键完成。
---
## 什么是 Lazygit？

Lazygit 是一个用 Go 编写的 Git 终端 GUI。它把 `git status`、`git diff`、`git log`、`git branch`、`git stash` 等所有 Git 操作集中在一个交互式界面中，用键盘快捷键完成。

一旦习惯 Lazygit，你真的很难再回去手打 Git 命令——特别是处理 merge conflict、interactive rebase、cherry-pick 等复杂操作时。

**核心设计理念：** 所有信息都在面板中可视化展示，所有操作都是 1-2 个按键。

## 安装

**Linux**

```bash
# 方法 1：下载预编译二进制（推荐）
LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | grep -Po '"tag_name": "v\K[^"]*')
wget https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz
tar -xzf lazygit_*.tar.gz lazygit
mv lazygit ~/.local/bin/

# 方法 2：Ubuntu/Debian
sudo apt install lazygit

# 方法 3：Fedora
sudo dnf install lazygit
```

**macOS**

```bash
brew install lazygit
```

**Windows**

```powershell
winget install lazygit
# 或
scoop install lazygit
```

## 界面布局

Lazygit 启动后显示 5 个面板（可用数字键 `1`-`5` 切换焦点）：

![Lazygit 5 面板布局](/images/lazygit-panels.svg)

## 日常操作速查

### 全局快捷键

| 操作     | 快捷键                       |
| -------- | ---------------------------- |
| 切换面板 | `Tab` / `Shift+Tab`      |
| 滚动     | `j`/`k` 或 `↑`/`↓` |
| 退出     | `q`                        |
| 撤销     | `z`                        |
| 重做     | `Ctrl+Z`                   |
| 刷新     | `R`                        |

### 面板 1 — 文件状态（最常用）

| 操作             | 快捷键                               |
| ---------------- | ------------------------------------ |
| 暂存文件         | `Space`                            |
| 暂存全部文件     | `a`                                |
| 取消暂存         | `d`（在 staged 区域按）            |
| 查看文件 diff    | `Enter`                            |
| 提交已暂存的修改 | `c` → 输入 message → `Enter`   |
| 修改上一次提交   | `Shift+A`                          |
| 放弃文件修改     | `d`（在 unstaged 区域，⚠ 危险）  |
| 部分暂存         | `Enter` 进 diff → `Space` 选块  |
| 推送             | `P`（大写）                        |

### 面板 2 — 分支

| 操作           | 快捷键        |
| -------------- | ------------- |
| 切换分支       | `Space`     |
| 新建分支       | `n`         |
| 删除分支       | `d`         |
| 合并到当前分支 | `M`（大写） |
| 变基           | `r`         |

### 面板 3 — 提交日志

| 操作         | 快捷键                                   |
| ------------ | ---------------------------------------- |
| 查看提交详情 | `Enter`                                |
| 交互式变基   | `i`（从选中提交开始向下 rebase）       |
| Cherry-pick  | `c` 复制 → 切到目标分支 → `v` 粘贴 |
| 重置到某提交 | `g` → 选 soft/mixed/hard              |
| 创建标签     | `T`                                    |

### 面板 4 — 储藏 (Stash)

| 操作                   | 快捷键 |
| ---------------------- | ------ |
| 储藏当前修改           | `s`  |
| 应用储藏               | `g`  |
| 弹出储藏（应用后删除） | `P`  |
| 删除储藏               | `d`  |

## 实战工作流

**日常提交**

```
lazygit                          # 1. 打开 Lazygit
  → 在 Files 面板看到修改列表
  → Space 选中要提交的文件          # 2. 暂存
  → c → 输入 commit message → Enter # 3. 提交
  → P                              # 4. 推送到远程
```

![日常提交流程 — 4 步完成 commit & push](/images/lazygit-workflow.svg)

**整理提交历史（Interactive Rebase）**

```
lazygit
  → 3 切换到 Commits 面板
  → 光标移到要合并的最早提交
  → i 进入交互式变基
  → 对后续提交按 s (squash) 或 f (fixup)
  → 确认 → 强推（如有需要）
```

![交互式变基 — 整理提交历史](/images/lazygit-rebase.svg)

**处理合并冲突**

```
lazygit
  → 合并后自动显示冲突文件
  → Enter 进入冲突文件
  → Space 选择要保留的版本（ours/theirs/both）
  → 解决后按 a 暂存
  → c 完成合并提交
```

![合并冲突解决 — 3 步搞定](/images/lazygit-conflict.svg)

## 推荐配置

```yaml
# ~/.config/lazygit/config.yml
gui:
  theme:
    activeBorderColor:
      - '#89b4fa'
      - bold
    inactiveBorderColor:
      - '#a6adc8'
  nerdFontsVersion: "3"
git:
  paging:
    colorArg: always
    pager: delta --dark --paging=never
```

> 安装 [delta](https://github.com/dandavison/delta) 可以让 diff 输出变得非常好看，强烈推荐。

## 常见问题

- **中文文件名乱码？** 确认终端编码为 UTF-8：`echo $LANG` 应显示 `*.UTF-8`。
- **lazygit 之后 git 命令变慢？** Lazygit 本身不影响 git。大仓库可启用 `git feature.manyFiles`。

<div class="post-tags-section">
  <span class="label">标签:</span>
  <span class="tag-pill" v-for="tag in $frontmatter.tags" :key="tag">{{ tag }}</span>
</div>
