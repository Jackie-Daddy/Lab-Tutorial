---
title: How to Happily Use tmux for Background Tasks on Servers
date: 2025-09-25
tags:
  - tmux
  - terminal
  - server
  - tutorial
description: tmux decouples sessions from terminal windows — closing a window ≠ stopping a task. Get started in 30 seconds, from installation to configuration.
reviewed: 2026-09-07
scope: Linux/macOS; tmux 3.x
---
## Preface

Foreground tasks started directly in an SSH terminal may exit when the terminal closes or the connection drops. tmux runs your tasks in a **session independent of your terminal**: you can "detach" at any time and "reattach" later, while your tasks keep running on the server.

In one sentence: **tmux decouples "sessions" from "terminal windows."** Closing a window ≠ ending a task.

Start tmux **on the server**. That host and the tmux server must remain running: a reboot, suspension, or termination by an administrator or scheduler can interrupt the job. tmux does not restart training automatically. [Official introduction](https://github.com/tmux/tmux/wiki/Getting-Started)

## Installation

Run `tmux -V` to check whether it is installed. If not:

```bash
# Ubuntu / Debian
sudo apt install tmux
# Fedora / recent RHEL-family distributions
sudo dnf install tmux
# macOS
brew install tmux
```

## One Core Concept: The Prefix Key

The session shortcuts below start with the **prefix key**, `Ctrl+B` by default. `Ctrl+B, d` means: press `Ctrl+B` → release → press lowercase `d`, without `Shift`. Keys inside copy mode, such as arrows and `q`, do not need the prefix.

## Core Workflow (Get Started in 30 Seconds)

```bash
# 1. Create a new session named "train"
tmux new -s train

# 2. Run your commands normally (Python, bash, whatever)
python train.py

# 3. Press Ctrl+B, d to detach
#    You're back in your regular terminal, but train.py keeps running

# 4. Close SSH, shut your laptop — doesn't matter. To check progress later:
tmux attach -t train
```

<TutorialDiagram name="tmux-workflow" />

Detach is the soul of tmux: it doesn't end your task, it just separates you from the session. When the task is done and you no longer need the session, just `exit` inside it, or kill it with `tmux kill-session -t train`.

## Command Reference

| Action | Command / Shortcut |
| --- | --- |
| New session | `tmux new -s <name>` |
| List all sessions | `tmux ls` |
| Reattach to session | `tmux attach -t <name>` (short: `tmux a -t <name>`) |
| Detach current session | `Ctrl+B, d` |
| Kill a session | `tmux kill-session -t <name>` |
| Rename session | `tmux rename-session -t <old> <new>` |
| Enter scroll mode (view history) | `Ctrl+B, [` then scroll with arrow keys / `PgUp` |
| Exit scroll mode | `q` |

<TutorialDiagram name="tmux-cheatsheet" />

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

<TutorialDiagram name="tmux-config" />

With a tmux session running, reload the configuration:

```bash
tmux source-file ~/.tmux.conf
```

## FAQ

- **Forgot the session name?** `tmux ls` lists all sessions. If you can't find the one you're looking for, it's likely already ended.
- **`attach` says `no sessions`?** Means there are no active sessions — your task probably finished or was killed.
- **Is the task actually running?** Attach and check the output, or use `nvidia-smi` / `ps -ef | grep python` from outside the session.
- **tmux vs nohup?** `nohup python -u a.py > train.log 2>&1 &` ignores hangup signals and writes output to a log; `tail -f train.log` shows new output as it arrives. It does not provide a terminal you can reattach to for interaction. tmux does. Neither preserves the original process across a server reboot. [nohup manual](https://www.gnu.org/software/coreutils/manual/html_node/nohup-invocation.html)

<PostTags />
