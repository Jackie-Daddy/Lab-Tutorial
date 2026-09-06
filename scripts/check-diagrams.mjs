import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { PNG } from 'pngjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const catalog = JSON.parse(await readFile(path.join(root, 'diagrams/catalog.json'), 'utf8'))
const names = Object.keys(catalog).sort()
const manifest = JSON.parse(await readFile(path.join(root, '.vitepress/theme/diagrams.generated.json'), 'utf8'))
let placements = 0

for (const lang of ['zh', 'en']) {
  const sourceNames = (await readdir(path.join(root, 'diagrams', lang)))
    .filter(name => name.endsWith('.mmd')).map(name => name.slice(0, -4)).sort()
  assert.deepEqual(sourceNames, names, `${lang}: diagram sources must match the catalog`)
  assert.deepEqual(Object.keys(manifest[lang]).sort(), names, `${lang}: manifest must match the catalog`)
  const references = []
  for (const file of await readdir(path.join(root, lang, 'posts'))) {
    if (!file.endsWith('.md')) continue
    const text = await readFile(path.join(root, lang, 'posts', file), 'utf8')
    assert(!/!\[[^\]]*\]\([^)]*\/images\//.test(text), `${lang}/${file}: legacy tutorial image remains`)
    for (const [, name] of text.matchAll(/<TutorialDiagram\s+name="([a-z0-9-]+)"\s*\/>/g)) {
      assert.equal(catalog[name]?.post, file.slice(0, -3), `${lang}/${file}: unexpected diagram ${name}`)
      references.push(name)
    }
  }
  assert.deepEqual(references.sort(), names, `${lang}: every diagram needs exactly one article placement`)
  placements += references.length
  for (const name of names) {
    const source = await readFile(path.join(root, 'diagrams', lang, `${name}.mmd`), 'utf8')
    const entry = manifest[lang][name]
    assert.equal(entry.sourceHash, createHash('sha256').update(source).digest('hex'), `${lang}/${name}: source changed; run npm run diagrams`)
    assert(source.includes(`accTitle: ${entry.title}`), `${lang}/${name}: stale title`)
    assert(source.includes(`accDescr: ${entry.description}`), `${lang}/${name}: stale description`)
    assert(entry.title && entry.description, `${lang}/${name}: missing accessible text`)
    for (const theme of ['light', 'dark']) {
      const asset = entry[theme]
      assert.match(asset.url, new RegExp(`^/images/diagrams/${lang}/${name}\\.${theme}\\.[a-f0-9]{12}\\.png$`))
      const data = await readFile(path.join(root, 'public', asset.url))
      const png = PNG.sync.read(data, { checkCRC: true })
      assert.equal(png.width, asset.width * 2, `${asset.url}: unexpected width`)
      assert.equal(png.height, asset.height * 2, `${asset.url}: unexpected height`)
      assert(asset.width > 0 && asset.height > 0, `${asset.url}: empty image`)
    }
  }
}
console.log(`Verified ${names.length} diagram subjects, ${placements} localized placements, and ${placements * 2} PNGs.`)
