---
title: Make Cursor Smarter — An AI Persona Prompt
date: 2025-10-12
tags:
  - cursor
  - windsurf
  - claude-code
  - ai
  - prompt-engineering
description: A ready-to-use persona prompt for Cursor / Windsurf / Claude Code that shapes your AI into a senior engineer who reasons from first principles.
reviewed: 2026-09-07
scope: Cursor/Windsurf project rules and Claude Code project instructions
---
## Preface

If an AI coding assistant gives generic advice without considering your project’s constraints, explicit project instructions can guide its communication and workflow. If you want yours to behave more like an **experienced senior engineer** — someone who thinks from first principles, challenges your assumptions, and considers trade-offs — try adding the prompt below to its rules or project instructions. This does not change the underlying model or guarantee correct answers.

## Compatible Tools

The following instruction locations were checked against current documentation; their scope and activation differ:

- **Cursor**: A root `AGENTS.md` accepts plain Markdown instructions. Use `.cursor/rules/*.mdc` with an activation mode for conditional rules. [Rules documentation](https://cursor.com/docs/rules)
- **Windsurf**: Global rules use `~/.codeium/windsurf/memories/global_rules.md`; project rules can use `.windsurf/rules/*.md` with an activation mode. The official documentation now redirects to Devin Desktop and still lists these compatible paths. [Rules documentation](https://docs.devin.ai/desktop/cascade/memories)
- **Claude Code**: Project root `CLAUDE.md`; personal global instructions use `~/.claude/CLAUDE.md`. [Project memory documentation](https://code.claude.com/docs/en/memory)

Merge into existing files and preserve project conventions. These instructions supply context; they do not override product permissions or replace immutable system instructions.

## The Prompt

```
You are a senior software engineer who reasons from first principles.

When I ask you to implement something, I want you to:

1. Question my assumptions — If what I'm asking for seems inefficient, fragile, or
   misaligned with what I'm actually trying to achieve, tell me. Push back.

2. Think about trade-offs — There is no perfect solution. Tell me what we're
   gaining and what we're giving up with each approach you suggest.

3. Write code that is boring — Clever code is a liability. Prefer readability
   over conciseness. Prefer explicit over implicit. A junior engineer should
   be able to understand what you wrote without a decoder ring.

4. Consider the full lifecycle — Not just writing the code, but testing it,
   deploying it, debugging it six months from now, and eventually removing it.

5. Be concise but never vague — Say what you mean. Don't hedge with "it depends"
   without explaining what it depends on.

6. Surface unknowns — If there's something you don't know about my system,
   state your assumption and ask me to confirm. Don't silently guess.

Your tone: direct, respectful, slightly informal. Like a colleague in a
code review, not a professor lecturing.
```

## What This Prompt Tries to Encourage

- **First-principles reasoning**: It pushes the AI to decompose problems before proposing solutions, rather than pattern-matching.
- **Question assumptions**: Reduces wasted work — sometimes the solution you spent 30 minutes describing is the wrong one, and the AI should say so.
- **Trade-offs over perfection**: There are no silver bullets in engineering. Explicitly asking for pros and cons beats receiving an answer that looks "all correct."
- **Boring code**: Readability > cleverness. You six months from now will thank you.
- **Surface unknowns**: Makes the AI proactively flag what it's uncertain about rather than silently guessing.

<TutorialDiagram name="cursor-principles" />

## Illustrative Responses

These are examples, not measured outputs from a controlled model comparison. Judge usefulness through real project tasks and verification results.

| Scenario | Response to Avoid | Response to Encourage |
| --- | --- | --- |
| "Write a singleton pattern for me" | Gives code directly | First asks: are you sure you need a singleton? Do you want global shared state or to limit instances? |
| "Optimize this code's performance" | Suggests micro-optimizations | First asks: have you profiled it? Where's the bottleneck? Don't prematurely optimize. |
| "Use Redis for caching" | Gives Redis integration code | First asks: what's your access pattern? Is in-memory caching enough? Adding Redis means managing operational costs too. |

<TutorialDiagram name="cursor-before-after" />

## Advanced: Customize Per Project

Different projects need different "personality" styles. For example, you can tune based on project type:

- **Research/exploration projects**: Encourage quickly testable hypotheses while preserving reproducible steps and necessary checks
- **Production systems**: Make the AI more conservative, prioritizing backward compatibility and error handling
- **Teaching projects**: Have the AI explain the *why* more, not just give code

Merge custom instructions into your tool’s project rules. File scope, verification commands, and conditions that require clarification are more concrete than a senior-engineer persona alone.

<TutorialDiagram name="cursor-tools" />

<PostTags />
