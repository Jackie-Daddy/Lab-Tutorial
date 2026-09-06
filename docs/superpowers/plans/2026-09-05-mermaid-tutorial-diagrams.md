# Mermaid Tutorial Diagrams Implementation Plan

> **For agentic workers:** Execute the independent content groups in parallel, then review and integrate them with the shared rendering pipeline. The current conversation authorizes implementation and publication.

**Goal:** Replace every tutorial illustration with a bilingual Mermaid source and deploy verified generated images.

**Architecture:** Mermaid sources produce cached light/dark PNGs and a generated metadata manifest. One Vue component consumes that manifest and serves images under the VitePress base path. The production build regenerates assets in CI.

**Tech Stack:** VitePress, Vue 3, Mermaid CLI, Puppeteer, bundled Noto Sans SC, Node.js 20 in CI.

**Spec:** `docs/superpowers/specs/2026-09-05-mermaid-tutorial-diagrams-design.md`

## Global constraints

- Preserve the 28 diagram subjects, all 56 article placements, and matching Chinese/English filenames.
- Do not publish contributor guides, planning documents, scripts, or raw diagram sources as site pages.
- Keep existing article prose and the site logo; use no handwritten SVG for tutorial diagrams.
- Keep labels legible; provide accessible descriptions, theme variants, and mobile scrolling.

## Tasks

- [x] Inventory all existing images and capture their source-to-post mapping in `diagrams/catalog.json`.
- [x] Implement `scripts/check-diagrams.mjs` to reject missing locale sources, unconverted references, orphan diagram names, or invalid generated PNG metadata. Run it before migration and confirm it identifies missing sources.
- [x] Migrate tmux, proxy, Zellij, and Yazi diagrams into `diagrams/{zh,en}/*.mmd`, using corresponding articles and old SVG labels as evidence.
- [x] Migrate Cursor, debugpy, Lazygit, and Claude Code diagrams into the same source directories.
- [x] Implement `scripts/render-diagrams.mjs`: load the catalog, use `renderMermaid()` with a shared Puppeteer browser, render each locale/theme, and write PNG dimensions plus accessibility text to `.vitepress/theme/diagrams.generated.json`.
- [x] Add `TutorialDiagram.vue`, register it in the theme, and replace each old image reference with the component and its original diagram identifier.
- [x] Add npm scripts, generated-file exclusions, VitePress source exclusions, and CI generation through `npm run build`. Document source editing and validation commands.
- [x] Run `npm run check:diagrams`, `npm run build`, and browser QA of both locales, themes, and narrow screens. Inspect every generated diagram with contact sheets, correcting cramped labels or clipping.
- [x] Request independent code/content review and resolve actionable findings.
- [ ] Commit the verified changes, integrate into `main`, push GitHub, follow the deployment run for that commit, and verify live pages/assets.

## Validation contract

`npm run check:diagrams` must enumerate the real catalog and Markdown component references, compare locale sets, require accessibility text, and check each generated PNG against manifest dimensions. `npm run build` must complete with all expected localized articles and without `AGENTS.html` or planning documents. Browser checks must verify image loads, theme switching, preserved full-resolution links, contained mobile scrolling, and absence of console errors.

## Pre-publication verification

Node.js 20.20.2: production build passed; 28 subjects, 56 localized placements, and 112 fully decoded PNGs validated. Browser checks passed for all 64 combinations of 16 articles, two viewport sizes, and two initial themes, plus desktop theme toggles. Independent pipeline review findings were resolved. Contact sheets and browser screenshots were visually reviewed; original article prose is unchanged apart from diagram references. Deployment completion is recorded in the task and GitHub Actions after publication.
