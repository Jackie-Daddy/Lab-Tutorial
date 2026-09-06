# Repository Guidelines

## Project Structure & Module Organization

Lab Tutorial is a bilingual VitePress tutorial site.

- `zh/posts/` and `en/posts/`: Chinese and English tutorials with matching filenames.
- `zh/` and `en/`: localized homepages and archives; root `index.md` redirects to Chinese, and `about.md` is shared.
- `.vitepress/config.mts`: site configuration, locales, navigation, and `/Lab-Tutorial/` base path.
- `.vitepress/theme/`: theme entry point, shared CSS, Vue components, and post data loaders. Loaders automatically populate homepages and archives.
- `diagrams/{zh,en}/`: paired Mermaid sources; `catalog.json` maps diagrams to posts.
- `scripts/`: diagram rendering and coverage checks. `public/images/` contains static assets; its generated `diagrams/` subdirectory is ignored by Git.
- `.github/workflows/deploy.yml`: builds and deploys `main` to the `gh-pages` branch.

## Build, Test, and Development Commands

Use Node.js 20 to match CI and npm with the committed `package-lock.json`.

- `npm ci`: install the locked dependency versions.
- `npm run diagrams`: regenerate cached light/dark PNGs with bundled fonts.
- `npm run check:diagrams`: validate sources, references, and generated images.
- `npm run dev`: generate diagrams and start the local development server.
- `npm run build`: generate/check diagrams and build `.vitepress/dist/`.
- `npm run preview`: serve the production output after building.

Keep generated output, caches, and `node_modules/` out of commits.

## Coding Style & Naming Conventions

Use two-space indentation in TypeScript, Vue, CSS, and YAML. TypeScript uses single quotes and omits semicolons; CSS declarations use semicolons. Use Vue `<script setup lang="ts">`, PascalCase components (`PostHeader.vue`), and kebab-case tutorials (`remote-debug.md`). No formatter or linter is configured.

Write focused tutorials with runnable, language-tagged code blocks. Provide both language versions and frontmatter containing `title`, `date` (`YYYY-MM-DD`), `tags`, and `description`. Start article sections at `##`; `PostHeader.vue` renders the frontmatter title as the page heading. Reuse theme CSS variables and `withBase()` for component-generated internal URLs.

## Testing Guidelines

No unit-test framework or coverage threshold exists. `npm run build` checks every diagram source, localized article placement, and PNG. Inspect both languages, navigation, images, themes, and mobile scrolling in the preview. Diagram edits must update both `.mmd` files and localized `accTitle`/`accDescr`; use `<TutorialDiagram name="tmux-workflow" />` in articles. Verify links manually: `ignoreDeadLinks: true` disables build-time dead-link failures.

## Commit & Pull Request Guidelines

Follow the history's Conventional Commit-style prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `style:`, or `chore:`. Use imperative summaries, e.g. `docs: add bilingual SSH tutorial`.

Describe PR changes, link relevant issues, and report build and manual checks. Include screenshots for visual changes and identify both translated posts when adding tutorials.
