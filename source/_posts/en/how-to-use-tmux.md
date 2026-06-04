---
title: How to Happily Use tmux for Background Tasks on Servers
title_en: How to Happily Use tmux for Background Tasks on Servers
date: 2026-06-04
tags: [tmux, terminal, server, tutorial]
lang: en
slug: how-to-use-tmux
description: tmux decouples sessions from terminal windows — closing a window ≠ stopping a task. Get started in 30 seconds, from installation to configuration.
---

## Preface

Sometimes you want to run tasks in the background, but a regular terminal kills your process the moment it closes (network drop, shutdown, SSH disconnection). tmux runs your tasks in a **session independent of your terminal**: you can "detach" at any time and "reattach" later, while your tasks keep running on the server.

In one sentence: **tmux decouples "sessions" from "terminal windows."** Closing a window ≠ ending a task.

## Installation

Most servers come with tmux pre-installed. Run `tmux -V` — if you see a version number, you're good. If not:

```bash
# Ubuntu / Debian
sudo apt install tmux
# CentOS / RHEL
sudo yum install tmux
# macOS
brew install tmux
```

## One Core Concept: The Prefix Key

All tmux shortcuts require pressing the **prefix key** first to wake tmux up. The default is `Ctrl+B`. Throughout this tutorial, `Ctrl+B, D` means: press `Ctrl+B` → release → press `D`.

## Core Workflow (Get Started in 30 Seconds)

```bash
# 1. Create a new session named "train"
tmux new -s train

# 2. Run your commands normally (Python, bash, whatever)
python train.py

# 3. Press Ctrl+B, D to detach
#    You're back in your regular terminal, but train.py keeps running

# 4. Close SSH, shut your laptop — doesn't matter. To check progress later:
tmux attach -t train
```

Detach is the soul of tmux: it doesn't end your task, it just separates you from the session. When the task is done and you no longer need the session, just `exit` inside it, or kill it with `tmux kill-session -t train`.

## Command Reference

| Action | Command / Shortcut |
| --- | --- |
| New session | `tmux new -s <name>` |
| List all sessions | `tmux ls` |
| Reattach to session | `tmux attach -t <name>` (short: `tmux a -t <name>`) |
| Detach current session | `Ctrl+B, D` |
| Kill a session | `tmux kill-session -t <name>` |
| Rename session | `tmux rename-session -t <old> <new>` |
| Enter scroll mode (view history) | `Ctrl+B, [` then scroll with arrow keys / `PgUp` |
| Exit scroll mode | `q` |

## Configuration: Make tmux Even Better

By default, tmux doesn't support mouse wheel scrolling, which is suboptimal. Edit `~/.tmux.conf`:

```bash
vim ~/.tmux.conf
```

Add the following:

```bash
set -g mouse on              # Enable mouse: scroll, click to select panes
setw -g mode-keys vi         # Use vi keybindings in copy mode
set -g history-limit 10000   # Increase scrollback buffer
```

Apply without restarting tmux:

```bash
tmux source-file ~/.tmux.conf
```

## FAQ

- **Forgot the session name?** `tmux ls` lists all sessions. If you can't find the one you're looking for, it's likely already ended.
- **`attach` says `no sessions`?** Means there are no active sessions — your task probably finished or was killed.
- **Is the task actually running?** Attach and check the output, or use `nvidia-smi` / `ps -ef | grep python` from outside the session.
- **tmux vs nohup?** `nohup python a.py &` also runs in the background, but you can't see real-time output or interact. tmux gives you a full re-attachable terminal — better for tasks where you need to monitor progress or intervene.
