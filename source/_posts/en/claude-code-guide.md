---
title: Claude Code — The Complete Guide to AI-Powered Terminal Coding
title_en: Claude Code — The Complete Guide to AI-Powered Terminal Coding
date: 2026-06-04
tags: [claude-code, ai, terminal, anthropic, mcp, plugins, tutorial]
lang: en
slug: claude-code-guide
description: Anthropic's CLI AI coding assistant. Understands your entire project, refactors across files, extends via MCP and plugins — turn your terminal into an AI-powered dev workstation.
---

## What is Claude Code?

Claude Code is Anthropic's command-line AI coding assistant. Unlike GitHub Copilot's inline editor completions, Claude Code runs in your terminal and deeply interacts with your codebase:

- Understands your entire project structure, not just single files
- Multi-file refactoring and batch modifications
- Automatically runs tests and fixes failures
- Connects to external tools via MCP (Model Context Protocol)
- Plugin ecosystem with community-developed Skills

**Comparison:**

| Feature       | GitHub Copilot      | Cursor         | Claude Code                 |
| ------------- | ------------------- | -------------- | --------------------------- |
| Interaction   | Inline completions  | IDE + Chat     | Terminal CLI                |
| Context scope | Current file        | Current project| Entire repo + MCP tools     |
| Batch edits   | Not supported       | Limited        | Native support              |
| Run commands  | Not supported       | Limited        | Can execute shell commands  |
| Plugin system | None                | None           | Skills + MCP dual-layer     |
| Best for      | Writing new code    | Interactive dev| Complex refactors, debugging |

## Installation

```bash
# Prerequisite: Node.js ≥ 18
npm install -g @anthropic-ai/claude-code

# Launch
claude
```

First launch requires an Anthropic API key, or configure a third-party compatible endpoint (DeepSeek, OpenRouter, etc.).

## Basic Usage

```bash
# Interactive chat (most common)
claude

# One-shot task
claude "Refactor src/utils.py to extract duplicate code"

# Launch in a specific project
claude --project /path/to/project

# In-session commands
/add-dir src/        # Add directory to context
/init                # Generate CLAUDE.md (project spec file)
/config              # Modify settings
/clear               # Clear conversation context
/compact             # Compact context (save tokens)
/mcp                 # Manage MCP servers
```

## MCP Servers

**MCP (Model Context Protocol)** is Claude Code's extension mechanism. Think of it as Claude's "plugin skills" — MCP servers let Claude call external tools.

### Codegraph — Code Intelligence Graph

Indexes your project into a knowledge graph, enabling Claude to search symbol definitions and references, trace call chains, and analyze change impact.

```bash
codegraph init /path/to/your/project

# Configure MCP server (create .mcp.json in project root)
echo '{
  "mcpServers": {
    "codegraph": {
      "command": "codegraph",
      "args": ["serve", "--mcp", "--path", "/absolute/path/to/project"]
    }
  }
}' > .mcp.json
```

### GitHub CLI MCP

Let Claude operate on GitHub directly (create PRs, view Issues, reply to comments):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"]
    }
  }
}
```

## Plugin System (Skills & Plugins)

### Superpowers — Development Workflow Meta-Plugin

The most important plugin — defines a complete workflow specification for software development:

| Skill                              | When it fires            | Effect                                        |
| ---------------------------------- | ------------------------ | --------------------------------------------- |
| `brainstorming`                  | Before any new feature   | Forces design before implementation            |
| `test-driven-development`        | Before writing code      | Write tests first, then implement              |
| `writing-plans`                  | Complex tasks            | Plan first, review, then execute               |
| `verification-before-completion` | Before claiming "done"   | Must run verification, no empty "it's fixed"   |
| `systematic-debugging`           | When encountering bugs   | Structured debugging, not trial-and-error      |

Install:

```bash
/claude add plugin superpowers@claude-plugins-official
```

### Code Review & Simplifier

```bash
/code-review           # Review current diff
/code-review --fix     # Review and auto-fix issues
/simplify              # Eliminate duplication, simplify logic
```

### Andrej Karpathy Skills — Coding Guidelines

LLM coding best practices from Karpathy: avoid over-engineering, surgical changes, surface assumptions, define verifiable success criteria.

Add custom marketplace first:

```json
// ~/.claude/settings.json
{
  "extraKnownMarketplaces": {
    "karpathy-skills": {
      "source": {
        "source": "github",
        "repo": "forrestchang/andrej-karpathy-skills"
      }
    }
  }
}
```

Then:

```bash
/claude add plugin andrej-karpathy-skills@karpathy-skills
```

### Academic Research Skills

If your work involves paper writing:

```bash
/claude add plugin academic-research-skills@academic-research-skills
```

Common commands:

```bash
/ars-plan          # Chapter planning
/ars-outline       # Detailed outline
/ars-full          # Full paper pipeline
/ars-revision      # Revise per reviewer comments
/ars-abstract      # Generate bilingual abstract
/ars-citation-check # Check citation errors
```

## Advanced Configuration

### Using Third-Party API Endpoints

```json
// ~/.claude/settings.json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-api-key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]"
  }
}
```

### Project-Level Config (CLAUDE.md)

Create a `CLAUDE.md` in each project root — Claude Code loads it automatically on launch:

```markdown
# CLAUDE.md

## Project Overview
Video anomaly detection research project.

## Environment
- Python 3.10, PyTorch 2.x
- Conda env: avqa
- Data in datasets/ directory

## Coding Standards
- Prefer Codegraph MCP for code search
- Must run tests after every change
- Commit format: type: short description
```

## Productivity Tips

1. **Use `CLAUDE.md` for project conventions** — coding standards, common commands, architecture notes
2. **Chain Slash Commands**: `/brainstorming` → `/plan` → TDD implement → `/code-review` → `/simplify`
3. **Let Claude write commit messages**: `claude "Write a proper commit message for the current diff"`
4. **Use MCP for code archaeology**: `claude "Trace how this bug was introduced, starting from the failing function"`
5. **Batch edits with Claude**: `claude "Replace all print() calls with logging throughout the project"`

## FAQ

- **Where's the API key configured?** `~/.claude/settings.json` under `env.ANTHROPIC_AUTH_TOKEN`, or via environment variable.
- **How to switch to a cheaper model?** Change the `ANTHROPIC_MODEL` environment variable.
- **MCP server connection failed?** Check: 1) is the command installed (`which <command>`); 2) is the `.mcp.json` path absolute; 3) run `claude mcp list` to check status.
