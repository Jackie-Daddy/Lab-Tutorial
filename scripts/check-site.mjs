import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { createServer } from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const root = fileURLToPath(new URL('../', import.meta.url))
const artifacts = path.join(os.tmpdir(), 'lab-tutorial-site-qa')
await mkdir(artifacts, { recursive: true })
let base = process.env.SITE_URL
let server
let browser
const failures = []

async function check(name, run) {
  try {
    await run()
    console.log(`PASS ${name}`)
  } catch (error) {
    failures.push(`${name}: ${error.message}`)
    console.error(`FAIL ${name}: ${error.message}`)
  }
}

try {
  if (!base) {
    const port = await new Promise(resolve => {
      const probe = createServer()
      probe.listen(0, '127.0.0.1', () => {
        const port = probe.address().port
        probe.close(() => resolve(port))
      })
    })
    base = `http://127.0.0.1:${port}/Lab-Tutorial/`
    server = spawn(process.execPath, ['node_modules/vitepress/bin/vitepress.js', 'preview', '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] })
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Preview startup timeout')), 15000)
      server.once('error', reject)
      server.stdout.on('data', data => {
        if (data.toString().includes('Built site served')) { clearTimeout(timeout); resolve() }
      })
    })
  }
  const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (existsSync(chrome) ? chrome : undefined),
    headless: true,
    args: process.env.CI ? ['--no-sandbox'] : [],
  })
  for (const lang of ['zh', 'en']) {
    for (const width of [1440, 390]) {
      const page = await browser.newPage()
      await page.setViewport({ width, height: 1000 })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => {
        if (/hydration/i.test(message.text()) && ['error', 'warn'].includes(message.type())) errors.push(message.text())
      })
      const home = new URL(`${lang}/`, base).href
      await check(`${lang} ${width}: filters, URL state, empty state`, async () => {
        await page.goto(home, { waitUntil: 'networkidle2' })
        const total = await page.$$eval('.post-card', els => els.length)
        assert(total > 3)
        assert(await page.$('[data-category="ai"]'), 'Category control is missing')
        await page.click('[data-category="remote"]')
        await page.waitForFunction(() => document.querySelectorAll('.post-card').length < 9)
        assert(await page.$('.post-card a[href$="/remote-debug"]'), 'Remote debugging is misclassified')
        assert(await page.$('.post-card a[href$="/intranet-proxy"]'))
        await page.click('[data-category="ai"]')
        await page.waitForFunction(() => [...document.querySelectorAll('.post-card-title')].every(el => !el.textContent.includes('Zellij')))
        assert(await page.$('.post-card a[href$="/herdr-guide"]'))
        assert(!(await page.$('.post-card a[href$="/remote-debug"]')))
        await page.click('.post-card button[data-tag="herdr"]')
        await page.waitForFunction(() => document.querySelectorAll('.post-card').length === 1)
        assert(new URL(page.url()).searchParams.get('tag') === 'herdr')
        await page.reload({ waitUntil: 'networkidle2' })
        await page.waitForFunction(() => document.querySelectorAll('.post-card').length === 1)
        await page.click('.VPNavBarTitle a')
        await page.waitForFunction(() => !location.search)
        await page.waitForFunction(count => document.querySelectorAll('.post-card').length === count, { timeout: 3000 }, total)
        await page.click('[data-category="ai"]')
        await page.click('.post-card button[data-tag="herdr"]')
        await page.waitForFunction(() => document.querySelectorAll('.post-card').length === 1)
        await page.click('.VPNavBarTitle a')
        await page.waitForFunction(count => document.querySelectorAll('.post-card').length === count, { timeout: 3000 }, total)
        await page.click('[data-category="ai"]')
        await page.click('[data-action="reset-filters"]')
        await page.waitForFunction(count => document.querySelectorAll('.post-card').length === count, {}, total)
        await page.type('.post-filter-search', 'nonexistent-tutorial-xyz')
        await page.waitForFunction(() => document.querySelectorAll('.post-card').length === 0)
        assert(await page.$('.post-empty'))
        await page.click('[data-action="reset-filters"]')
        await page.waitForFunction(count => document.querySelectorAll('.post-card').length === count, {}, total)
        await page.screenshot({ path: path.join(artifacts, `${lang}-home-${width}.png`) })
      })
      await check(`${lang} ${width}: diagram preview, zoom, keyboard dismissal`, async () => {
        await page.goto(new URL(`${lang}/posts/herdr-guide`, base).href, { waitUntil: 'networkidle2' })
        const scrollers = await page.$$eval('.tutorial-diagram-scroll', els => els.map(el => [el.clientWidth, el.scrollWidth]))
        assert(scrollers.length === 3)
        assert(scrollers.every(([box, content]) => content <= box + 1), 'Preview forces horizontal scrolling')
        const trigger = await page.$('.tutorial-diagram a')
        await trigger.click()
        await page.waitForSelector('dialog[open]', { timeout: 3000 })
        const before = await page.$eval('dialog[open] img', img => img.getBoundingClientRect().width)
        await page.click('dialog[open] [data-action="zoom-in"]')
        const after = await page.$eval('dialog[open] img', img => img.getBoundingClientRect().width)
        assert(after > before, 'Zoom control did not enlarge the image')
        await page.keyboard.press('Escape')
        await page.waitForFunction(() => !document.querySelector('dialog[open]'))
        assert(await trigger.evaluate(el => el === document.activeElement), 'Focus did not return to preview')
        assert(await page.evaluate(() => document.body.style.overflow !== 'hidden'))
        await page.screenshot({ path: path.join(artifacts, `${lang}-diagram-${width}.png`) })
      })
      await check(`${lang} ${width}: article navigation and localized about`, async () => {
        await page.goto(new URL(`${lang}/posts/herdr-guide`, base).href, { waitUntil: 'networkidle2' })
        const links = await page.$$eval('.post-nav a, .related-posts a', els => els.map(el => el.getAttribute('href')))
        assert(links.length >= 3, 'Article continuation links are missing')
        assert(links.every(href => href.startsWith(`/Lab-Tutorial/${lang}/posts/`) && !href.endsWith('/herdr-guide')))
        const first = await page.$('.post-nav a')
        await first.click()
        await page.waitForFunction(() => !location.pathname.endsWith('/herdr-guide'))
        assert((await page.$eval('h1', el => el.textContent)).trim())
        const response = await page.goto(new URL(`${lang}/about`, base).href, { waitUntil: 'networkidle2' })
        assert([200, 304].includes(response.status()))
        const body = await page.$eval('main', el => el.textContent)
        assert(lang === 'en' ? body.includes('Contributing') : body.includes('贡献指南'))
        assert.equal(await page.$eval('html', el => el.lang), lang === 'zh' ? 'zh-CN' : 'en-US')
      })
      assert.equal(errors.length, 0, errors.join('\n'))
      await page.close()
    }
  }
  const page = await browser.newPage()
  await check('canonical, translations, article metadata and sitemap', async () => {
    await page.goto(new URL('zh/posts/herdr-guide', base).href, { waitUntil: 'networkidle2' })
    assert.equal(await page.$eval('link[rel="canonical"]', el => el.href), 'https://dual-pointers.github.io/Lab-Tutorial/zh/posts/herdr-guide')
    assert.equal(await page.$eval('link[hreflang="en"]', el => el.href), 'https://dual-pointers.github.io/Lab-Tutorial/en/posts/herdr-guide')
    const article = await page.$eval('script[type="application/ld+json"]', el => JSON.parse(el.textContent))
    assert.equal(article['@type'], 'TechArticle')
    assert(article.headline.includes('Herdr'))
    const image = await page.$eval('meta[property="og:image"]', el => el.content)
    const imageResponse = await page.goto(new URL(image.replace('https://dual-pointers.github.io/Lab-Tutorial/', ''), base).href)
    assert.equal(imageResponse.status(), 200)
    const response = await page.goto(new URL('sitemap.xml', base).href)
    assert.equal(response.status(), 200)
    const xml = await response.text()
    assert(xml.includes('/Lab-Tutorial/zh/posts/herdr-guide'))
    assert(xml.includes('/Lab-Tutorial/en/about'))
    assert(!xml.includes('/Lab-Tutorial/Lab-Tutorial/'))
  })
  await page.close()
  assert.equal(failures.length, 0, failures.join('\n'))
  console.log(`Site checks passed. Screenshots: ${artifacts}`)
} finally {
  await browser?.close()
  server?.kill('SIGTERM')
}
