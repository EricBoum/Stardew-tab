import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(path.join(rootDir, 'src/libs/searchEngineRules.ts'), 'utf8')
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const rules = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`)

const createEngine = (id, overrides = {}) => ({
  id,
  name: id,
  searchUrl: `https://${id}.example/search?q=%s`,
  suggestionProvider: 'auto',
  iconSource: 'favicon',
  ...overrides,
})

describe('search engine rules', () => {
  it('keeps only the first 12 visible engines and preserves list order', () => {
    const input = Array.from({ length: 14 }, (_, index) => createEngine(`engine-${index + 1}`))

    const normalized = rules.normalizeVisibleSearchEngines(input, 12)

    assert.deepEqual(normalized.map(engine => engine.id), input.map(engine => engine.id))
    assert.deepEqual(
      rules.getVisibleSearchEngines(normalized).map(engine => engine.id),
      input.slice(0, 12).map(engine => engine.id),
    )
    assert.equal(normalized[12].hidden, true)
    assert.equal(normalized[13].hidden, true)
  })

  it('appends all missing presets but hides overflow when 12 engines are visible', () => {
    const existing = Array.from({ length: 12 }, (_, index) => createEngine(`existing-${index + 1}`))
    const presets = [ 'bing', 'duckduckgo', 'yahoo', 'yandex' ].map(createEngine)

    const merged = rules.mergeMissingSearchEnginePresets(existing, presets, 12)

    assert.equal(merged.length, 16)
    assert.deepEqual(merged.slice(0, 12), existing)
    assert.deepEqual(merged.slice(12).map(engine => engine.id), presets.map(engine => engine.id))
    assert.equal(merged.slice(12).every(engine => engine.hidden), true)
  })

  it('keeps newly seeded presets hidden by default', () => {
    const originalVisible = [ createEngine('default'), createEngine('baidu'), createEngine('google') ]
    const presets = [ 'bing', 'duckduckgo', 'yahoo', 'yandex' ].map(id => createEngine(id, { hidden: true }))

    const merged = rules.mergeMissingSearchEnginePresets(originalVisible, presets, 12)

    assert.deepEqual(rules.getVisibleSearchEngines(merged).map(engine => engine.id), [ 'default', 'baidu', 'google' ])
  })

  it('preserves existing preset configuration and only appends missing ids', () => {
    const existingBing = createEngine('bing', { name: 'My Bing', hidden: true })
    const presets = [ createEngine('bing'), createEngine('yahoo') ]

    const merged = rules.mergeMissingSearchEnginePresets([ existingBing ], presets, 12)

    assert.deepEqual(merged[0], existingBing)
    assert.deepEqual(merged.map(engine => engine.id), [ 'bing', 'yahoo' ])
  })

  it('falls back to the first visible engine when the selected engine is hidden', () => {
    const list = [
      createEngine('hidden', { hidden: true }),
      createEngine('first-visible'),
      createEngine('second-visible'),
    ]

    assert.equal(rules.resolveSelectedSearchEngineId(list, 'hidden'), 'first-visible')
  })

  it('restores one visible engine when malformed data has all engines hidden', () => {
    const normalized = rules.normalizeVisibleSearchEngines([
      createEngine('first', { hidden: true }),
      createEngine('second', { hidden: true }),
    ], 12)

    assert.deepEqual(rules.getVisibleSearchEngines(normalized).map(engine => engine.id), [ 'first' ])
  })

  it('treats a built-in logo as configured', () => {
    const engine = createEngine('bing', {
      iconSource: 'builtin',
      builtinLogoKey: 'Bing',
    })

    assert.equal(rules.hasConfiguredSearchEngineIcon(engine), true)
  })

  it('applies a preset icon only to an empty favicon configuration', () => {
    const preset = createEngine('bing', {
      iconSource: 'builtin',
      builtinLogoKey: 'Bing',
    })
    const empty = createEngine('bing', { logo: '', iconId: '' })

    const [ migrated ] = rules.applyPresetIconsToEmptyFaviconEngines([ empty ], [ preset ])

    assert.equal(migrated.iconSource, 'builtin')
    assert.equal(migrated.builtinLogoKey, 'Bing')
  })

  it('preserves uploaded and custom favicon icons during preset migration', () => {
    const preset = createEngine('bing', {
      iconSource: 'builtin',
      builtinLogoKey: 'Bing',
    })
    const uploaded = createEngine('bing', { iconSource: 'upload', iconId: 'blob-id' })
    const custom = createEngine('bing', { logo: 'https://icons.example/bing.png' })

    assert.deepEqual(
      rules.applyPresetIconsToEmptyFaviconEngines([ uploaded ], [ preset ]),
      [ uploaded ],
    )
    assert.deepEqual(
      rules.applyPresetIconsToEmptyFaviconEngines([ custom ], [ preset ]),
      [ custom ],
    )
  })
})
