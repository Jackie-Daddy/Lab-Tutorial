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
description: 'Manage terminal files with Yazi: installation, navigation, file operations, tabs, search, image previews, and font troubleshooting.'
reviewed: 2026-09-07
scope: Yazi 26.9.1 default bindings; Linux, macOS, and Windows
---

## What is Yazi?

Yazi is a terminal file manager written in Rust, with asynchronous tasks, file previews, tabs, and Lua plugins. Vim users can navigate with `h/j/k/l`, while file operations and tab shortcuts need separate practice.

**Compared with other file managers:**

| Feature | ranger | lf | Yazi |
| --- | --- | --- | --- |
| Main language | Python | Go | Rust |
| Extensions | Python configuration and plugins | Shell commands | Lua plugins |
| Tabs | Supported | Managed by a terminal multiplexer | Supported |
| Preview setup | Preview scripts and display backends | Preview commands | Built-in previewers with external dependencies |

This is not a performance benchmark. Large directories, remote filesystems, and preview programs all affect responsiveness; lf also uses asynchronous I/O. Sources: [ranger](https://github.com/ranger/ranger), [lf](https://github.com/gokcehan/lf), [Yazi dependencies](https://yazi-rs.github.io/docs/installation/).

<TutorialDiagram name="yazi-vs-ranger" />

## Installation

**Linux: this example is for x86_64 GNU/Linux only.** Check `uname -m`; choose a matching archive for other architectures or musl systems from the [26.9.1 release page](https://github.com/sxyazi/yazi/releases/tag/v26.9.1). You need `curl`, `unzip`, and `file` for type detection.

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

`yazi` is the file manager; `ya` is its companion CLI. Add the `export PATH=...` line to the startup file for your actual Bash/Zsh shell to make both available in new terminals.

**Cargo alternative:** current official instructions install through `yazi-build`, replacing the old `cargo install --locked yazi-fm yazi-cli` command. Prepare the latest stable Rust toolchain and system build dependencies, then run:

```bash
cargo install --force yazi-build
```

**macOS, with Homebrew installed:**

```bash
brew install yazi
yazi --version
```

**Windows, PowerShell: choose WinGet or Scoop:**

```powershell
winget install -e --id sxyazi.yazi
# Or
scoop install yazi
```

Windows also needs `file.exe` from Git for Windows. Set the user environment variable `YAZI_FILE_ONE` to its actual location, such as `C:\Program Files\Git\usr\bin\file.exe`, then reopen the terminal. See the [official Windows prerequisites](https://yazi-rs.github.io/docs/installation/#windows).

Install optional tools as needed: `fd` for filename search, `ripgrep` for content search, `fzf` for fuzzy navigation, FFmpeg for video previews, and Poppler for PDF previews. See the [installation reference](https://yazi-rs.github.io/docs/installation/) for full dependencies and platform package names.

## Basic Operations

These are the **26.9.1 default bindings**. `g` → `g` means two successive lowercase presses. Older releases and custom configurations can differ; press `~` or `F1` for help. [26.9.1 default keymap](https://github.com/sxyazi/yazi/blob/v26.9.1/yazi-config/preset/keymap-default.toml)

### Navigation

| Action | Shortcut |
| --- | --- |
| Move down / up | `j` / `k` or `↓` / `↑` |
| Enter hovered directory | `l` / `→` |
| Parent directory | `h` / `←` |
| First item | `g` → `g` or `Home` |
| Last item | `G` or `End` |
| Half page up / down | `Ctrl+U` / `Ctrl+D` |
| Open with the configured application | `o` / `Enter` |

`Enter` invokes opening rules; use `l` to enter a directory. Keys `1`–`9` switch tabs, so Vim's `50G` line-number notation does not apply. [Opening versus entering](https://yazi-rs.github.io/docs/faq/#why-cant-open-and-enter-be-a-single-action)

### File Operations

| Action | Shortcut |
| --- | --- |
| Copy | `y` → destination directory → `p` |
| Move | `x` → destination directory → `p` |
| Create file / directory | `a` → name; end directory names with `/` |
| Rename | `r` |
| Trash | `d`, then review the confirmation |
| Permanent delete | `D`, then review the confirmation |
| Toggle selection | `Space` |
| Select all | `Ctrl+A` |
| Clear selection | `Esc` |

Select files before a batch operation; with no selection, actions generally target the hovered item. `D` bypasses trash. See the [official file operations guide](https://yazi-rs.github.io/docs/quick-start/#file-operations).

### Tabs and Quitting

| Action | Shortcut |
| --- | --- |
| New tab in the current directory | `t` → `t` |
| Close tab, or quit if it is the last | `Ctrl+C` |
| Select tab | `1`–`9` |
| Previous / next tab | `[` / `]` |
| Quit all of Yazi | `q` |

Running `yazi` directly cannot change the parent shell's directory on exit. To enable that workflow, configure the [official shell wrapper](https://yazi-rs.github.io/docs/quick-start/#shell-wrapper) and launch with `y`. Then `q` exits and changes directory, while `Q` exits and preserves the original shell directory.

### Finding, Filtering, and Recursive Search

| Action | Shortcut |
| --- | --- |
| Find a filename in the current list | `/` → query → `Enter` |
| Next / previous match | `n` / `N` |
| Filter the current list | `f` |
| Search filenames in the directory tree | `s` (requires `fd`) |
| Search file contents in the directory tree | `S` (requires `ripgrep`) |
| Cancel an ongoing search | `Ctrl+S` |
| Toggle hidden files | `.` |

Use `/` for the current list and `s` / `S` to search the directory tree. [Official search reference](https://yazi-rs.github.io/docs/quick-start/#search-files)

<TutorialDiagram name="yazi-shortcuts" />

## Nerd Font Icons

When icons appear as boxes or question marks, check the font on the **local client displaying the terminal**. SSH and VS Code Remote render text locally; installing a server font does not change the local display. [Official font guidance](https://yazi-rs.github.io/docs/faq/#why-are-the-icons-not-displayed-properly)

<TutorialDiagram name="yazi-nerdfont" />

Download a font such as JetBrainsMono from [Nerd Fonts](https://www.nerdfonts.com/font-downloads). On a Linux desktop, place the font files in `~/.local/share/fonts/`, then run:

```bash
fc-cache -fv
fc-list | rg -i 'nerd|jetbrains'
```

Use Font Book on macOS or the system font installer on Windows. Select `JetBrainsMono Nerd Font Mono` in your local terminal settings and reopen it. In VS Code, use `terminal.integrated.fontFamily`.

## Remote Terminal Compatibility

`Terminal response timeout` means a startup capability query did not receive a response in time. Terminal version, performance, SSH latency, or a multiplexer may be involved. Update the software and compare running directly in the terminal with running inside tmux/Zellij. The official FAQ allows ignoring the message if everything otherwise works. The nonexistent `[plugin] preload_images = false` setting is not a fix. [Official troubleshooting](https://yazi-rs.github.io/docs/faq/#how-to-troubleshoot-terminal-response-timeout-errors)

Image previews depend on terminal protocols and preview dependencies. The official table includes VS Code and Windows Terminal (at least v1.22.10352.0); blanket claims that they cannot preview images are outdated. Inspect the environment and selected image backend with:

```bash
yazi --version
ya env
```

Preserve the real `TERM`, `TERM_PROGRAM`, and related environment variables. Arbitrarily setting `TERM=xterm-256color` can disrupt automatic detection. Check the additional limitations for SSH, tmux, and Zellij. [Image compatibility and diagnostics](https://yazi-rs.github.io/docs/image-preview/)

## FAQ

- **Cannot open, edit, or preview files?** Check that `file` is available; on Windows, check `YAZI_FILE_ONE`. For text editing on Linux/macOS, also check `EDITOR` or the custom opener.
- **Missing `ya`?** Copy both `yazi` and `ya` during binary installation and include their directory in `PATH`.
- **Different shortcuts?** Check `yazi --version`, your custom `keymap.toml`, and the `~` help screen.

Checked against official 26.9.1 documentation and defaults on 2026-09-07. Cross-platform installation, image preview, and interactive behavior were not tested.

<PostTags />
