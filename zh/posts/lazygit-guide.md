---
title: Lazygit — 告别手打 Git 命令，用终端 GUI 管理仓库
date: 2026-06-04
tags:
  - lazygit
  - git
  - terminal
  - go
  - tutorial
description: 用 Lazygit 查看差异、暂存提交、管理分支和解决冲突，按当前默认键位逐步上手。
reviewed: 2026-09-07
scope: Lazygit 0.65.0 默认配置；Linux、macOS 与 Windows
---

## 什么是 Lazygit？

Lazygit 是用 Go 编写的 Git 终端界面，将文件差异、分支、提交和储藏集中在同一个窗口。操作会执行真实的 Git 命令；暂存、提交、合并和重写历史前仍需检查选中的对象与确认提示。

本文使用 **0.65.0 默认配置**。按 `?` 查看当前面板的键位；不同版本、自定义配置和操作上下文可能改变按键含义。[官方 README](https://github.com/jesseduffield/lazygit/blob/v0.65.0/README.md)

## 安装

**Linux：以下二进制示例适用于 x86_64。** 先安装 Git、curl 和 tar；其他架构在[发布页](https://github.com/jesseduffield/lazygit/releases/tag/v0.65.0)选择对应资产。

```bash
mkdir -p "$HOME/.local/bin"
lazygit_tmp=$(mktemp -d)
curl -fL https://github.com/jesseduffield/lazygit/releases/download/v0.65.0/lazygit_0.65.0_Linux_x86_64.tar.gz -o "$lazygit_tmp/lazygit.tar.gz"
tar -xzf "$lazygit_tmp/lazygit.tar.gz" -C "$lazygit_tmp" lazygit
install -m 755 "$lazygit_tmp/lazygit" "$HOME/.local/bin/lazygit"
export PATH="$HOME/.local/bin:$PATH"
lazygit --version
```

将 PATH 设置合并到实际使用的 shell 配置后可长期生效。Debian 13 / Ubuntu 25.10 及更新版本可使用 `sudo apt install lazygit`；旧发行版不能假设默认仓库提供此包。[安装范围](https://github.com/jesseduffield/lazygit/blob/v0.65.0/README.md#debian-and-ubuntu)

**macOS（Homebrew）：**

```bash
brew install lazygit
```

**Windows（PowerShell）：**

```powershell
winget install -e --id JesseDuffield.lazygit
```

在已有 Git 仓库目录执行 `lazygit`，或用 `lazygit -p /path/to/repo` 指定仓库路径。

## 界面布局

默认左侧面板的数字键是：**1 状态、2 文件、3 分支、4 提交、5 储藏**。右侧主视图展示选中对象的差异或详情，按 `0` 可聚焦主视图。

<TutorialDiagram name="lazygit-panels" />

## 日常操作速查

### 全局快捷键

| 操作 | 快捷键 |
| --- | --- |
| 切换面板 | 数字 `1`–`5`、`Tab` / `Shift+Tab` |
| 上下移动 | `j` / `k` 或方向键 |
| 显示当前操作菜单 | `?` |
| 返回 / 退出 | `Esc` / `q` |
| 撤销 / 重做支持的 Git 操作 | `z` / `Z` |
| 刷新 | `R` |
| 拉取 / 推送 | `p` / `P` |

`Ctrl+Z` 是挂起程序，不是重做。撤销功能也不是未提交文件的备份。[默认键位](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/Config.md#default)

### 文件面板（2）

| 操作 | 快捷键 |
| --- | --- |
| 暂存 / 取消暂存所选文件 | `Space` |
| 暂存 / 取消暂存全部 | `a` |
| 进入差异以部分暂存 | `Enter`，再根据底部提示选择行或块 |
| 提交暂存修改 | `c`，填写说明后按编辑器显示的提交键 |
| 修订上一次提交 | `A` |
| 储藏修改 | `s`，或 `S` 查看储藏选项 |
| 放弃所选文件的修改 | `d`，检查确认提示 |

提交编辑器的确认键包含 `Ctrl+S`；Linux/Windows 也支持 `Ctrl+Enter`，macOS 对应 `Cmd+Enter`。**`d` 不是取消暂存键**，不要用它代替 `Space`。[默认配置](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/Config.md)

### 分支（3）、提交（4）与储藏（5）

| 面板 | 操作 | 快捷键 |
| --- | --- | --- |
| 分支 | 切换 / 新建分支 | `Space` / `n` |
| 分支 | 将所选分支合并到当前分支 | `M` |
| 分支 | 将当前分支变基到所选分支 | `r` |
| 提交 | 开始交互式变基 | `i` |
| 提交 | 复制 / 粘贴提交以 cherry-pick | `C` / `V`（大写） |
| 提交 | 查看 reset 选项 | `g` |
| 提交 | 创建标签 | `T` |
| 储藏 | 应用且保留条目 | `Space` |
| 储藏 | 应用成功后移除条目 | `g` |
| 储藏 | 删除条目 | `d` |

同一个键在不同面板有不同作用，操作前先确认焦点和底部提示。[键位与配置](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/Config.md)

## 实战工作流

### 日常提交

1. 在文件面板检查 diff，用 `Space` 暂存需要提交的文件。
2. 按 `c` 填写提交说明，用界面提示的确认键完成提交。
3. 到提交面板确认提交内容，再按 `P` 推送到正确的远程分支。

<TutorialDiagram name="lazygit-workflow" />

### 整理提交历史

在提交面板按 `i`，会对当前分支从 HEAD 到首个合并提交或主分支提交之间的历史启动交互式变基；它不是“从选中提交开始”。若要从所选提交开始并停下来编辑，使用 `e`。只对界面标记为 TODO 的提交操作：`s` 表示 squash，`f` 表示 fixup；完成后用 `m` 打开变基菜单并选择 continue。也可以对单个提交直接执行 squash 等操作，由 Lazygit 完成相应变基。[键位与范围说明](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/keybindings/Keybindings_en.md#commits)

优先在自己的未发布分支上练习。已经共享的历史需要先与协作者确认；不要把强制推送当作整理历史的固定最后一步。[官方变基说明](https://github.com/jesseduffield/lazygit/blob/v0.65.0/README.md#interactive-rebase)

<TutorialDiagram name="lazygit-rebase" />

### 处理合并冲突

在文件面板选中冲突文件并按 `Enter` 进入主视图。使用界面提示选择冲突块与需要保留的一侧，`Space` 选取当前侧，`b` 保留两侧；也可用 `e` 在编辑器中处理复杂冲突。

逐个检查处理后的文件，在文件面板用 `Space` 暂存。变基或 cherry-pick 中的冲突需要通过 `m` 菜单继续相应操作；普通 merge 则按界面提示完成合并。最后检查结果并运行项目验证。rebase 中的 ours/theirs 语义容易混淆，应看代码内容，而不是仅凭标签选择。

<TutorialDiagram name="lazygit-conflict" />

## 推荐配置

用 `lazygit --print-config-dir` 查看实际配置目录，然后编辑其中的 `config.yml`。以下设置只调整界面；已有同名配置时合并内容。

```yaml
gui:
  theme:
    activeBorderColor:
      - '#d97757'
      - bold
    inactiveBorderColor:
      - '#a6adc8'
```

若已安装 [delta](https://github.com/dandavison/delta)，0.65.0 可通过 `git.diffRenderers` 配置差异渲染器：

```yaml
git:
  diffRenderers:
    - name: delta
      type: stdinFilter
      colorArg: always
      command: delta --paging=never
```

该配置依赖 `delta` 命令已在 PATH 中。旧版本的 `git.paging` / `pagers` 示例不能直接套用到本文版本。[差异渲染配置](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/Custom_DiffRenderers.md)

## 常见问题

- **键位与教程不同？** 检查 `lazygit --version`、用户配置和当前面板的 `?` 菜单。
- **中文文件名显示异常？** 检查本地终端字体和 UTF-8 环境，以及 Git 的文件名显示设置。
- **误操作后能否撤销？** 先查看 `z` 的提示和仓库状态。撤销并不覆盖所有文件操作；重要未提交修改应先提交到临时分支或另行备份。[撤销限制](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/Undoing.md)

<PostTags />
