---
title: 让 Cursor 更聪明
date: 2025-10-12
tags:
  - cursor
  - windsurf
  - claude-code
  - ai
  - prompt-engineering
description: 一段可直接喂给 Cursor / Windsurf / Claude Code 的人格设定提示词，把 AI 调教成会从第一性原理拆解问题的资深工程师搭档。
reviewed: 2026-09-07
scope: Cursor/Windsurf 项目规则与 Claude Code 项目指令
---
## 前言

如果 AI 编程助手的回答过于泛泛，没有考虑项目的实际约束，可以用明确的项目指令调整沟通和工作方式。如果你希望它更像一个**有经验的资深工程师搭档**——会从第一性原理思考、会质疑你的需求、会考虑工程权衡——可以试试把下面的提示词加到 AI 工具的规则或项目指令中。它不会改变模型本身，也不保证回答准确。

## 适用工具

以下是按当前文档核对的指令入口；它们的作用域和加载条件不同：

- **Cursor**：项目根目录 `AGENTS.md` 可直接保存 Markdown 指令；需要条件规则时使用 `.cursor/rules/*.mdc` 并配置激活方式。[Rules 文档](https://cursor.com/docs/rules)
- **Windsurf**：全局规则文件 `~/.codeium/windsurf/memories/global_rules.md`；项目规则可放在 `.windsurf/rules/*.md` 并设置激活方式。当前官方文档已转到 Devin Desktop，仍列出这些兼容路径。[规则文档](https://docs.devin.ai/desktop/cascade/memories)
- **Claude Code**：项目根目录 `CLAUDE.md`；个人全局指令使用 `~/.claude/CLAUDE.md`。[项目记忆文档](https://code.claude.com/docs/en/memory)

合并到已有文件中，保留原来的项目约定。项目指令提供上下文，不等于绕过产品权限或替换不可编辑的系统指令。

## 提示词

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

## 这段提示词希望引导什么

- **从第一性原理思考（first principles）**：它让 AI 先拆解问题本质，再给出方案，而不是套模板。
- **质疑需求（Question assumptions）**：减少无效工作——有时候你花 30 分钟描述的方案本身就不对，AI 应该指出。
- **权衡而非追求完美（Trade-offs）**：工程中没有银弹。明确告诉 AI 要列出优缺点，而不是给一个看起来"全对"的答案。
- **代码要无聊（boring code）**：可读性 > 巧妙性。六个月后的你自己会感谢现在的你。
- **暴露未知（Surface unknowns）**：让 AI 主动暴露它不确定的地方，而不是自行脑补。

<TutorialDiagram name="cursor-principles" />

## 预期沟通方式示例

以下是示意，不是同一模型的实测对比；是否有帮助，应通过项目中的实际任务和验证结果判断。

| 场景 | 希望避免的回答 | 希望引导的回应 |
| --- | --- | --- |
| "帮我写个单例模式" | 直接给代码 | 先问：你确定需要单例？你是想全局共享状态还是限制实例数？ |
| "优化这段代码性能" | 给一堆微优化 | 先问：你 profiled 了吗？瓶颈在哪里？不要过早优化。 |
| "用 Redis 做缓存" | 给 Redis 集成代码 | 先问：你的访问模式是什么？内存缓存够不够？加了 Redis 还要管运维成本。 |

<TutorialDiagram name="cursor-before-after" />

## 进阶：按项目定制

不同项目需要不同的"人格"风格。举个例子，你可以根据项目类型微调：

- **研究/探索项目**：鼓励提出可快速验证的假设，同时保留可复现步骤和必要检查
- **生产系统**：让 AI 更保守，优先考虑向后兼容和错误处理
- **教学项目**：让 AI 多解释为什么这么做，而不只是给代码

把定制指令合并到所用工具的项目规则中；明确文件范围、验证命令和需要先澄清的条件，比只指定“资深工程师”人格更具体。

<TutorialDiagram name="cursor-tools" />

<PostTags />
