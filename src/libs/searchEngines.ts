import { useStorage } from '@/libs/storage'
import {
  BUILTIN_ENGINE_LOGO_MAP,
  ADDITIONAL_SEARCH_ENGINES,
  LEGACY_ENGINE_KEY,
  SEARCH_ENGINE_LIST_KEY,
  SEARCH_ENGINE_SELECTED_ID_KEY,
  SEED_SEARCH_ENGINES,
  MAX_VISIBLE_SEARCH_ENGINE_NUM,
  type SEARCH_ITEM
} from '@/libs/const'
import type { SearchEngine } from '@/libs/const/type'
import {
  applyPresetIconsToEmptyFaviconEngines,
  mergeMissingSearchEnginePresets,
  normalizeVisibleSearchEngines,
  resolveSelectedSearchEngineId
} from '@/libs/searchEngineRules'

const { getStorage, setStorage } = useStorage()

const SEARCH_ENGINE_PRESET_VERSION_KEY = 'SEARCH_ENGINE_PRESET_VERSION'
const CURRENT_SEARCH_ENGINE_PRESET_VERSION = 3

const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data)) as T

const cloneSeedEngines = (): SearchEngine[] => clone(SEED_SEARCH_ENGINES)

// 旧版把选中的引擎整个对象存进 'engine'（含 name Default/Baidu/Google），迁移时按 name 映射到种子 id
const mapLegacyEngineToId = (legacy?: SEARCH_ITEM): string => {
  const seed = SEED_SEARCH_ENGINES.find(item => item.name === legacy?.name)
  return seed?.id ?? SEED_SEARCH_ENGINES[0].id
}

// 确保 Default（受保护项）始终存在且置顶，避免用户误删或旧数据缺失
const ensureProtectedEngine = (list: SearchEngine[]): SearchEngine[] => {
  const defaultSeed = SEED_SEARCH_ENGINES.find(item => item.protected)
  if (!defaultSeed) {
    return list
  }
  const existing = list.find(item => item.id === defaultSeed.id)
  if (existing) {
    // 强制回填不可变更的关键字段，防止被写坏
    existing.protected = true
    existing.kind = 'chromeSearch'
    existing.isBuiltin = true
    return list
  }
  return [ clone(defaultSeed), ...list ]
}

export const normalizeSearchEngineList = (list: SearchEngine[]): SearchEngine[] => {
  const protectedList = ensureProtectedEngine(clone(list))
  return normalizeVisibleSearchEngines(protectedList, MAX_VISIBLE_SEARCH_ENGINE_NUM)
}

// 读取引擎列表：首次运行时种子写入并迁移旧选中项
export const getSearchEngines = async (): Promise<SearchEngine[]> => {
  const stored = await getStorage<SearchEngine[]>(SEARCH_ENGINE_LIST_KEY)

  if (Array.isArray(stored) && stored.length) {
    const presetVersion = await getStorage<number>(SEARCH_ENGINE_PRESET_VERSION_KEY)
    const shouldMigratePresets = (presetVersion ?? 0) < CURRENT_SEARCH_ENGINE_PRESET_VERSION
    const protectedStored = ensureProtectedEngine(clone(stored))
    const migrated = shouldMigratePresets
      ? applyPresetIconsToEmptyFaviconEngines(
          mergeMissingSearchEnginePresets(
            protectedStored,
            ADDITIONAL_SEARCH_ENGINES,
            MAX_VISIBLE_SEARCH_ENGINE_NUM
          ),
          ADDITIONAL_SEARCH_ENGINES
        )
      : protectedStored
    const normalized = normalizeSearchEngineList(migrated)
    if (shouldMigratePresets || JSON.stringify(normalized) !== JSON.stringify(stored)) {
      await setStorage(SEARCH_ENGINE_LIST_KEY, normalized)
    }
    if (shouldMigratePresets) {
      await setStorage(SEARCH_ENGINE_PRESET_VERSION_KEY, CURRENT_SEARCH_ENGINE_PRESET_VERSION)
    }
    return normalized
  }

  // 首次运行：种子写入
  const seeds = normalizeSearchEngineList(cloneSeedEngines())
  await setStorage(SEARCH_ENGINE_LIST_KEY, seeds)
  await setStorage(SEARCH_ENGINE_PRESET_VERSION_KEY, CURRENT_SEARCH_ENGINE_PRESET_VERSION)

  // 迁移旧的选中引擎
  const legacy = await getStorage<SEARCH_ITEM>(LEGACY_ENGINE_KEY)
  const selectedId = legacy ? mapLegacyEngineToId(legacy) : seeds[0].id
  await setStorage(SEARCH_ENGINE_SELECTED_ID_KEY, selectedId)

  return seeds
}

export const saveSearchEngines = async (list: SearchEngine[]): Promise<void> => {
  await setStorage(SEARCH_ENGINE_LIST_KEY, normalizeSearchEngineList(list))
}

// 读取选中引擎 id，若已失效则回退到列表首项
export const getSelectedEngineId = async (list: SearchEngine[]): Promise<string> => {
  const storedId = await getStorage<string>(SEARCH_ENGINE_SELECTED_ID_KEY)
  const fallbackId = resolveSelectedSearchEngineId(list, storedId ?? '')
    || SEED_SEARCH_ENGINES[0].id
  if (fallbackId === storedId) {
    return fallbackId
  }
  await setStorage(SEARCH_ENGINE_SELECTED_ID_KEY, fallbackId)
  return fallbackId
}

export const setSelectedEngineId = async (id: string): Promise<void> => {
  await setStorage(SEARCH_ENGINE_SELECTED_ID_KEY, id)
}

// 内置引擎 logo 按 key 运行时解析；非内置返回外链 URL
export const resolveEngineLogo = (engine: SearchEngine): string => {
  if (engine.iconSource === 'builtin' && engine.builtinLogoKey) {
    return BUILTIN_ENGINE_LOGO_MAP[engine.builtinLogoKey] || ''
  }
  return engine.logo || ''
}

// 构造搜索 URL：有 %s 占位符则替换，否则末尾追加（兼容旧的前缀拼接）
export const buildSearchUrl = (engine: SearchEngine, keyword: string): string => {
  const encoded = encodeURIComponent(keyword)
  if (engine.searchUrl.includes('%s')) {
    return engine.searchUrl.replace(/%s/g, encoded)
  }
  return `${ engine.searchUrl }${ encoded }`
}

export const createEngineId = (): string => {
  return `engine_${ Date.now() }_${ Math.random().toString(36).slice(2, 8) }`
}
