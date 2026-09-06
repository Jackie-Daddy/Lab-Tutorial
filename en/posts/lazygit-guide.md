---
title: Lazygit — Stop Typing Git Commands, Manage Repos with a Terminal GUI
date: 2026-06-04
tags:
  - lazygit
  - git
  - terminal
  - go
  - tutorial
description: A Go-powered Git terminal GUI that consolidates all Git operations into one interactive interface. Stage, commit, branch, rebase, resolve conflicts — all in 1-2 keystrokes.
---
## What is Lazygit?

Lazygit is a Git terminal GUI written in Go. It consolidates `git status`, `git diff`, `git log`, `git branch`, `git stash`, and every other Git operation into a single interactive interface operated entirely by keyboard shortcuts.

Once you get used to Lazygit, it's genuinely hard to go back to typing Git commands — especially for complex operations like merge conflicts, interactive rebase, and cherry-pick.

**Core design philosophy:** All information is visually displayed in panels. Every action is 1-2 keystrokes.

## Installation

**Linux**

```bash
# Option 1: Download prebuilt binary (recommended)
LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | grep -Po '"tag_name": "v\K[^"]*')
wget https://github.com/jesseduffield/lazygit/releases/latest/download/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz
tar -xzf lazygit_*.tar.gz lazygit
mv lazygit ~/.local/bin/

# Option 2: Ubuntu/Debian
sudo apt install lazygit

# Option 3: Fedora
sudo dnf install lazygit
```

**macOS**

```bash
brew install lazygit
```

**Windows**

```powershell
winget install lazygit
# or
scoop install lazygit
```

## Interface Layout

Lazygit shows 5 panels on launch (use number keys `1`-`5` to switch focus):

<TutorialDiagram name="lazygit-panels" />

## Quick Reference

### Global

| Action       | Key                          |
| ------------ | ---------------------------- |
| Switch panel | `Tab` / `Shift+Tab`      |
| Scroll       | `j`/`k` or `↑`/`↓` |
| Quit         | `q`                        |
| Undo         | `z`                        |
| Redo         | `Ctrl+Z`                   |
| Refresh      | `R`                        |

### Panel 1 — Files (most used)

| Action              | Key                                  |
| ------------------- | ------------------------------------ |
| Stage file          | `Space`                            |
| Stage all           | `a`                                |
| Unstage             | `d` (press in staged area)         |
| View file diff      | `Enter`                            |
| Commit staged       | `c` → type message → `Enter`   |
| Amend last commit   | `Shift+A`                          |
| Discard changes     | `d` (in unstaged area, ⚠ dangerous) |
| Stage partial (hunk)| `Enter` into diff → `Space`    |
| Push                | `P` (uppercase)                    |

### Panel 2 — Branches

| Action             | Key           |
| ------------------ | ------------- |
| Switch branch      | `Space`     |
| New branch         | `n`         |
| Delete branch      | `d`         |
| Merge into current | `M` (uppercase) |
| Rebase             | `r`         |

### Panel 3 — Commits

| Action              | Key                                      |
| ------------------- | ---------------------------------------- |
| View commit details | `Enter`                                |
| Interactive rebase  | `i` (rebase downward from selected)    |
| Cherry-pick         | `c` copy → switch branch → `v` paste |
| Reset to commit     | `g` → choose soft/mixed/hard           |
| Create tag          | `T`                                    |

### Panel 4 — Stash

| Action     | Key |
| ---------- | --- |
| Stash      | `s` |
| Apply stash| `g` |
| Pop stash  | `P` |
| Drop stash | `d` |

## Real-World Workflows

**Daily commit flow**

```
lazygit                          # 1. Open Lazygit
  → See changed files in Files panel
  → Space to stage files           # 2. Stage
  → c → type message → Enter       # 3. Commit
  → P                              # 4. Push
```

<TutorialDiagram name="lazygit-workflow" />

**Cleaning up commit history (Interactive Rebase)**

```
lazygit
  → 3 to switch to Commits panel
  → Move cursor to earliest commit to squash
  → i to start interactive rebase
  → Press s (squash) or f (fixup) on subsequent commits
  → Confirm → force push if needed
```

<TutorialDiagram name="lazygit-rebase" />

**Resolving merge conflicts**

```
lazygit
  → Conflict files shown automatically after merge
  → Enter to open conflicted file
  → Space to choose which version to keep (ours/theirs/both)
  → Press a to stage after resolving
  → c to complete the merge commit
```

<TutorialDiagram name="lazygit-conflict" />

## Recommended Config

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

> Install [delta](https://github.com/dandavison/delta) for beautiful diffs — highly recommended.

## FAQ

- **Chinese filenames showing garbled text?** Ensure terminal encoding is UTF-8: `echo $LANG` should show `*.UTF-8`.
- **Git commands slow after using lazygit?** Lazygit doesn't affect git itself. For large repos, enable `git feature.manyFiles`.

<div class="post-tags-section">
  <span class="label">Tags:</span>
  <span class="tag-pill" v-for="tag in $frontmatter.tags" :key="tag">{{ tag }}</span>
</div>
