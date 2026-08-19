import type { SearchEngine } from '@/libs/const/type'

export const getVisibleSearchEngines = (list: SearchEngine[]): SearchEngine[] => {
  return list.filter(item => !item.hidden)
}

export const normalizeVisibleSearchEngines = (
  list: SearchEngine[],
  maxVisible: number
): SearchEngine[] => {
  let visibleCount = 0
  const normalized = list.map((item) => {
    if (item.hidden) {
      return {...item}
    }
    if (visibleCount >= maxVisible) {
      return {...item, hidden: true}
    }
    visibleCount += 1
    return {...item}
  })

  if (normalized.length && visibleCount === 0) {
    normalized[0] = {...normalized[0], hidden: false}
  }
  return normalized
}

export const mergeMissingSearchEnginePresets = (
  list: SearchEngine[],
  presets: SearchEngine[],
  maxVisible: number
): SearchEngine[] => {
  const merged = list.map(item => ({...item}))
  const existingIds = new Set(merged.map(item => item.id))

  presets.forEach((preset) => {
    if (!existingIds.has(preset.id)) {
      merged.push({...preset})
      existingIds.add(preset.id)
    }
  })
  return normalizeVisibleSearchEngines(merged, maxVisible)
}

export const resolveSelectedSearchEngineId = (
  list: SearchEngine[],
  selectedId: string
): string => {
  const visibleEngines = getVisibleSearchEngines(list)
  if (visibleEngines.some(item => item.id === selectedId)) {
    return selectedId
  }
  return visibleEngines[0]?.id ?? ''
}

export const hasConfiguredSearchEngineIcon = (engine: SearchEngine): boolean => {
  return Boolean(engine.builtinLogoKey || engine.iconId || engine.logo)
}

export const applyPresetIconsToEmptyFaviconEngines = (
  list: SearchEngine[],
  presets: SearchEngine[]
): SearchEngine[] => {
  const presetMap = new Map(presets.map(item => [ item.id, item ]))

  return list.map((engine) => {
    const preset = presetMap.get(engine.id)
    if (
      !preset
      || engine.iconSource !== 'favicon'
      || hasConfiguredSearchEngineIcon(engine)
    ) {
      return {...engine}
    }
    return {
      ...engine,
      iconSource: preset.iconSource,
      builtinLogoKey: preset.builtinLogoKey,
      logo: undefined
    }
  })
}
