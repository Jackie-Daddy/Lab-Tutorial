---
title: Zellij — The Modern Terminal Multiplexer Complete Guide
date: 2026-06-04
tags:
  - zellij
  - terminal
  - tmux
  - rust
  - server
  - tutorial
description: A terminal multiplexer that works out of the box — better than tmux. Split panes, tabs, floating windows, session persistence, all in one tool.
reviewed: 2026-09-07
scope: Zellij 0.45.1 default bindings; Linux, macOS, and WSL
---

## What is Zellij?

Zellij is a terminal multiplexer written in Rust. A session contains tabs and panes for editors, shells, and monitoring commands. Detaching a client can leave the session running on its host.

**Working with tmux and Zellij:**

<TutorialDiagram name="zellij-vs-tmux" />

| Feature | tmux | Zellij |
| --- | --- | --- |
| Controls | Prefix keys, commands, binding help | Multiple modes with bottom-bar hints |
| Floating UI | `display-popup` windows | Floating and embedded panes |
| Layouts | Built-in arrangements, commands, scripts | KDL layout files |
| Extensions | Commands, scripts, third-party plugins | WASM plugins |
| Session sharing | Multiple clients on one session | Multiple clients on one session |
| Configuration | `tmux.conf` | `config.kdl` |

Both work with their defaults and support status bars and shared sessions. Choose according to your habits and workflow. See the [tmux introduction](https://github.com/tmux/tmux/wiki/Getting-Started) and [Zellij documentation](https://zellij.dev/documentation/).

## Installation

**Linux / WSL: this binary example is for x86_64 only.** Check `uname -m`; choose the matching asset for ARM64 or another architecture on the [0.45.1 release page](https://github.com/zellij-org/zellij/releases/tag/v0.45.1). You need `curl` and `tar` installed.

```bash
mkdir -p "$HOME/.local/bin"
zellij_tmp=$(mktemp -d)
curl -fL https://github.com/zellij-org/zellij/releases/download/v0.45.1/zellij-x86_64-unknown-linux-musl.tar.gz -o "$zellij_tmp/zellij.tar.gz"
tar -xzf "$zellij_tmp/zellij.tar.gz" -C "$zellij_tmp"
install -m 755 "$zellij_tmp/zellij" "$HOME/.local/bin/zellij"
export PATH="$HOME/.local/bin:$PATH"
zellij --version
```

The `export` affects this shell only. Add it to the startup file for the Bash/Zsh shell you actually use to persist it. Inside WSL, install the Linux program.

**macOS, with Homebrew installed:**

```bash
brew install zellij
zellij --version
```

With a Rust toolchain, `cargo install --locked zellij` is another option. Package-manager versions may differ from this tutorial; availability in Ubuntu/Debian repositories depends on the distribution release. See the [official installation guide](https://zellij.dev/documentation/installation).

## Core Concepts

Zellij's hierarchy:

<TutorialDiagram name="zellij-hierarchy" />

Zellij uses **modes**. This guide starts in **Normal mode with the 0.45.1 default bindings**: `Ctrl+P` opens Pane mode, `Ctrl+T` opens Tab mode, and `Ctrl+O` opens Session mode. Each controls a different group of actions.

`Ctrl+P` → `r` means press and release the combination, then press lowercase `r`. Case matters. Follow the current status bar when using custom bindings or another preset. [0.45.1 default bindings](https://github.com/zellij-org/zellij/blob/v0.45.1/zellij-utils/assets/config/default.kdl)

**The session lifecycle:**

<TutorialDiagram name="zellij-lifecycle" />

## Basic Operations

### Session Management

| Action | Command / shortcut |
| --- | --- |
| New session | `zellij` |
| Named session | `zellij -s project-name` |
| Detach, keeping it running | `Ctrl+O` → `d` |
| Attach to a named session | `zellij attach project-name` |
| List sessions | `zellij list-sessions` |
| End this session and its panes | `Ctrl+Q` (outside Locked mode) |
| End a named running session | `zellij kill-session project-name` |
| Delete an exited session's saved record | `zellij delete-session project-name` |

Use **detach** when work should continue. `Ctrl+Q` and `kill-session` end the session; `delete-session` removes recovery data. With no name, `attach` behavior depends on how many sessions exist. [CLI commands](https://zellij.dev/documentation/commands), [resurrection and deletion](https://zellij.dev/documentation/session-resurrection)

### Pane Operations

Starting in Normal mode, press `Ctrl+P`, then:

| Action | Key |
| --- | --- |
| New pane right / down | `r` / `d` |
| Move focus | Arrows or `h/j/k/l` |
| Close focused pane | `x` |
| Toggle fullscreen | `f` |
| Show / hide floating panes | `w` |
| Toggle focused pane floating / embedded | `e` |
| Rename pane | `c` → name → `Enter` |

Actions such as splitting return to Normal mode, so press `Ctrl+P` again for another action. Focus movement stays in Pane mode; press `Enter` when finished.

<TutorialDiagram name="zellij-panes" />

### Tab Operations

| Action | Shortcut |
| --- | --- |
| New tab | `Ctrl+T` → `n` |
| Select tab 1–9 | `Ctrl+T` → `1`–`9` |
| Previous / next tab | `Ctrl+T` → `h` / `l` |
| Close tab and its panes | `Ctrl+T` → `x` |
| Rename tab | `Ctrl+T` → `r` → name → `Enter` |

### Scrollback, Search, and Resize

| Action | Shortcut |
| --- | --- |
| Scrollback | `Ctrl+S` → `j/k` or arrows |
| Search output | `Ctrl+S` → `s` → query → `Enter` |
| Next / previous result | `n` / `p` in Search mode |
| Resize | `Ctrl+N` → `+` / `-` or arrows |
| Pass keys through to the pane | `Ctrl+G` to enter Locked; `Ctrl+G` again to return |

These tables follow the [default mode configuration](https://github.com/zellij-org/zellij/blob/v0.45.1/zellij-utils/assets/config/default.kdl). Locked controls keyboard input; it is not an access-control screen lock.

## Advanced Configuration

Inspect the defaults from your installed version:

```bash
zellij setup --dump-config
```

A common config path is `~/.config/zellij/config.kdl`. First launch may already have created it, so inspect before editing. Environment variables, command-line options, and the native macOS config directory also affect lookup. See the [configuration guide](https://zellij.dev/documentation/configuration).

Vim-style navigation is already included. Keep the defaults when adding a small override, such as `Alt+r` to split right from Normal mode:

```kdl
keybinds {
  normal {
    bind "Alt r" { NewPane "Right"; }
  }
}
```

Avoid applying `keybinds clear-defaults=true` to an incomplete snippet: it also removes the default bindings for entering and leaving modes.

**Layout template:** create `~/.config/zellij/layouts/dev.kdl` for two side-by-side panes and a bottom status bar. Install `yazi` before starting, or remove `command="yazi"` to use a regular shell.

```kdl
layout {
  tab name="editor" {
    pane split_direction="vertical" {
      pane command="yazi"
      pane
    }
    pane size=1 borderless=true {
      plugin location="zellij:status-bar"
    }
  }
}
```

```bash
zellij --layout dev
```

`split_direction="vertical"` places child panes side by side; the default stacks them vertically. [Layout documentation](https://zellij.dev/documentation/layouts)

<TutorialDiagram name="zellij-layout" />

## Remote Development

Run Zellij **on the server**. After SSH disconnects, tasks can continue while the server and session processes remain alive. Reconnect to the same host and user account:

```bash
ssh -t myserver 'zellij attach --create project-name'
```

A server reboot, terminated job, or explicit session exit ends the original processes. Session resurrection can recreate the layout and offer to rerun commands; it cannot restore a training process's memory state. [Session resurrection](https://zellij.dev/documentation/session-resurrection)

## FAQ

- **Broken status-bar arrows?** Add `simplified_ui true` at the config root, or choose a suitable font in your local terminal.
- **Mouse selection conflicts?** Add `mouse_mode false` at the config root and start a new session for this option to take effect.
- **Editor shortcut conflicts?** Enter Locked mode with `Ctrl+G`, then press it again to return; alternatively change the relevant bindings.

See the [official options reference](https://zellij.dev/documentation/options). Checked against official documentation and the 0.45.1 configuration source on 2026-09-07; installation and interactive behavior were not tested across platforms.

<PostTags />
