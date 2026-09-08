# Tutorial Site Improvements Implementation Plan

**Goal:** Apply the approved usability and reliability improvements, then publish the verified site through the existing GitHub Pages workflow.

**Architecture:** Keep VitePress and the bilingual Markdown structure. Share post metadata between the homepage and article navigation, use a native dialog for diagram previews, and generate discoverability metadata at build time.

**Tech Stack:** Vue 3, VitePress 1.6, Node.js 20, native Node assertions and Puppeteer.

**Spec:** The user-approved seven priorities from this task: content and links, discovery, diagram reading, article navigation, bilingual accessibility, SEO, then measured performance.

## Constraints

- Preserve the warm theme, current article titles/dates, `/Lab-Tutorial/` base and paired translations.
- Keep generated diagrams and build output out of commits.
- Do not claim commands were executed when only checked against official documentation.
- Use the existing GitHub deployment; the user has authorized push and publication.

## Ordered implementation

- [x] **1. Content and links:** Audit all nine translated tutorial pairs, correct command/config errors, add localized `reviewed` and `scope` metadata. Enable internal dead-link errors. Add a manual external-link checker that reports unreachable URLs separately from HTTP failures.
- [x] **2. Discovery:** Extend `PostList.vue` with three category filters, a text search, clickable tags, a result count and an empty state. Persist filters in URL queries. Provide a compact beginner path and preserve SSR article links.
- [x] **3. Diagrams:** Remove the forced minimum width in `TutorialDiagram.vue`; show a complete image preview. Open a native modal dialog with zoom controls, original-image link, Escape handling, focus return and background scroll restoration.
- [x] **4. Navigation:** Add `PostFooter.vue` using the existing language loaders and `PostNav.vue`. Show available previous/next articles, three related posts, documentation review metadata and a GitHub correction link.
- [x] **5. Bilingual accessibility:** Increase muted-text contrast, define Chinese font fallbacks, localize search, add `/zh/about` and `/en/about`, preserve the old `/about` entry. Keep visible keyboard focus and reduced-motion behavior.
- [x] **6. SEO:** Generate canonical, paired language alternatives, Open Graph/Twitter metadata, Article JSON-LD and sitemap. Produce a local 1200×630 share card and sensible homepage heading/description.
- [x] **7. Performance:** Keep font families while serving their font files locally. Verify font requests stay on the site origin and inspect generated asset sizes; retain lazy loading and image dimensions. Preserve the current PNG pipeline unless loading measurements justify an additional encoder dependency.
- **8. Release procedure:** Run `npm run build`, all diagram/browser checks, external link checks and independent review. Inspect desktop/mobile screenshots in both themes. Commit, push `main`, wait for both Actions and Pages, and check live pages/assets.

## Regression checks

Create `scripts/check-site.mjs` before implementation and run it against the existing build to confirm missing behavior: filters must change visible articles and survive reload; no-results must recover after reset; diagrams must fit and close their zoom dialog with Escape; related/navigation links must stay in the current locale; About/search must be localized; canonical/alternate/Article metadata and sitemap must point to valid base-prefixed routes. Keep the existing all-article image checks and extend them for preview width.

Run with Node.js 20: `npm run build`, `npm run check:site`, `npm run check:pages`, and `npm run check:links`. Browser checks require Chrome and local listening permission in this environment.

## Local verification

- Node.js 20 production build and internal-link validation passed.
- All 31 diagram subjects, 62 localized placements, and 124 PNGs passed checks.
- All 72 article/theme/viewport combinations passed the browser checks.
- The 13 site checks passed, including repeat same-page navigation and correct remote-development classification.
- All 85 unique external links were reachable.
- All 18 articles have documentation-review metadata; 86 Bash/JSON examples passed syntax checks.
- Final desktop/mobile screenshots, review dates, and client-navigation metadata passed inspection. All measured font requests were served locally (149 KiB across four font files; no external font requests).
