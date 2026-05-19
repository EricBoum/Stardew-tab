import { access, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const API_ENDPOINT = 'https://stardewvalleywiki.com/mediawiki/api.php'
const OUTPUT_DIR = path.join(projectRoot, 'src/assets/image/icon-library')
const MANIFEST_PATH = path.join(projectRoot, 'src/libs/const/builtinIcons.ts')
const IMPORT_BASE = '@/assets/image/icon-library'
const DEFAULT_MAX_DIMENSION = 96
const DEFAULT_RECURSION_DEPTH = 2
const REQUEST_DELAY_MS = 120

const CATEGORY_CONFIGS = [
  { key: 'animal-products', label: 'Animal Products', title: 'Category:Animal product images', recursive: false },
  { key: 'artifacts', label: 'Artifacts', title: 'Category:Artifact images', recursive: false },
  { key: 'cooking', label: 'Cooking', title: 'Category:Cooking images', recursive: false },
  { key: 'crops', label: 'Crops', title: 'Category:Crop images', recursive: true },
  { key: 'fish', label: 'Fish', title: 'Category:Fish images', recursive: false },
  { key: 'forage', label: 'Forage', title: 'Category:Forage images', recursive: true },
  { key: 'minerals', label: 'Minerals', title: 'Category:Mineral images', recursive: false },
  { key: 'resources', label: 'Resources', title: 'Category:Resource images', recursive: true },
  { key: 'seeds', label: 'Seeds', title: 'Category:Seed images', recursive: false },
  { key: 'special-items', label: 'Special Items', title: 'Category:Special item images', recursive: false },
  { key: 'tools', label: 'Tools', title: 'Category:Tool images', recursive: false },
  { key: 'menu-icons', label: 'Menu Icons', title: 'Category:Menu icons', recursive: false }
]

const LANGUAGE_SUFFIXES = new Set([
  'br',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'fi',
  'fr',
  'hu',
  'it',
  'ja',
  'ko',
  'nl',
  'pl',
  'pt',
  'ru',
  'th',
  'tr',
  'uk',
  'vi',
  'zh'
])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const parseArgs = () => {
  const options = {
    clean: false,
    dryRun: false,
    limit: Number.POSITIVE_INFINITY,
    perCategoryLimit: Number.POSITIVE_INFINITY,
    maxDimension: DEFAULT_MAX_DIMENSION,
    recursionDepth: DEFAULT_RECURSION_DEPTH,
    categories: CATEGORY_CONFIGS
  }

  for (const arg of process.argv.slice(2)) {
    if (arg === '--clean') {
      options.clean = true
      continue
    }
    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }
    if (arg.startsWith('--limit=')) {
      options.limit = Number(arg.slice('--limit='.length))
      continue
    }
    if (arg.startsWith('--per-category-limit=')) {
      options.perCategoryLimit = Number(arg.slice('--per-category-limit='.length))
      continue
    }
    if (arg.startsWith('--max-dimension=')) {
      options.maxDimension = Number(arg.slice('--max-dimension='.length))
      continue
    }
    if (arg.startsWith('--recursion-depth=')) {
      options.recursionDepth = Number(arg.slice('--recursion-depth='.length))
      continue
    }
    if (arg.startsWith('--category=')) {
      const title = normalizeCategoryTitle(arg.slice('--category='.length))
      options.categories = [
        {
          key: slugify(title.replace(/^Category:/, '')),
          label: title.replace(/^Category:/, ''),
          title,
          recursive: true
        }
      ]
    }
  }

  if (!Number.isFinite(options.limit) || options.limit <= 0) {
    options.limit = Number.POSITIVE_INFINITY
  }
  if (!Number.isFinite(options.perCategoryLimit) || options.perCategoryLimit <= 0) {
    options.perCategoryLimit = Number.POSITIVE_INFINITY
  }
  if (!Number.isFinite(options.maxDimension) || options.maxDimension <= 0) {
    options.maxDimension = DEFAULT_MAX_DIMENSION
  }
  if (!Number.isFinite(options.recursionDepth) || options.recursionDepth < 0) {
    options.recursionDepth = DEFAULT_RECURSION_DEPTH
  }

  return options
}

const normalizeCategoryTitle = (title) => {
  const decoded = title.trim().replace(/_/g, ' ')
  return decoded.startsWith('Category:') ? decoded : `Category:${ decoded }`
}

const apiQuery = async (params) => {
  const searchParams = new URLSearchParams({
    format: 'json',
    formatversion: '2',
    ...params
  })

  await sleep(REQUEST_DELAY_MS)
  const response = await fetch(`${ API_ENDPOINT }?${ searchParams.toString() }`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'StardewTabIconFetcher/1.0 (non-commercial icon library build script)'
    }
  })

  if (!response.ok) {
    throw new Error(`MediaWiki API request failed: ${ response.status } ${ response.statusText }`)
  }

  return response.json()
}

const collectCategoryFiles = async (config, recursionDepth) => {
  const queue = [ { title: config.title, depth: 0 } ]
  const seenCategories = new Set()
  const files = []

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || seenCategories.has(current.title)) {
      continue
    }

    seenCategories.add(current.title)
    let cmcontinue

    do {
      const result = await apiQuery({
        action: 'query',
        list: 'categorymembers',
        cmtitle: current.title,
        cmtype: 'file|subcat',
        cmlimit: '500',
        ...(cmcontinue ? { cmcontinue } : {})
      })

      for (const member of result.query?.categorymembers ?? []) {
        if (member.ns === 6) {
          files.push({
            title: member.title,
            categoryKey: config.key,
            categoryLabel: config.label,
            sourceCategory: current.title
          })
        }

        if (member.ns === 14 && config.recursive && current.depth < recursionDepth) {
          queue.push({
            title: normalizeCategoryTitle(member.title),
            depth: current.depth + 1
          })
        }
      }

      cmcontinue = result.continue?.cmcontinue
    } while (cmcontinue)
  }

  return files
}

const getImageInfo = async (files) => {
  const result = []

  for (let index = 0; index < files.length; index += 50) {
    const batch = files.slice(index, index + 50)
    const data = await apiQuery({
      action: 'query',
      prop: 'imageinfo',
      titles: batch.map((file) => file.title).join('|'),
      iiprop: 'url|size|mime'
    })

    for (const page of data.query?.pages ?? []) {
      const source = batch.find((file) => file.title === page.title)
      const imageInfo = page.imageinfo?.[0]

      if (!source || !imageInfo) {
        continue
      }

      result.push({
        ...source,
        pageId: page.pageid,
        mime: imageInfo.mime,
        width: imageInfo.width,
        height: imageInfo.height,
        url: imageInfo.url,
        sourceUrl: imageInfo.descriptionurl
      })
    }
  }

  return result
}

const stripFilePrefix = (title) => title.replace(/^File:/, '')

const stripExtension = (name) => name.replace(/\.(png|gif|webp|jpg|jpeg)$/i, '')

const getExtension = (title, mime) => {
  const ext = path.extname(stripFilePrefix(title)).toLowerCase()
  if ([ '.png', '.gif', '.webp' ].includes(ext)) {
    return ext
  }
  if (mime === 'image/gif') {
    return '.gif'
  }
  if (mime === 'image/webp') {
    return '.webp'
  }
  return '.png'
}

const slugify = (input) => input
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase()

const isLikelyLocalizedFile = (title) => {
  const name = stripExtension(stripFilePrefix(title))
  const segments = name.split(/[\s_-]+/).filter(Boolean)
  const suffix = segments.at(-1)?.toLowerCase()
  return suffix ? LANGUAGE_SUFFIXES.has(suffix) && segments.length > 1 : false
}

const isSupportedIcon = (icon, maxDimension) => {
  if (!icon.mime || ![ 'image/png', 'image/gif', 'image/webp' ].includes(icon.mime)) {
    return false
  }
  if (!icon.width || !icon.height) {
    return false
  }
  if (icon.width > maxDimension || icon.height > maxDimension) {
    return false
  }
  if (icon.width < 8 || icon.height < 8) {
    return false
  }
  if (isLikelyLocalizedFile(icon.title)) {
    return false
  }
  return true
}

const pruneNumberedCropVariants = (icons) => {
  const latestByBase = new Map()

  for (const icon of icons) {
    if (icon.categoryKey !== 'crops') {
      continue
    }

    const name = stripExtension(stripFilePrefix(icon.title)).replace(/_/g, ' ')
    const match = name.match(/^(.*)-(\d+)$/)
    if (!match) {
      continue
    }

    const base = match[1]
    const order = Number(match[2])
    const current = latestByBase.get(base)
    if (!current || order > current.order) {
      latestByBase.set(base, { icon, order })
    }
  }

  return icons.filter((icon) => {
    if (icon.categoryKey !== 'crops') {
      return true
    }

    const name = stripExtension(stripFilePrefix(icon.title)).replace(/_/g, ' ')
    const match = name.match(/^(.*)-(\d+)$/)
    if (!match) {
      return true
    }

    return latestByBase.get(match[1])?.icon === icon
  })
}

const fileExists = async (filePath) => {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

const cleanOutputDir = async () => {
  await mkdir(OUTPUT_DIR, { recursive: true })
  const entries = await readdir(OUTPUT_DIR, { withFileTypes: true })

  await Promise.all(entries
    .filter((entry) => entry.isDirectory() || /\.(png|gif|webp)$/i.test(entry.name))
    .map((entry) => rm(path.join(OUTPUT_DIR, entry.name), { recursive: true, force: true })))
}

const normalizeIcons = (icons) => {
  const seenFilePaths = new Set()
  const seenKeys = new Set()

  return icons
    .map((icon) => {
      const rawName = stripExtension(stripFilePrefix(icon.title)).replace(/_/g, ' ')
      const baseSlug = slugify(rawName) || `icon-${ icon.pageId }`
      const categoryDir = icon.categoryKey
      let fileName = `${ baseSlug }${ getExtension(icon.title, icon.mime) }`
      let filePath = `${ categoryDir }/${ fileName }`
      let key = `stardew-${ baseSlug }`
      let duplicateIndex = 2

      while (seenFilePaths.has(filePath) || seenKeys.has(key)) {
        fileName = `${ baseSlug }-${ duplicateIndex }${ getExtension(icon.title, icon.mime) }`
        filePath = `${ categoryDir }/${ fileName }`
        key = `stardew-${ baseSlug }-${ duplicateIndex }`
        duplicateIndex += 1
      }

      seenFilePaths.add(filePath)
      seenKeys.add(key)

      return {
        key,
        name: rawName,
        category: icon.categoryKey,
        categoryLabel: icon.categoryLabel,
        fileName,
        filePath,
        sourceUrl: icon.sourceUrl,
        sourceCategory: icon.sourceCategory,
        downloadUrl: icon.url,
        width: icon.width,
        height: icon.height
      }
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
}

const applyIconLimits = (icons, { limit, perCategoryLimit }) => {
  const categoryCounts = new Map()
  const selected = []

  for (const icon of icons) {
    if (selected.length >= limit) {
      break
    }

    const count = categoryCounts.get(icon.categoryKey) ?? 0
    if (count >= perCategoryLimit) {
      continue
    }

    selected.push(icon)
    categoryCounts.set(icon.categoryKey, count + 1)
  }

  return selected
}

const downloadIcons = async (icons) => {
  await mkdir(OUTPUT_DIR, { recursive: true })

  for (const icon of icons) {
    const outputPath = path.join(OUTPUT_DIR, icon.filePath)
    await mkdir(path.dirname(outputPath), { recursive: true })

    if (await fileExists(outputPath)) {
      console.log(`skip ${ icon.filePath }`)
      continue
    }

    const response = await fetch(icon.downloadUrl, {
      headers: {
        'User-Agent': 'StardewTabIconFetcher/1.0 (non-commercial icon library build script)'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to download ${ icon.name }: ${ response.status } ${ response.statusText }`)
    }

    const bytes = Buffer.from(await response.arrayBuffer())
    await writeFile(outputPath, bytes)
    console.log(`saved ${ icon.filePath }`)
  }
}

const toImportName = (index) => `stardewIcon${ index }`

const generateManifest = async (icons) => {
  const categories = Array.from(new Map(
    icons.map((icon) => [ icon.category, { key: icon.category, label: icon.categoryLabel } ])
  ).values()).sort((a, b) => a.label.localeCompare(b.label))

  const imports = icons
    .map((icon, index) => `import ${ toImportName(index) } from '${ IMPORT_BASE }/${ icon.filePath }'`)
    .join('\n')

  const categoryRows = categories
    .map((category) => `  { key: '${ category.key }', label: '${ category.label }' }`)
    .join(',\n')

  const iconRows = icons
    .map((icon, index) => [
      '  {',
      `    key: '${ icon.key }',`,
      `    name: ${ JSON.stringify(icon.name) },`,
      `    category: '${ icon.category }',`,
      `    src: ${ toImportName(index) },`,
      `    sourceUrl: ${ JSON.stringify(icon.sourceUrl) },`,
      `    sourceCategory: ${ JSON.stringify(icon.sourceCategory) },`,
      `    width: ${ icon.width },`,
      `    height: ${ icon.height }`,
      '  }'
    ].join('\n'))
    .join(',\n')

  const content = `${ imports ? `${ imports }\n\n` : '' }export interface BuiltinIconCategory {
  key: string;
  label: string;
}

export interface BuiltinIcon {
  key: string;
  name: string;
  category: string;
  src: string;
  sourceUrl: string;
  sourceCategory: string;
  width: number;
  height: number;
}

export const BUILTIN_ICON_CATEGORIES: BuiltinIconCategory[] = [
${ categoryRows }
]

export const BUILTIN_ICONS: BuiltinIcon[] = [
${ iconRows }
]

export const BUILTIN_ICON_MAP = new Map(BUILTIN_ICONS.map((icon) => [ icon.key, icon ]))
`

  await writeFile(MANIFEST_PATH, content)
}

const main = async () => {
  const options = parseArgs()
  await mkdir(OUTPUT_DIR, { recursive: true })

  if (options.clean && !options.dryRun) {
    await cleanOutputDir()
  }

  const collected = []
  for (const category of options.categories) {
    console.log(`collect ${ category.title }`)
    collected.push(...await collectCategoryFiles(category, options.recursionDepth))
  }

  const dedupedFiles = Array.from(new Map(collected.map((file) => [ file.title, file ])).values())
  console.log(`found ${ dedupedFiles.length } candidate files`)

  const detailed = await getImageInfo(dedupedFiles)
  const icons = normalizeIcons(applyIconLimits(
    pruneNumberedCropVariants(detailed.filter((icon) => isSupportedIcon(icon, options.maxDimension))),
    options
  ))

  console.log(`selected ${ icons.length } icons`)

  if (options.dryRun) {
    for (const icon of icons.slice(0, 20)) {
      console.log(`${ icon.filePath } <- ${ icon.sourceUrl }`)
    }
    return
  }

  await downloadIcons(icons)
  await generateManifest(icons)
  console.log(`manifest ${ path.relative(projectRoot, MANIFEST_PATH) }`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
