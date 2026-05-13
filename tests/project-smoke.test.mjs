import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const readJson = (relativePath) => {
  return JSON.parse(readFileSync(path.join(rootDir, relativePath), 'utf8'))
}

const flattenKeys = (value, prefix = '') => {
  return Object.entries(value).flatMap(([key, child]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      return flattenKeys(child, nextPrefix)
    }
    return nextPrefix
  })
}

const listJsonFiles = (relativeDir) => {
  return readdirSync(path.join(rootDir, relativeDir))
    .filter((file) => file.endsWith('.json'))
    .sort()
}

const compareKeySets = (baseKeys, candidateKeys) => {
  return {
    missing: [...baseKeys].filter((key) => !candidateKeys.has(key)),
    extra: [...candidateKeys].filter((key) => !baseKeys.has(key)),
  }
}

describe('project smoke checks', () => {
  it('keeps app locale message keys aligned with English', () => {
    const localeDir = 'src/locales'
    const localeFiles = listJsonFiles(localeDir)
    const baseKeys = new Set(flattenKeys(readJson(`${localeDir}/en.json`)))

    for (const file of localeFiles) {
      const candidateKeys = new Set(flattenKeys(readJson(`${localeDir}/${file}`)))
      const diff = compareKeySets(baseKeys, candidateKeys)

      assert.deepEqual(diff, { missing: [], extra: [] }, `${file} should match en.json keys`)
    }
  })

  it('keeps extension locale message keys aligned with English', () => {
    const localeRoot = path.join(rootDir, 'public/_locales')
    const localeDirs = readdirSync(localeRoot).sort()
    const baseKeys = new Set(Object.keys(readJson('public/_locales/en/messages.json')))

    for (const dir of localeDirs) {
      const relativeFile = `public/_locales/${dir}/messages.json`
      const candidate = readJson(relativeFile)
      const candidateKeys = new Set(Object.keys(candidate))
      const diff = compareKeySets(baseKeys, candidateKeys)

      assert.deepEqual(diff, { missing: [], extra: [] }, `${relativeFile} should match English message keys`)

      for (const [key, value] of Object.entries(candidate)) {
        assert.equal(typeof value.message, 'string', `${relativeFile}:${key} should have a message string`)
        assert.notEqual(value.message.trim(), '', `${relativeFile}:${key} should not be empty`)
      }
    }
  })

  it('has public manifest files required by the extension entry points', () => {
    const manifest = readJson('public/manifest.json')
    const publicFiles = [
      ...Object.values(manifest.icons ?? {}),
      manifest.action?.default_icon,
      `_locales/${manifest.default_locale}/messages.json`,
    ].filter(Boolean)
    const sourceEntryFiles = [
      manifest.action?.default_popup,
      manifest.chrome_url_overrides?.newtab,
    ].filter(Boolean)

    for (const file of publicFiles) {
      assert.equal(existsSync(path.join(rootDir, 'public', file)), true, `public/${file} should exist`)
    }
    for (const file of sourceEntryFiles) {
      assert.equal(existsSync(path.join(rootDir, file)), true, `${file} should exist`)
    }
  })

  it('has built manifest files required by the extension entry points', () => {
    const manifest = readJson('dist/manifest.json')
    const referencedFiles = [
      ...Object.values(manifest.icons ?? {}),
      manifest.action?.default_icon,
      manifest.action?.default_popup,
      manifest.chrome_url_overrides?.newtab,
      `_locales/${manifest.default_locale}/messages.json`,
    ].filter(Boolean)

    for (const file of referencedFiles) {
      assert.equal(existsSync(path.join(rootDir, 'dist', file)), true, `dist/${file} should exist`)
    }
  })
})
