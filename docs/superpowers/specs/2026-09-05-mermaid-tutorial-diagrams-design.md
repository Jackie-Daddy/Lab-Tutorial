# Mermaid tutorial diagrams

Replace all 28 tutorial illustrations in the 16 Chinese and English posts with Mermaid-authored equivalents. Preserve the explanatory purpose of each illustration and the article text. Keep the site logo and non-tutorial assets.

Store matching source names in `diagrams/zh/` and `diagrams/en/`. Each source includes Mermaid accessibility title and description. Use compact flowcharts, short wrapped labels, and the existing cream, charcoal, orange, blue, and green palette.

A Node build script uses the official Mermaid CLI API and a bundled Chinese font to generate two-times-resolution PNGs in light and dark variants. Generated assets and metadata are ignored by Git and rebuilt before development and production builds. Cache by source and renderer configuration to make repeat local builds fast.

A shared Vue component displays the matching locale and current site theme, reserves the correct image dimensions, provides a caption and alternative description, and allows contained horizontal scrolling on narrow screens and opening the full-resolution image.

Validation covers one-to-one migration of all existing references, locale parity, successful rendering of every source, image dimensions and files, no legacy tutorial SVG references, production build, browser review in both themes and locales, and mobile overflow. Publish by pushing verified changes to `main`, inspect the matching GitHub Actions run, and verify the deployed HTML and assets.

The user approved Mermaid, generated PNGs, the full migration, GitHub push, and deployment follow-through in the current conversation.
