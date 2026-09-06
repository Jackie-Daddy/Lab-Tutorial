---
title: Herdr — Terminal Workspaces for AI Coding Agents
date: 2026-09-06
tags:
  - herdr
  - terminal
  - ai
  - server
  - tutorial
description: Manage multiple coding agents with Herdr, from installation, panes, and status tracking to session restore, remote SSH work, and CLI coordination.
---
## What is Herdr?

When several coding agents are running, starting them is often the easy part. Keeping track of which one is working, which one has finished, and which one is waiting for approval takes more attention.

[Herdr](https://herdr.dev/) is a terminal workspace manager written in Rust. It hosts real terminal processes in panes, with splits, tabs, background sessions, and status detection for tools such as Claude Code, Codex, and OpenCode. You run your usual commands inside those panes; Herdr organizes their terminals and exposes controls for them.

**Coming from our [tmux](./how-to-use-tmux) or [Zellij](./zellij-guide) tutorial?** Splitting panes and detaching from a session will feel familiar. Herdr adds a central view of agent activity and a CLI for coordinating agents. Detection depends on the supported process, screen rules, or integration. Ordinary shell programs also work in its panes. [Agent documentation](https://herdr.dev/docs/agents/)

::: tip Version scope
This tutorial follows the stable **v0.8.2** documentation checked on September 6, 2026. After an upgrade, verify changed options with `herdr --help`, subcommand help, and the in-app keybinding help. [Release notes](https://github.com/herdrdev/herdr/releases/tag/v0.8.2)
:::

## Installation

**Linux / macOS: official installer**

```bash
curl -fsSL https://herdr.dev/install.sh | sh
```

**For Homebrew users**

```bash
brew install herdr
```

**Windows: install from PowerShell**

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"
```

Choose one method. Alternatively, download the binary for your OS and CPU from [GitHub Releases](https://github.com/herdrdev/herdr/releases). Keep the Windows ZIP contents together, including its runtime libraries.

Open a new terminal and check:

```bash
herdr --version
herdr --help
```

Install and authenticate your coding agent separately, and confirm it works in a normal terminal first. [Installation documentation](https://herdr.dev/docs/install/)

## Core Concepts

These four levels help distinguish a project container from an individual terminal:

| Level | Meaning | Example organization |
| --- | --- | --- |
| Session | A persistent background server namespace | Start with the default session |
| Workspace | A project container | One repository or independent task |
| Tab | A layout within a workspace | Development, logs, or review |
| Pane | A real terminal | An agent, tests, or a shell |

<TutorialDiagram name="herdr-hierarchy" />

Panes share the host filesystem. **Creating a Workspace does not isolate code changes.** Give agents separate Git worktrees when they need to edit the same repository concurrently, then open the corresponding directories. Log viewers and tests can use the same checkout when appropriate.

One default session with several workspaces is usually enough. For independent runtime state, use a named session:

```bash
herdr session list
herdr session attach lab
```

`lab` is a name you choose. Named sessions maintain separate panes and runtime state, while sharing global configuration. [Concepts](https://herdr.dev/docs/concepts/) · [Named sessions](https://herdr.dev/docs/persistence-remote/)

## A Five-Minute Start

### Launch and Split

From your project directory, run:

```bash
herdr
```

This starts or attaches to the default background session. An empty session creates a workspace automatically. An existing session brings back its previous UI; launching from another directory does not automatically switch projects.

Run an installed agent, such as `claude`, in the first pane. Press **`Ctrl+B` → `v`** to split right, then run tests or inspect `git diff` in the new pane. Use the workspace menu to add another project.

Mouse controls cover most operations: click to focus panes, drag dividers to resize, and right-click for menus. Drag-select text to copy it without interrupting a process with `Ctrl+C`. [Quick start](https://herdr.dev/docs/quick-start/)

### Essential Shortcuts

The arrow means **press `Ctrl+B`, release it, then press the next key**. Uppercase letters require `Shift`.

| Action | Default shortcut |
| --- | --- |
| Show active keybindings | `Ctrl+B` → `?` |
| Split right / down | `Ctrl+B` → `v` / `-` |
| Focus left / down / up / right | `Ctrl+B` → `h` / `j` / `k` / `l` |
| Zoom / restore focused pane | `Ctrl+B` → `z` |
| New tab | `Ctrl+B` → `c` |
| Next / previous tab | `Ctrl+B` → `n` / `p` |
| Workspace navigation | `Ctrl+B` → `w` |
| New workspace | `Ctrl+B` → `N` |
| Enter copy mode | `Ctrl+B` → `[` |
| Detach and leave tasks running | `Ctrl+B` → `q` |
| Close focused pane | `Ctrl+B` → `x` |

In copy mode, `/` searches, `v` starts a selection, and `y` copies. Closing a pane affects its tasks; use detach when leaving. See the [keyboard guide](https://herdr.dev/docs/keyboard/) and in-app help for all bindings.

## Reading Agent Status

| State | Meaning | Suggested action |
| --- | --- | --- |
| `working` | The agent is active | Work elsewhere while it runs |
| `blocked` | An input, approval, or decision screen was detected | Read the question and respond |
| `done` | Finished, but not yet viewed | Inspect the output, diff, and tests |
| `idle` | Seen after finishing, or waiting for input | Assign the next task when ready |
| `unknown` | Herdr cannot classify the state confidently | Inspect the actual pane |

Statuses roll up to tabs and workspaces. **`done` does not prove tests passed**, and `idle` does not guarantee that nothing needs attention. Screen detection can misclassify unfamiliar prompts after an agent update. [State definitions](https://herdr.dev/docs/concepts/) · [Detection](https://herdr.dev/docs/agents/)

### Optional Integrations

For Claude Code and Codex CLI, install the integrations you need after installing and initializing those agents:

```bash
herdr integration install claude
herdr integration install codex
herdr integration status
```

These commands modify the agents' user configuration to install Herdr hooks. **In v0.8.2, these two integrations supply native session identity for conversation restore; their activity status still uses screen rules.** Some other agents support full lifecycle reporting. [Integration documentation](https://herdr.dev/docs/integrations/)

## A Practical Workflow: Edit, Verify, Review

For a lab repository, try two tabs in one workspace:

- **Development**: an agent edits a specified module while another pane runs the project's existing tests.
- **Review**: inspect `git diff`, logs, and experiment results against the task requirements.

<TutorialDiagram name="herdr-workflow" />

Give the agent an explicit scope, validation command, and completion condition. For example: “Fix empty-directory handling in the data loader. Change only the relevant module, run the existing tests, and explain the change and test results.” Returning a failing test's output gives it a concrete next step.

A second agent can review the current diff without editing files. If it also needs to make changes concurrently, give it a separate worktree and a clear file scope. Herdr's status display does not resolve Git conflicts.

### Advanced: Start a Review Agent from the CLI

Run this example **inside a shell pane of an existing Herdr session, from a Git repository**. It requires `jq` and a configured `codex` CLI. The new pane uses your current directory; `reviewer` must be an unused live agent name in the session.

```bash
# Create a pane and read its actual returned ID
split_json=$(herdr pane split --current --direction right --no-focus --cwd "$PWD")
review_pane=$(printf '%s\n' "$split_json" | jq -er '.result.pane.pane_id')

# Start an agent in that pane and submit a review task
herdr agent start reviewer --kind codex --pane "$review_pane"
herdr agent prompt reviewer "Review the current git diff. Do not edit files. Report bugs and missing tests." \
  --wait --timeout 120000

# Read the currently visible output
herdr agent read reviewer --source visible
```

Timeouts are in milliseconds. By default, `--wait` accepts `idle`, `done`, or `blocked`, so inspect the returned state and output. A timeout only means the wait timed out. Handle login or approval screens in the pane before submitting a task. `agent start` requires an existing available shell pane; it does not create the layout. [Automation guide](https://herdr.dev/docs/agent-automation/) · [CLI options](https://herdr.dev/docs/cli-reference/)

## Persistence and Remote Development

### Detaching and Stopping

Press `Ctrl+B` → `q` to detach, then run `herdr` to return. Tasks can continue while the background server and host remain running and the host stays awake.

<TutorialDiagram name="herdr-lifecycle" />

| Event | Do original processes continue? | What returns? |
| --- | --- | --- |
| Client detach and reattach | Yes, while the server remains alive | The live terminal and runtime state |
| SSH disconnect and reconnect | Yes, while the remote server remains alive | The original remote session |
| Herdr server stop or host reboot | No | Saved layout and directories; eligible agents may resume conversations |

Restoring a layout does not rerun arbitrary training jobs, tests, or development servers. Agent conversation restore requires a valid session reference from an official integration. Saving recent screen contents to disk is a separate feature, disabled by default. [Session restore](https://herdr.dev/docs/session-state/)

### On a Lab Server

The direct approach is to SSH to the server, then run Herdr there. Replace `lab-server` with your SSH host alias and install Herdr remotely first:

```bash
ssh lab-server
herdr
```

Detach from Herdr before exiting SSH. Next time, connect to the same server as the same user and run `herdr` to return to the default session.

Alternatively, install Herdr locally and use its SSH remote mode:

```bash
herdr --remote lab-server

# Attach to a named remote session
herdr --remote lab-server --session lab
```

This uses normal OpenSSH authentication. Check that `ssh lab-server` works first. Interactive remote startup may offer to install a matching binary if one is missing. In v0.8.2, remote hosts can run Linux or macOS; local clients can also run Windows. [Remote access](https://herdr.dev/docs/persistence-remote/)

## Configuration and Updates

The config file is `~/.config/herdr/config.toml` on Linux/macOS and `%APPDATA%\herdr\config.toml` on Windows. Herdr works without one. Inspect defaults with `herdr --default-config`, then merge settings as needed. Edit existing TOML tables instead of adding duplicate ones.

```toml
[keys]
prefix = "ctrl+a"

[ui]
mouse_capture = true

[ui.toast]
delivery = "herdr"
delay_seconds = 1
```

With this prefix change, replace `Ctrl+B` in the tutorial's shortcuts with `Ctrl+A`. Notifications here appear inside Herdr. For SSH terminal notifications, see the documented `terminal` delivery option and your terminal's support.

```bash
herdr server reload-config
```

Most UI settings reload without restarting panes; startup-only options may require a restart. [Configuration guide](https://herdr.dev/docs/configuration/)

Update through your installation channel: `herdr update` for the official installer, or `brew upgrade herdr` for Homebrew. Schedule server restarts after tasks finish. [Update documentation](https://herdr.dev/docs/install/)

## FAQ

- **Command not found?** Open a new terminal and check the install directory is on `PATH`. Remote use also depends on the remote user's environment.
- **Shortcuts do nothing?** Press the prefix before the action key, check custom bindings and your input language, then open help with prefix plus `?`.
- **Incorrect agent status?** Find the target with `herdr agent list`, then use `herdr agent explain <target>`. Launching tmux inside a Herdr pane can hide the actual agent process. [Detection troubleshooting](https://herdr.dev/docs/agents/)
- **Why does a new terminal show the old project?** `herdr` reconnects to the existing session. Create a workspace from the menu, or run `herdr workspace create --cwd "$PWD" --label my-project` in the intended directory. [CLI reference](https://herdr.dev/docs/cli-reference/)
- **How do I stop everything?** After tasks finish, use `herdr server stop` for the default session or `herdr session stop lab` for the named session. This stops its pane processes. [Session management](https://herdr.dev/docs/persistence-remote/)

<div class="post-tags-section">
  <span class="label">Tags:</span>
  <span class="tag-pill" v-for="tag in $frontmatter.tags" :key="tag">{{ tag }}</span>
</div>
