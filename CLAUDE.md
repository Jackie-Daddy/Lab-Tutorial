# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A team blog built with **VitePress**, hosting short, standalone tutorials ("一些小技巧" / lab tips) for working on shared/remote lab servers. Content is bilingual (Chinese + English). The blog is deployed to GitHub Pages via GitHub Actions.

- **Repository**: [Dual-Pointers/Lab-Tutorial](https://github.com/Dual-Pointers/Lab-Tutorial)
- **Live site**: <https://dual-pointers.github.io/Lab-Tutorial/>
- **Base path**: `/Lab-Tutorial/` (configured in `.vitepress/config.mts`, clean URLs enabled)

## Tech stack

- **Static site generator**: VitePress 1.x (Vue 3 + Vite)
- **Theme**: Custom Anthropic brand theme (Lora + Fira Code fonts, dark/light mode, bilingual support)
- **Deployment**: GitHub Actions → `gh-pages` branch → GitHub Pages
- **Build**: Mermaid sources → generated light/dark PNGs → VitePress. Diagram coverage checks run before production builds; no unit-test framework or lint tooling is configured.

## Structure

```
├── .vitepress/
│   ├── config.mts                   ← VitePress configuration (i18n: zh + en)
│   └── theme/
│       ├── index.ts                 ← Custom theme (extends default)
│       ├── style.css                ← CSS (Anthropic brand colors)
│       ├── components/              ← Vue components
│       │   ├── PostList.vue         ← Blog post listing
│       │   ├── ArchiveList.vue      ← Year-grouped archives
│       │   └── PostNav.vue          ← Previous/next navigation
│       └── loaders/                 ← Data loaders (createContentLoader)
│           ├── zh-posts.data.ts     ← Chinese posts
│           └── en-posts.data.ts     ← English posts
├── zh/
│   ├── index.md                     ← Chinese homepage (PostList)
│   ├── archives.md                  ← Chinese archives
│   │   └── posts/                   ← Chinese posts
│   │       ├── claude-code-guide.md
│   │       └── ...
├── en/
│   ├── index.md                     ← English homepage
│   ├── archives.md                  ← English archives
│   │   └── posts/                   ← English posts
│   │       ├── claude-code-guide.md
│   │       └── ...
├── about.md                         ← About page
├── public/
│   └── images/                      ← Static assets (SVGs, PNGs)
├── index.md                         ← Root → redirect to /zh/
├── .github/workflows/               ← CI/CD (deploy.yml)
└── package.json
```

## Writing a new post

```bash
# Create a new Chinese post at zh/posts/your-post-title.md
# Create the English version at en/posts/your-post-title.md
```

Post front-matter:
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

Posts are automatically picked up by the data loaders and appear on the homepage and archives. No slug or lang fields needed — language is determined by directory path (zh/ or en/).

## Building and previewing

```bash
npm install          # Install dependencies (first time only)
npm run dev          # Start VitePress dev server with HMR
npm run build        # Build to .vitepress/dist/
npm run preview      # Preview built site locally
```

## Tutorial diagrams

Edit matching Mermaid sources in `diagrams/zh/` and `diagrams/en/`. Each source needs localized `accTitle` and `accDescr`; `diagrams/catalog.json` maps names to article slugs. Articles use `<TutorialDiagram name="tmux-workflow" />`. The component selects the article language and site theme, includes alternative text, and supports horizontal scrolling and full-size links.

Run `npm run diagrams` after source edits, or `npm run build` to generate, validate, and build everything. Rendering uses the official Mermaid CLI API, Puppeteer, and bundled Noto Sans SC fonts. Generated PNGs under `public/images/diagrams/` and `.vitepress/theme/diagrams.generated.json` are ignored by Git and rebuilt in CI. Keep raw diagram sources and contributor/planning documents excluded from VitePress pages.

## Deployment

Push to `main` triggers GitHub Actions (`deploy.yml`), which runs `npm run build` and pushes `.vitepress/dist/` to the `gh-pages` branch. GitHub Pages serves from that branch.

To set up a new machine: go to repo Settings → Pages → Source: "Deploy from a branch" → Branch: `gh-pages`, `/ (root)`.

## Design system

- **Colors**: dark `#141413` / light `#faf9f5` / orange `#d97757` / blue `#6a9bcc`
- **Fonts**: Lora (body/headings) + Fira Code (monospace)
- **Dark mode**: Fully supported via VitePress CSS variable overrides
- **Search**: Local full-text search (built-in VitePress)
