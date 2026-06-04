# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A team blog built with **Hexo**, hosting short, standalone tutorials ("一些小技巧" / lab tips) for working on shared/remote lab servers. Content is bilingual (Chinese + English). The blog is deployed to GitHub Pages via GitHub Actions.

## Tech stack

- **Static site generator**: Hexo 7.x
- **Theme**: Custom `lab-theme` (Anthropic brand colors, Poppins + Lora fonts, bilingual support)
- **Deployment**: GitHub Actions → `gh-pages` branch → GitHub Pages
- **No build system, no tests, no lint tooling** — this is a static site, not an application.

## Structure

```
├── _config.yml              ← Hexo site configuration
├── source/
│   ├── _posts/
│   │   ├── zh/              ← Chinese posts (lang: zh)
│   │   └── en/              ← English posts (lang: en)
│   └── about/index.md       ← About page
├── themes/lab-theme/        ← Custom Hexo theme
│   ├── layout/              ← EJS templates
│   ├── source/css/          ← CSS stylesheets
│   └── languages/           ← i18n strings (zh-CN.yml, en.yml)
├── scaffolds/               ← Post templates (hexo new)
├── .github/workflows/       ← CI/CD (deploy.yml)
└── images/                  ← Legacy images (migrated to theme)
```

## Writing a new post

```bash
# Create a new Chinese post
hexo new post "your-post-title"
# → creates source/_posts/zh/your-post-title.md

# Manually create the English version at:
# source/_posts/en/your-post-title.md
```

Post front-matter requires:
```yaml
---
title: 中文标题
title_en: English Title
date: YYYY-MM-DD
tags: [tag1, tag2]
lang: zh          # or "en"
slug: your-slug
description: 一句话描述
---
```

## Building and previewing

```bash
npm install        # Install dependencies (first time only)
hexo server        # Start dev server at http://localhost:4000
hexo generate      # Build static files to public/
hexo deploy        # Deploy to gh-pages branch (CI handles this automatically)
```

## Deployment

Push to `main` triggers GitHub Actions (`deploy.yml`), which runs `hexo generate` and pushes `public/` to the `gh-pages` branch. GitHub Pages serves from that branch.

To set up a new machine: go to repo Settings → Pages → Source: "Deploy from a branch" → Branch: `gh-pages`, `/ (root)`.
