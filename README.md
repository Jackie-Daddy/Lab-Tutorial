# Lab Tutorial

**一些小技巧 · Lab Tips**

在共享/远程实验室服务器上干活时攒下的小技巧，每篇都是独立、可直接上手的短教程。

Built with [VitePress](https://vitepress.dev/) and deployed on [GitHub Pages](https://dual-pointers.github.io/Lab-Tutorial/).

---

## 📖 Tutorials

| # | Tutorial | EN |
|---|----------|-----|
| 1 | [如何愉快的配置内网服务器代理上网](https://dual-pointers.github.io/Lab-Tutorial/zh/posts/intranet-proxy) | [Proxy for Intranet Server](https://dual-pointers.github.io/Lab-Tutorial/en/posts/intranet-proxy) |
| 2 | [如何愉快的使用 tmux 在服务器后台跑任务](https://dual-pointers.github.io/Lab-Tutorial/zh/posts/how-to-use-tmux) | [tmux for Background Tasks](https://dual-pointers.github.io/Lab-Tutorial/en/posts/how-to-use-tmux) |
| 3 | [VSCode & Cursor & Windsurf 如何远程 debug 代码](https://dual-pointers.github.io/Lab-Tutorial/zh/posts/remote-debug) | [Remote Debug with VSCode/Cursor/Windsurf](https://dual-pointers.github.io/Lab-Tutorial/en/posts/remote-debug) |
| 4 | [让 Cursor 更聪明](https://dual-pointers.github.io/Lab-Tutorial/zh/posts/smarter-cursor) | [Make Cursor Smarter](https://dual-pointers.github.io/Lab-Tutorial/en/posts/smarter-cursor) |
| 5 | [Zellij — 现代化终端多路复用器完全指南](https://dual-pointers.github.io/Lab-Tutorial/zh/posts/zellij-guide) | [Zellij — The Modern Terminal Multiplexer](https://dual-pointers.github.io/Lab-Tutorial/en/posts/zellij-guide) |
| 6 | [Yazi — 现代化终端文件管理器入门](https://dual-pointers.github.io/Lab-Tutorial/zh/posts/yazi-guide) | [Yazi — Modern Terminal File Manager](https://dual-pointers.github.io/Lab-Tutorial/en/posts/yazi-guide) |
| 7 | [Lazygit — 告别手打 Git 命令](https://dual-pointers.github.io/Lab-Tutorial/zh/posts/lazygit-guide) | [Lazygit — Stop Typing Git Commands](https://dual-pointers.github.io/Lab-Tutorial/en/posts/lazygit-guide) |
| 8 | [Claude Code — AI 驱动的终端编程助手完全指南](https://dual-pointers.github.io/Lab-Tutorial/zh/posts/claude-code-guide) | [Claude Code — The Complete Guide to AI-Powered Terminal Coding](https://dual-pointers.github.io/Lab-Tutorial/en/posts/claude-code-guide) |

---

## 🚀 Quick Start

```bash
npm install
npm run dev          # Preview at http://localhost:5173
npm run build        # Build to .vitepress/dist/
npm run preview      # Preview built site locally
```

## ✍️ Writing a New Post

```bash
# Create a Chinese post at zh/posts/your-topic.md
# Create the English version at en/posts/your-topic.md
```

Each post uses frontmatter:

```yaml
---
title: 中文标题
date: YYYY-MM-DD
tags:
  - tag1
  - tag2
description: 一句话描述
---
```

Posts are automatically picked up by the data loaders (`.vitepress/theme/loaders/`) and appear on the homepage and archives. Language is determined by directory path (`zh/` or `en/`).

## 🤝 Contributing

1. Write a tutorial focused on one specific problem
2. Use clear, step-by-step structure with copy-paste-ready commands
3. Provide both Chinese and English versions

## 🛠 Built With

- **VitePress** — Static site generator (Vue 3 + Vite)
- **Custom theme** — Anthropic brand colors, Lora + Fira Code fonts, dark/light mode
- **GitHub Actions** — Auto-deploy on push to `main`

## 📄 License

MIT
