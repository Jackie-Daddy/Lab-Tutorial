import { readdir, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const dist = path.join(root, '.vitepress/dist')
const sources = new Map()
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) await collect(file)
    else if (file.endsWith('.html')) {
      const html = await readFile(file, 'utf8')
      for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"<>]+)"/g)) {
        const url = new URL(href.replace(/&amp;/g, '&'))
        url.hash = ''
        if (!sources.has(url.href)) sources.set(url.href, new Set())
        sources.get(url.href).add(path.relative(dist, file))
      }
    }
  }
}
await collect(dist)
const queue = [...sources.keys()]
const results = []
async function verify(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Lab-Tutorial-Link-Check/1.0' } })
      await response.body?.cancel()
      const status = response.status
      if ((status >= 500 || status === 429) && attempt === 0) continue
      const state = response.ok ? 'ok' : [401, 403, 429].includes(status) || status >= 500 ? 'unverified' : 'broken'
      return { url, status, state, pages: [...sources.get(url)] }
    } catch (error) {
      if (attempt === 1) return { url, state: 'unverified', error: error.message, pages: [...sources.get(url)] }
    }
  }
}
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const url = queue.shift()
    const result = await verify(url)
    results.push(result)
    if (result.state !== 'ok') console.log(`${result.state.toUpperCase()} ${url} (${result.status || result.error})`)
  }
}))
const report = path.join(os.tmpdir(), 'lab-tutorial-links.json')
await writeFile(report, `${JSON.stringify(results.sort((a, b) => a.url.localeCompare(b.url)), null, 2)}\n`)
const broken = results.filter(result => result.state === 'broken').length
const unknown = results.filter(result => result.state === 'unverified').length
console.log(`Checked ${results.length} unique external links: ${results.length - broken - unknown} reachable, ${broken} broken, ${unknown} require manual verification. Report: ${report}`)
process.exitCode = broken ? 1 : unknown ? 2 : 0
