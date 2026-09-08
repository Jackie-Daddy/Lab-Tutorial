import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import os from 'node:os'
import { createServer } from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const root = fileURLToPath(new URL('../', import.meta.url))
const catalog = JSON.parse(await readFile(path.join(root, 'diagrams/catalog.json'), 'utf8'))
const posts = [...new Set(Object.values(catalog).map(item => item.post))].sort()
const artifacts = path.join(os.tmpdir(), 'lab-tutorial-diagram-qa')
await mkdir(artifacts, { recursive: true })
let base = process.env.DIAGRAM_SITE_URL
let server
let browser
let cases = 0

try {
  if (!process.env.DIAGRAM_SITE_URL) {
    const port = await new Promise((resolve, reject) => {
      const probe = createServer()
      probe.on('error', reject)
      probe.listen(0, '127.0.0.1', () => {
        const port = probe.address().port
        probe.close(() => resolve(port))
      })
    })
    base = `http://127.0.0.1:${port}/Lab-Tutorial/`
    server = spawn(process.execPath, ['node_modules/vitepress/bin/vitepress.js', 'preview', '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] })
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Preview server did not start')), 15000)
      server.on('error', reject)
      server.on('exit', code => { clearTimeout(timeout); reject(new Error(`Preview server exited: ${code}`)) })
      server.stderr.on('data', data => process.stderr.write(data))
      server.stdout.on('data', data => {
        if (data.toString().includes('Built site served')) { clearTimeout(timeout); resolve() }
      })
    })
  }
  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (process.platform === 'darwin' && existsSync(macChrome) ? macChrome : undefined),
    headless: true,
    args: process.env.CI ? ['--no-sandbox'] : [],
  })
  for (const lang of ['zh', 'en']) {
    for (const width of [1440, 390]) {
      for (const theme of ['light', 'dark']) {
        const page = await browser.newPage()
        await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 })
        await page.evaluateOnNewDocument(value => {
          localStorage.setItem('vitepress-theme-appearance', value)
        }, theme)
        const errors = []
        page.on('pageerror', error => errors.push(error.message))
        page.on('console', message => {
          if (/hydration/i.test(message.text()) && ['error', 'warn'].includes(message.type())) errors.push(message.text())
        })
        for (const post of posts) {
          const response = await page.goto(new URL(`${lang}/posts/${post}`, base).href, { waitUntil: 'networkidle2' })
          assert([200, 304].includes(response.status()), `${lang}/${post}: page request failed (${response.status()})`)
          const expected = Object.values(catalog).filter(item => item.post === post).length
          await page.waitForFunction((count, expectedTheme) => {
            const images = [...document.querySelectorAll('.tutorial-diagram img')]
            return images.length === count && images.every(img => img.getAttribute('src').includes(`.${expectedTheme}.`))
          }, { timeout: 10000 }, expected, theme)
          for (const image of await page.$$('.tutorial-diagram img')) {
            await image.evaluate(async img => {
              img.scrollIntoView({ block: 'center' })
              await img.decode()
            })
          }
          const state = await page.evaluate(() => ({
            dark: document.documentElement.classList.contains('dark'),
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            clippedDiagrams: [...document.querySelectorAll('.tutorial-diagram-scroll')].some(el => el.scrollWidth > el.clientWidth + 1),
            backgrounds: [...document.querySelectorAll('.tutorial-diagram')].map(figure => getComputedStyle(figure).backgroundColor),
            images: [...document.querySelectorAll('.tutorial-diagram img')].map(img => ({
              src: img.getAttribute('src'), href: img.closest('a').getAttribute('href'),
              alt: img.alt, loaded: img.complete && img.naturalWidth > 0,
            })),
          }))
          assert.equal(state.dark, theme === 'dark', `${lang}/${post}: saved theme was not applied`)
          assert(!state.overflow, `${lang}/${post}: page overflows viewport at ${width}px`)
          assert(!state.clippedDiagrams, `${lang}/${post}: diagram preview is clipped`)
          assert(state.backgrounds.every(value => value === (theme === 'dark' ? 'rgb(30, 29, 28)' : 'rgb(250, 249, 245)')), `${lang}/${post}: figure background does not match the theme`)
          assert(state.images.every(img => img.loaded && img.alt && img.src.includes(`/diagrams/${lang}/`) && img.href === img.src), `${lang}/${post}: invalid image or full-size link`)
          if (['how-to-use-tmux', 'claude-code-guide'].includes(post)) {
            const figure = await page.$('.tutorial-diagram')
            const screenshotPath = path.join(artifacts, `${lang}-${post}-${width}-${theme}.png`)
            if (width < 600) {
              await figure.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 120))
              await page.screenshot({ path: screenshotPath })
            } else {
              await figure.screenshot({ path: screenshotPath })
            }
          }
          if (width === 1440) {
            const otherTheme = theme === 'dark' ? 'light' : 'dark'
            await page.click('.VPNavBarAppearance .VPSwitchAppearance')
            await page.waitForFunction(value => [...document.querySelectorAll('.tutorial-diagram img')]
              .every(img => img.getAttribute('src').includes(`.${value}.`) && img.closest('a').getAttribute('href') === img.getAttribute('src')),
            { timeout: 10000 }, otherTheme)
          }
          assert.equal(errors.length, 0, errors.join('\n'))
          cases++
          console.log(`Page OK: ${lang}/${post}, ${width}px, initial ${theme}`)
        }
        await page.close()
      }
    }
  }
  console.log(`Verified ${cases} page/theme/viewport combinations. Screenshots: ${artifacts}`)
} finally {
  await browser?.close()
  server?.kill('SIGTERM')
}
