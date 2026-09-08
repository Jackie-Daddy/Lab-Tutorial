---
title: Claude Code — The Complete Guide to AI-Powered Terminal Coding
date: 2026-06-04
tags:
  - claude-code
  - ai
  - terminal
  - anthropic
  - mcp
  - plugins
  - tutorial
description: Anthropic's CLI AI coding assistant. Understands your entire project, refactors across files, extends via MCP and plugins — turn your terminal into an AI-powered dev workstation.
reviewed: 2026-09-07
scope: Claude Code terminal CLI; official documentation as of 2026-09-07
---
## What is Claude Code?

Claude Code is Anthropic’s AI coding assistant. This article covers its terminal CLI: reading project files, editing across files, running commands and tests, and connecting to external tools through MCP. Check the resulting diff and test output against your requirements. [Product overview](https://code.claude.com/docs/en/overview)

**How do the tools fit into a workflow?**

| Tool | Common entry points | Distinction used here |
| --- | --- | --- |
| GitHub Copilot | Editor completions, IDE Agent, cloud agent | Completion is one of several modes |
| Cursor | Agent and code editing inside the IDE | Agent can edit files and run commands |
| Claude Code | Terminal CLI and other clients | This guide focuses on starting from a shell |

Their agent capabilities evolve. Claims that Copilot only sees the current file or that Cursor cannot make batch edits do not describe the current products. [GitHub agent documentation](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-cloud-agent) · [Cursor Agent documentation](https://cursor.com/docs/agent/overview)

<TutorialDiagram name="claude-code-vs" />

## Installation

For macOS, Linux, or WSL, use the official native installer:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

For Windows PowerShell:

```powershell
irm https://claude.ai/install.ps1 | iex
```

Choose the method for your platform. Native installation does not require Node.js first. See the [installation documentation](https://code.claude.com/docs/en/setup) for alternatives and system requirements.

```bash
claude --version
claude --help
cd /path/to/project
claude
```

Replace `/path/to/project` with your project directory. Follow the login flow for an account with Claude Code access, or use Anthropic Console API credentials. A manually configured API key is not required for every user. [Authentication](https://code.claude.com/docs/en/authentication)

## Basic Usage

Run these commands from a shell in your project directory:

```bash
# Interactive session
claude

# Interactive session with an initial task
claude "Refactor src/utils.py to extract duplicate code"

# Non-interactive output; exit when finished
claude -p "Explain the responsibilities of src/utils.py without editing files"

# Enter a particular project, then launch
cd /path/to/project
claude
```

`claude "task"` remains interactive; use `-p` when a script needs output followed by exit. The current directory determines the project; there is no `--project` launch flag as previously shown here. [CLI reference](https://code.claude.com/docs/en/cli-reference)

Enter the following **inside a Claude Code session**, one command per message, rather than in Bash:

```text
/init
/config
/clear
/compact
/mcp
```

`/init` drafts project instructions for you to review. The remaining commands open settings, start a fresh conversation, compact context, and manage MCP. Type `/` to see the commands in your installation. `/add-dir /path/to/other-project` adds file access; it does not load every file into context immediately. [Command reference](https://code.claude.com/docs/en/commands)

## MCP Servers

**MCP (Model Context Protocol)** lets Claude Code call tools exposed by servers. Code indexing, search, and remote mutations depend on the server implementation; MCP alone does not supply them.

<TutorialDiagram name="claude-code-mcp" />

### Choose a Server and Configuration Scope

Check the server’s maintainer, installation instructions, and official README before configuring a process command or HTTP URL. `claude mcp add` defaults to personal configuration for the current project. `--scope project` uses a shareable `.mcp.json`; `--scope user` applies across projects. Merge entries into an existing `mcpServers` object instead of overwriting other servers. [MCP configuration](https://code.claude.com/docs/en/mcp)

### GitHub’s Official Remote MCP

This example uses GitHub’s HTTP service and does not require an npm package called “GitHub CLI MCP.” Merge this into the project’s `.mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_PAT}"
      }
    }
  }
}
```

Before starting `claude`, supply a GitHub PAT through your credential management process as the shell environment variable `GITHUB_PAT`, limited to the repositories and operations needed. Claude Code expands environment variables in MCP headers, so the actual token need not enter the repository. [Variable expansion](https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcpjson) · [GitHub installation guide](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md)

```bash
claude mcp list
claude mcp get github
```

Then inspect the connection with `/mcp` inside the session. Private repository access, PR creation, and comments depend on token permissions and tool authorization.

## Plugin System (Skills & Plugins)

### Superpowers — Development Workflow Plugin

Superpowers is an optional community workflow plugin for design, planning, testing, debugging, and verification. Installing it does not prove those checks happened; inspect the actual results. [Project README](https://github.com/obra/superpowers)

| Skill | Purpose |
| --- | --- |
| `brainstorming` | Clarify requirements and design |
| `test-driven-development` | Confirm a failing test before implementation |
| `writing-plans` | Break implementation into steps |
| `verification-before-completion` | Check evidence before claiming completion |
| `systematic-debugging` | Diagnose failures from evidence |

Install inside a Claude Code session:

```text
/plugin marketplace add anthropics/claude-plugins-official
/plugin install superpowers@claude-plugins-official
```

Skip the first command if the marketplace is already present. Follow any activation or restart instructions and check `/plugin` for status. [Plugin installation](https://code.claude.com/docs/en/discover-plugins)

<TutorialDiagram name="claude-code-plugins" />

### Bundled Code Review and Simplify

The current official command reference lists these bundled workflows. Confirm availability in your `/` menu, then run them individually as needed:

```text
/code-review
/code-review --fix
/simplify
```

`/code-review` checks correctness and cleanup opportunities; `--fix` edits files. `/simplify` applies cleanup changes and does not replace a correctness review. Inspect the diff and rerun validation afterward. [Bundled workflows](https://code.claude.com/docs/en/commands)

The separately installed older `code-review` plugin reviews PRs and its script can publish comments with `gh pr comment`. Do not confuse it with a read-only local review; check the actual command source before use. [Plugin command source](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-review/commands/code-review.md)

### Karpathy Skills — Community Coding Guidelines

This community project distills Karpathy’s public observations; it is not an official plugin maintained by Karpathy. It emphasizes stating assumptions, keeping implementations simple, limiting edits, and defining verification criteria. [Project description](https://github.com/multica-ai/andrej-karpathy-skills)

```text
/plugin marketplace add multica-ai/andrej-karpathy-skills
/plugin install andrej-karpathy-skills@karpathy-skills
```

### Research Writing Skills

Research plugins do not share a universal `/ars-*` command set. Choose one with an identified repository, maintainer, and installation guide, then check its actual commands in `/plugin` or its README. You can also encode experiment records, source requirements, and section workflows in a project Skill; see the [official Skills documentation](https://code.claude.com/docs/en/skills).

## Advanced Configuration

### API Credentials and Gateways

- Use `ANTHROPIC_API_KEY` for direct Anthropic API access.
- Use `ANTHROPIC_AUTH_TOKEN` when your gateway requires a Bearer token, following its documentation.
- `ANTHROPIC_BASE_URL` selects a gateway endpoint; changing it alone does not establish correct authentication or API compatibility.

Supply these through your shell or credential management process. Custom endpoints must support the API Claude Code requires; an arbitrary OpenAI-compatible endpoint is not necessarily compatible. Use model identifiers actually supported by the selected service. [Credential variables](https://code.claude.com/docs/en/authentication) · [Gateway documentation](https://code.claude.com/docs/en/llm-gateway)

### Project-Level Instructions (CLAUDE.md)

Maintain a root `CLAUDE.md` with the environment, edit scope, and verification steps, merging with any existing instructions. It supplies session guidance; it does not install dependencies or guarantee compliance. [Project memory](https://code.claude.com/docs/en/memory)

```markdown
# Project Instructions

## Project Overview
Video anomaly detection research project.

## Environment
- Use the Python version and dependencies specified by the project lockfile
- Use the project’s prescribed virtual environment
- Data lives in datasets/; do not modify raw data

## Coding Standards
- Find existing implementations first; limit edits to task-related files
- Run relevant verification commands from README and report actual results
- Commit format: type: short description
```

## Productivity Tips

1. **Use `CLAUDE.md` for project conventions**: record verifiable environment and validation commands.
2. **Define scope before implementation**: use `/plan` for complex tasks and confirm plugin commands in the menu.
3. **Draft commit messages**: `claude "Draft a commit message for the current diff without committing"`.
4. **Investigate bugs with evidence**: provide errors, reproduction steps, and relevant commits.
5. **Review batch edits in stages**: inspect diffs and run project checks instead of relying on a completion message.

<TutorialDiagram name="claude-code-workflow" />

## FAQ

- **Command not found?** Open a fresh terminal, check that the install directory is on `PATH`, and consult installation troubleshooting.
- **API key not taking effect?** Distinguish `ANTHROPIC_API_KEY` from gateway Bearer credentials. Check `/status` for the active authentication method without printing secrets.
- **How do I switch models?** Use `/model` for options available to your account; see the CLI reference for flags and environment variables.
- **MCP connection failed?** Inspect `claude mcp list` and `/mcp`. Check executable paths for local servers, or URL, network access, and authentication variables for HTTP servers.

<PostTags />
