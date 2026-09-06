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
---
## 前言

AI 编程助手默认的回答风格偏保守、偏教条——给的是教科书式的"最佳实践"，而不是在真实工程约束下权衡后的方案。如果你希望它更像一个**有经验的资深工程师搭档**——会从第一性原理思考、会质疑你的需求、会考虑工程权衡——可以试试把下面的提示词加到 AI 工具的系统设定里。

## 适用工具

以下工具都可以通过 Rules / Instructions / System Prompt 设置使用这段提示词：

- **Cursor**：Settings → Rules for AI → 粘贴内容
- **Windsurf**：Settings → AI Rules → 粘贴内容
- **Claude Code**：项目根目录 `CLAUDE.md` → 粘贴内容

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

## 为什么这段提示词有效

- **从第一性原理思考（first principles）**：它让 AI 先拆解问题本质，再给出方案，而不是套模板。
- **质疑需求（Question assumptions）**：减少无效工作——有时候你花 30 分钟描述的方案本身就不对，AI 应该指出。
- **权衡而非追求完美（Trade-offs）**：工程中没有银弹。明确告诉 AI 要列出优缺点，而不是给一个看起来"全对"的答案。
- **代码要无聊（boring code）**：可读性 > 巧妙性。六个月后的你自己会感谢现在的你。
- **声纳未知（Surface unknowns）**：让 AI 主动暴露它不确定的地方，而不是自行脑补。

<TutorialDiagram name="cursor-principles" />

## 效果对比

| 场景 | 默认回答 | 加上提示词后 |
| --- | --- | --- |
| "帮我写个单例模式" | 直接给代码 | 先问：你确定需要单例？你是想全局共享状态还是限制实例数？ |
| "优化这段代码性能" | 给一堆微优化 | 先问：你 profiled 了吗？瓶颈在哪里？不要过早优化。 |
| "用 Redis 做缓存" | 给 Redis 集成代码 | 先问：你的访问模式是什么？内存缓存够不够？加了 Redis 还要管运维成本。 |

<TutorialDiagram name="cursor-before-after" />

## 进阶：按项目定制

不同项目需要不同的"人格"风格。举个例子，你可以根据项目类型微调：

- **研究/探索项目**：让 AI 更激进地提方案，注重迭代速度而不是代码质量
- **生产系统**：让 AI 更保守，优先考虑向后兼容和错误处理
- **教学项目**：让 AI 多解释为什么这么做，而不只是给代码

把定制的指令加到项目根目录的 `CLAUDE.md` 或 Cursor Rules 中即可。

<TutorialDiagram name="cursor-tools" />

<div class="post-tags-section">
  <span class="label">标签:</span>
  <span class="tag-pill" v-for="tag in $frontmatter.tags" :key="tag">{{ tag }}</span>
</div>
