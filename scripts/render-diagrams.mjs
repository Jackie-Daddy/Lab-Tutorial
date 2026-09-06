import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import { renderMermaid } from '@mermaid-js/mermaid-cli'
import { PNG } from 'pngjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = path.join(root, 'public/images/diagrams')
const manifestPath = path.join(root, '.vitepress/theme/diagrams.generated.json')
const catalog = JSON.parse(await readFile(path.join(root, 'diagrams/catalog.json'), 'utf8'))
const names = Object.keys(catalog).sort()
const fontRoot = path.join(root, 'node_modules/@fontsource/noto-sans-sc/files')
const fontData = await Promise.all(['chinese-simplified', 'latin'].map(async subset => ({
  data: (await readFile(path.join(fontRoot, `noto-sans-sc-${subset}-400-normal.woff2`))).toString('base64'),
  unicodeRange: subset === 'latin' ? 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' : 'U+0000-10FFFF',
})))

const palettes = {
  light: { background: '#faf9f5', text: '#292724', node: '#fff2e6', border: '#d97757', line: '#827970', cluster: '#f1eee7', clusterBorder: '#d9d2c6' },
  dark: { background: '#1e1d1c', text: '#f4eee5', node: '#3c3028', border: '#e08565', line: '#b5a99b', cluster: '#292725', clusterBorder: '#5c554e' },
}
const sharedConfig = {
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'base',
  fontFamily: 'Diagram Sans',
  deterministicIds: true,
  flowchart: {
    htmlLabels: true, useMaxWidth: false, nodeSpacing: 28, rankSpacing: 38,
    padding: 16, diagramPadding: 24, wrappingWidth: 250, curve: 'linear',
    subGraphTitleMargin: { top: 12, bottom: 20 },
  },
}

// Invalidate local image caches when sources, configuration, fonts, dependencies,
// or this renderer change. Hashed URLs also prevent stale images after deployment.
const rendererHash = createHash('sha256')
  .update(await readFile(fileURLToPath(import.meta.url)))
  .update(await readFile(path.join(root, 'package-lock.json')))
  .update(JSON.stringify(fontData)).digest('hex')
let browser
const manifest = { zh: {}, en: {} }
const expected = new Set()
let rendered = 0
let cached = 0

async function getRenderer() {
  if (!browser) {
    const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH ||
      (process.platform === 'darwin' && existsSync(macChrome) ? macChrome : undefined)
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: process.env.CI ? ['--no-sandbox'] : [],
    })
  }
  // The CLI creates its own pages. Register font faces before navigation so its
  // document.fonts loading barrier waits for our bundled fonts before layout.
  return {
    async newPage() {
      const page = await browser.newPage()
      await page.evaluateOnNewDocument(fonts => {
        for (const font of fonts) {
          document.fonts.add(new FontFace('Diagram Sans', `url(data:font/woff2;base64,${font.data})`, {
            weight: '400', style: 'normal', unicodeRange: font.unicodeRange,
          }))
        }
      }, fontData)
      return page
    },
  }
}

try {
  for (const lang of ['zh', 'en']) {
    await mkdir(path.join(output, lang), { recursive: true })
    for (const name of names) {
      const source = await readFile(path.join(root, 'diagrams', lang, `${name}.mmd`), 'utf8')
      const title = source.match(/^\s*accTitle:\s*(.+)$/m)?.[1]?.trim()
      const description = source.match(/^\s*accDescr:\s*(.+)$/m)?.[1]?.trim()
      if (!title || !description) throw new Error(`${lang}/${name}: accTitle and accDescr are required`)
      const entry = { title, description, sourceHash: createHash('sha256').update(source).digest('hex') }
      for (const [theme, palette] of Object.entries(palettes)) {
        const hash = createHash('sha256').update(rendererHash).update(source).update(theme).digest('hex').slice(0, 12)
        const filename = `${name}.${theme}.${hash}.png`
        const destination = path.join(output, lang, filename)
        expected.add(destination)
        let png
        if (existsSync(destination) && !process.argv.includes('--force')) {
          try {
            png = PNG.sync.read(await readFile(destination), { checkCRC: true })
            cached++
          } catch {
            console.warn(`Regenerating damaged PNG: ${lang}/${filename}`)
          }
        }
        if (!png) {
          const renderer = await getRenderer()
          const { data } = await renderMermaid(renderer, source, 'png', {
            viewport: { width: 1200, height: 900, deviceScaleFactor: 2 },
            backgroundColor: palette.background,
            mermaidConfig: {
              ...sharedConfig,
              deterministicIDSeed: `${lang}-${name}-${theme}`,
              themeVariables: {
                fontFamily: 'Diagram Sans', fontSize: '20px', darkMode: theme === 'dark',
                background: palette.background, primaryColor: palette.node,
                primaryTextColor: palette.text, primaryBorderColor: palette.border,
                lineColor: palette.line, textColor: palette.text,
                secondaryColor: palette.cluster, tertiaryColor: palette.cluster,
                clusterBkg: palette.cluster, clusterBorder: palette.clusterBorder,
                edgeLabelBackground: palette.background,
              },
            },
          })
          png = PNG.sync.read(Buffer.from(data), { checkCRC: true })
          const temporary = `${destination}.tmp`
          await writeFile(temporary, data)
          await rename(temporary, destination)
          rendered++
        }
        entry[theme] = {
          url: `/images/diagrams/${lang}/${filename}`,
          width: png.width / 2,
          height: png.height / 2,
        }
      }
      manifest[lang][name] = entry
      console.log(`Diagram ${lang}/${name}`)
    }
  }
  await writeFile(`${manifestPath}.tmp`, `${JSON.stringify(manifest, null, 2)}\n`)
  await rename(`${manifestPath}.tmp`, manifestPath)
  // Only clean generated images after the complete render has succeeded.
  for (const lang of ['zh', 'en']) {
    for (const filename of await readdir(path.join(output, lang))) {
      const file = path.join(output, lang, filename)
      if (filename.endsWith('.png') && !expected.has(file)) await unlink(file)
    }
  }
  console.log(`Diagrams ready: ${rendered} rendered, ${cached} cached.`)
} finally {
  await browser?.close()
}
