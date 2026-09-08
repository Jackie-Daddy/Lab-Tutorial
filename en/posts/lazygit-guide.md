---
title: Lazygit — Stop Typing Git Commands, Manage Repos with a Terminal GUI
date: 2026-06-04
tags:
  - lazygit
  - git
  - terminal
  - go
  - tutorial
description: Inspect diffs, stage changes, manage branches, and resolve conflicts with current Lazygit default bindings.
reviewed: 2026-09-07
scope: Lazygit 0.65.0 default configuration; Linux, macOS, and Windows
---

## What is Lazygit?

Lazygit is a Git terminal interface written in Go. It combines file diffs, branches, commits, and stashes in one window. Its actions run real Git commands, so check the selected objects and confirmation prompts before staging, committing, merging, or rewriting history.

This tutorial uses **0.65.0 default bindings**. Press `?` for actions in the current panel. Versions, custom configuration, and context can change a key's meaning. [Official README](https://github.com/jesseduffield/lazygit/blob/v0.65.0/README.md)

## Installation

**Linux: this binary example is for x86_64.** Install Git, curl, and tar first. Choose the appropriate asset on the [release page](https://github.com/jesseduffield/lazygit/releases/tag/v0.65.0) for other architectures.

```bash
mkdir -p "$HOME/.local/bin"
lazygit_tmp=$(mktemp -d)
curl -fL https://github.com/jesseduffield/lazygit/releases/download/v0.65.0/lazygit_0.65.0_Linux_x86_64.tar.gz -o "$lazygit_tmp/lazygit.tar.gz"
tar -xzf "$lazygit_tmp/lazygit.tar.gz" -C "$lazygit_tmp" lazygit
install -m 755 "$lazygit_tmp/lazygit" "$HOME/.local/bin/lazygit"
export PATH="$HOME/.local/bin:$PATH"
lazygit --version
```

Merge the PATH setting into your shell startup file to keep it across terminals. Debian 13 / Ubuntu 25.10 and newer provide `sudo apt install lazygit`; do not assume older default repositories include it. [Distribution support](https://github.com/jesseduffield/lazygit/blob/v0.65.0/README.md#debian-and-ubuntu)

**macOS (Homebrew):**

```bash
brew install lazygit
```

**Windows (PowerShell):**

```powershell
winget install -e --id JesseDuffield.lazygit
```

Run `lazygit` inside an existing Git repository, or specify its path with `lazygit -p /path/to/repo`.

## Interface Layout

The default left-panel shortcuts are **1 status, 2 files, 3 branches, 4 commits, and 5 stash**. The main view on the right displays the selected object's diff or details; `0` focuses that view.

<TutorialDiagram name="lazygit-panels" />

## Daily Shortcuts

### Global Actions

| Action | Key |
| --- | --- |
| Change panel | `1`–`5`, `Tab` / `Shift+Tab` |
| Move up/down | `j` / `k` or arrows |
| Show the current action menu | `?` |
| Return / quit | `Esc` / `q` |
| Undo / redo supported Git operations | `z` / `Z` |
| Refresh | `R` |
| Pull / push | `p` / `P` |

`Ctrl+Z` suspends the application; it does not redo an operation. Undo is not a backup of uncommitted files. [Default bindings](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/Config.md#default)

### Files Panel (2)

| Action | Key |
| --- | --- |
| Stage / unstage the selected file | `Space` |
| Stage / unstage all files | `a` |
| Enter a diff for partial staging | `Enter`, then follow the line/hunk controls |
| Commit staged changes | `c`, write a message, then use the displayed submit key |
| Amend the last commit | `A` |
| Stash changes | `s`, or `S` for stash options |
| Discard changes in the selected file | `d`, then inspect the confirmation |

The commit editor accepts `Ctrl+S`; Linux/Windows also use `Ctrl+Enter`, while macOS uses `Cmd+Enter`. **`d` does not unstage files**; use `Space` for that. [Default configuration](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/Config.md)

### Branches (3), Commits (4), and Stashes (5)

| Panel | Action | Key |
| --- | --- | --- |
| Branches | Checkout / create a branch | `Space` / `n` |
| Branches | Merge selected branch into current branch | `M` |
| Branches | Rebase current branch onto selected branch | `r` |
| Commits | Start interactive rebase | `i` |
| Commits | Copy / paste commits for cherry-pick | `C` / `V` (uppercase) |
| Commits | Open reset options | `g` |
| Commits | Create a tag | `T` |
| Stash | Apply and keep the entry | `Space` |
| Stash | Apply and remove on success | `g` |
| Stash | Delete an entry | `d` |

Check focus and the footer before acting: the same key can mean different things in different panels. [Bindings and configuration](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/Config.md)

## Practical Workflows

### Make a Commit

1. Inspect the diff in Files and stage intended files with `Space`.
2. Press `c`, write the message, and submit using the editor's displayed key.
3. Inspect the new commit, then press `P` to push to the intended remote branch.

<TutorialDiagram name="lazygit-workflow" />

### Organize Commit History

Press `i` in Commits to rebase the current branch's history from HEAD down to the first merge commit or main-branch commit. It does not start from the selected commit; use `e` to start there and stop for editing. Apply actions to commits marked TODO: `s` for squash and `f` for fixup. Open the rebase menu with `m` and select continue when ready. Lazygit can also perform one-off actions, such as squashing a selected commit, without explicitly entering an interactive rebase first. [Bindings and scope](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/keybindings/Keybindings_en.md#commits)

Practice on your own unpublished branch. Coordinate changes to shared history with collaborators; force-pushing is not a routine final step. [Official rebase walkthrough](https://github.com/jesseduffield/lazygit/blob/v0.65.0/README.md#interactive-rebase)

<TutorialDiagram name="lazygit-rebase" />

### Resolve Conflicts

Select a conflicted file in Files and press `Enter` to open the main view. Follow the displayed controls to choose a conflict and a side; `Space` picks the current side and `b` keeps both. Use `e` to handle complex conflicts in an editor.

Inspect each resolved file and stage it with `Space` in Files. For a rebase or cherry-pick, use the `m` menu to continue that operation. For a regular merge, follow the merge completion prompt. Check the resulting diff and run project validation. During a rebase, inspect the actual code rather than relying on assumptions about ours/theirs labels.

<TutorialDiagram name="lazygit-conflict" />

## Configuration

Find the active config directory with `lazygit --print-config-dir`, then edit its `config.yml`. Merge these settings into existing tables rather than duplicating them.

```yaml
gui:
  theme:
    activeBorderColor:
      - '#d97757'
      - bold
    inactiveBorderColor:
      - '#a6adc8'
```

If [delta](https://github.com/dandavison/delta) is installed, configure a 0.65.0 diff renderer with:

```yaml
git:
  diffRenderers:
    - name: delta
      type: stdinFilter
      colorArg: always
      command: delta --paging=never
```

The `delta` executable must be on PATH. Older `git.paging` / `pagers` examples do not directly apply to this version. [Diff renderer configuration](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/Custom_DiffRenderers.md)

## FAQ

- **Different bindings?** Check `lazygit --version`, your configuration, and the current panel's `?` menu.
- **Incorrect Chinese filename display?** Check the local terminal font, UTF-8 environment, and Git's filename display configuration.
- **Can I undo a mistake?** Inspect `z` and the repository state first. Undo does not cover every file operation; commit important work to a temporary branch or back it up separately. [Undo limitations](https://github.com/jesseduffield/lazygit/blob/v0.65.0/docs/Undoing.md)

<PostTags />
