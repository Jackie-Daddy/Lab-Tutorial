---
title: Zellij — The Modern Terminal Multiplexer Complete Guide
title_en: Zellij — The Modern Terminal Multiplexer Complete Guide
date: 2026-06-04
tags: [zellij, terminal, tmux, rust, server, tutorial]
lang: en
slug: zellij-guide
description: A terminal multiplexer that works out of the box — better than tmux. Split panes, tabs, floating windows, session persistence, all in one tool.
---

## What is Zellij?

Zellij is a terminal multiplexer written in Rust. If you've used tmux, think of it as "tmux that works out of the box." If you haven't used tmux — Zellij lets you run multiple terminal sessions inside one window, and keeps them running in the background even when you disconnect.

**Zellij vs tmux:**

![Zellij vs tmux](/images/zellij-vs-tmux.svg)

| Feature          | tmux                        | Zellij                              |
| ---------------- | --------------------------- | ----------------------------------- |
| Default config   | Needs lots of customization | Works out of the box, built-in hints |
| Floating panes   | Not supported               | Native floating/embedded panes       |
| Layout system    | Manual management           | Layout templates (KDL format)        |
| Plugin system    | Third-party scripts         | Native WASM plugins                  |
| Collaborative    | Not built-in                | Native multi-user session sharing    |
| Status bar       | Needs configuration         | Looks great by default               |
| Config language  | tmux.conf                   | KDL (more readable)                  |

## Installation

**Linux**

```bash
# Option 1: Download prebuilt binary (recommended, no root needed)
wget https://github.com/zellij-org/zellij/releases/latest/download/zellij-x86_64-unknown-linux-musl.tar.gz
tar -xzf zellij-x86_64-unknown-linux-musl.tar.gz
mv zellij ~/.local/bin/
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

# Option 2: Package manager (requires sudo)
sudo apt install zellij          # Ubuntu/Debian
sudo dnf install zellij          # Fedora
```

**macOS**

```bash
brew install zellij
```

**Windows (WSL)**: Use the Linux installation method inside WSL.

## Core Concepts

Zellij's layered structure:

![Zellij Hierarchy](/images/zellij-hierarchy.svg)

Zellij uses **modal operation**, like vim. The default prefix key is `Ctrl+O` — press it to enter shortcut mode. The bottom status bar shows available actions.

**The session lifecycle**: understand these four steps, and you understand Zellij's core value:

![Zellij Session Lifecycle](/images/zellij-lifecycle.svg)

## Basic Operations

### Session Management

| Action                    | Command / Shortcut                |
| ------------------------- | --------------------------------- |
| New session               | `zellij`                        |
| Named session             | `zellij -s project-name`        |
| Detach (keep running)     | `Ctrl+O` → `D`               |
| Reattach                  | `zellij attach` or `zellij a` |
| List sessions             | `zellij list-sessions`          |
| Delete session            | `zellij delete-session <name>`  |
| Fully quit                | `Ctrl+O` → type `quit` Enter |

### Pane Operations

Press `Ctrl+O` first, then:

| Action           | Key                     |
| ---------------- | ----------------------- |
| Split right      | `R`                   |
| Split down       | `D`                   |
| Move focus       | Arrow keys or `h/j/k/l` |
| Close pane       | `X`                   |
| Toggle fullscreen | `F`                   |
| Floating pane    | `W`                   |
| Rename           | `C`                   |

The splitting progression — from one pane to three in just a few keystrokes:

![Zellij Pane Quickstart](/images/zellij-panes.svg)

### Tab Operations

| Action        | Key                         |
| ------------- | --------------------------- |
| New tab       | `Ctrl+O` → `N`         |
| Go to tab N   | `Ctrl+O` → `1` ~ `9` |
| Previous/next | `Ctrl+O` → `H` / `L` |
| Close tab     | `Ctrl+O` → `X`         |
| Rename tab    | `Ctrl+O` → `R`         |

### Other Useful Features

| Action          | Shortcut                                            |
| --------------- | --------------------------------------------------- |
| Scroll history  | `Ctrl+O` → `S` (scroll mode), arrow keys        |
| Search history  | Press `/` in scroll mode                          |
| Resize panes    | `Ctrl+O` → `R` (resize mode)                    |
| Lock interface  | `Ctrl+G` (prevent accidental keystrokes)           |

## Advanced Configuration

Zellij's config file is `~/.config/zellij/config.kdl`. Here's a recommended vim-style keybinding config:

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

**Layout templates**: Place `.kdl` files in `~/.config/zellij/layouts/` to define preset pane arrangements:

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

Then launch with: `zellij --layout dev`

![Zellij Dev Layout](/images/zellij-layout.svg)

## Remote Development

Zellij's biggest advantage for SSH remote work is **session persistence** — if SSH drops, your Zellij session keeps running on the server. Next time you connect, `zellij attach` restores everything.

```bash
# Auto-attach or create on SSH connection
ssh myserver -t "zellij attach --create"
```

## FAQ

- **Status bar icons are garbled?** Install a Nerd Font, or use simplified UI: `zellij options --simplified-ui true`
- **Session lost after SSH disconnect?** It shouldn't be. The Zellij daemon keeps all sessions alive. Re-SSH and `zellij attach`.
- **Mouse not working well?** Hold `Shift` to temporarily bypass Zellij's mouse capture, or disable permanently: `zellij options --disable-mouse-mode`
- **`Ctrl+O` conflicts?** Change the prefix key in `config.kdl`, or press `Ctrl+G` to lock the interface temporarily.
