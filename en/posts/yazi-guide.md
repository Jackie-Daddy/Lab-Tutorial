---
title: Yazi — Getting Started with the Modern Terminal File Manager
date: 2026-06-04
tags:
  - yazi
  - terminal
  - file-manager
  - rust
  - ranger
  - tutorial
description: A terminal file manager faster than ranger. Async I/O, image previews, vim-style navigation, multi-tab support — double your file browsing efficiency.
---
## What is Yazi?

Yazi is a terminal file manager written in Rust, designed as a modern alternative to ranger and lf. Key highlights:

- **Async I/O**: Directory loading and file previews never block — much faster than ranger
- **Image previews**: Built-in support for Kitty/iTerm2/Sixel/Überzug++ protocols
- **Rich features**: Multi-tab, batch rename, fuzzy search, FIFO pipes, plugin system
- **Vim-style controls**: `h/j/k/l` navigation, `y`/`p` copy-paste, zero learning curve

**Compared to other file managers:**

| Feature        | ranger          | lf              | Yazi             |
| -------------- | --------------- | --------------- | ---------------- |
| Language       | Python          | Go              | Rust             |
| Speed          | Slow (sync I/O) | Fast            | Fast (async I/O)  |
| Image previews | External scripts | External scripts | Built-in         |
| Plugin system  | Python scripts  | None            | Lua plugins      |
| Multi-tab      | Supported       | Not supported   | Supported (native) |
| Config complexity | High         | Low             | Low              |

<TutorialDiagram name="yazi-vs-ranger" />

## Installation

**Linux**

```bash
# Option 1: Download prebuilt binary
wget https://github.com/sxyazi/yazi/releases/latest/download/yazi-x86_64-unknown-linux-gnu.zip
unzip yazi-x86_64-unknown-linux-gnu.zip
mv yazi-x86_64-unknown-linux-gnu/yazi ~/.local/bin/

# Option 2: Cargo (requires Rust toolchain)
cargo install --locked yazi-fm yazi-cli
```

**macOS**

```bash
brew install yazi
```

**Windows**

```powershell
winget install sxyazi.yazi
# or
scoop install yazi
```

## Basic Operations

Yazi uses vim-style keybindings throughout.

### Navigation

| Action          | Key                              |
| --------------- | -------------------------------- |
| Move up/down    | `j` / `k` or `↑` / `↓` |
| Enter directory | `l` / `→` / `Enter`       |
| Go back         | `h` / `←`                   |
| Jump to top     | `g`                            |
| Jump to bottom  | `G`                            |
| Jump to line N  | `N` + `G` (e.g. `50G`)     |

### File Operations

| Action              | Key                          |
| ------------------- | ---------------------------- |
| Copy                | `y` → navigate → `p`    |
| Move                | `x` → navigate → `p`    |
| New file            | `a` → type filename       |
| New directory       | `a` → type `dirname/`   |
| Rename              | `r`                        |
| Delete (trash)      | `d`                        |
| Permanent delete    | `D`                        |
| Multi-select        | `Space`                    |
| Select all          | `Ctrl+A`                   |

### Tabs

| Action      | Key                      |
| ----------- | ------------------------ |
| New tab     | `t`                    |
| Close tab   | `Ctrl+C` or `q`      |
| Switch tab  | `1` / `2` / `3` … |
| Prev / next | `[` / `]`            |

### Search & Filter

| Action            | Key                              |
| ----------------- | -------------------------------- |
| File search       | `/` → type keyword → `Enter` |
| Next match        | `n`                            |
| Previous match    | `N`                            |
| Toggle hidden     | `.` (period)                   |

<TutorialDiagram name="yazi-shortcuts" />

## Nerd Font Icons

Yazi uses Nerd Font icons to identify file types. If you see diamond question marks `�` instead of icons, your terminal font doesn't support Nerd Fonts.

<TutorialDiagram name="yazi-nerdfont" />

**Fix:**

```bash
# 1. Download and install a Nerd Font (JetBrainsMono recommended)
mkdir -p ~/.local/share/fonts
cd ~/.local/share/fonts
wget https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip
unzip JetBrainsMono.zip -d JetBrainsMono
rm JetBrainsMono.zip
fc-cache -fv

# 2. Set your terminal font to "JetBrainsMono Nerd Font Mono"
# VS Code: Ctrl+, → terminal.integrated.fontFamily
# Alacritty: font.normal.family = "JetBrainsMono Nerd Font Mono"
# Kitty: font_family JetBrainsMono Nerd Font Mono

# 3. For remote SSH/VS Code Remote:
#    Font rendering happens on your local client — install Nerd Fonts locally
```

## Remote Terminal Compatibility

In VS Code/Windsurf integrated terminals, Yazi may error with `Terminal response timeout`. Quick fix:

```toml
# ~/.config/yazi/yazi.toml
[plugin]
preload_images = false
```

Or temporarily: `TERM=xterm-256color yazi`

## FAQ

- **Terminal response timeout?** VS Code terminals don't support Yazi's image protocol queries. Set `preload_images = false` in `yazi.toml`.
- **Icons are all diamond question marks?** No Nerd Font installed. Check with `fc-list | grep Nerd`.
- **Can't preview images?** Your terminal needs image protocol support (Kitty, WezTerm, iTerm2). Windows Terminal and VS Code integrated terminal don't support this.

<div class="post-tags-section">
  <span class="label">Tags:</span>
  <span class="tag-pill" v-for="tag in $frontmatter.tags" :key="tag">{{ tag }}</span>
</div>
