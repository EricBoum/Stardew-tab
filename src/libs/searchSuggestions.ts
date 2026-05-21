import axios from 'axios'
import { SYSTEM_SETTING_KEY } from '@/libs/const'
import type { SYSTEM_SETTING } from '@/libs/const/type'
import { useStorage } from '@/libs/storage'

export interface SearchSuggestionItem {
  title: string;
}

type SuggestionProvider = 'baidu' | 'google'

const SUGGESTION_TIMEOUT = 3000
const SUGGESTION_LIMIT = 10

const uniqueSuggestions = (items: string[]): SearchSuggestionItem[] => {
  const seen = new Set<string>()
  return items
    .map((item) => item.trim())
    .filter((item) => {
      if (!item || seen.has(item)) {
        return false
      }
      seen.add(item)
      return true
    })
    .slice(0, SUGGESTION_LIMIT)
    .map((item) => ( {title: item} ))
}

const getBrowserLanguage = (): string => {
  return navigator.languages?.[0] || navigator.language || 'en'
}

const getGoogleSuggestionLanguage = async (): Promise<string> => {
  try {
    const systemSetting = await useStorage().getStorage<SYSTEM_SETTING>(SYSTEM_SETTING_KEY)
    return systemSetting?.language || getBrowserLanguage()
  } catch (error) {
    console.warn('Failed to get Google suggestion language from settings:', error)
    return getBrowserLanguage()
  }
}

const isSimplifiedChineseBrowserLanguage = (): boolean => {
  const browserLang = getBrowserLanguage().toLowerCase()
  if (!browserLang.startsWith('zh')) {
    return false
  }
  return !(
    browserLang.includes('tw') ||
    browserLang.includes('hk') ||
    browserLang.includes('hant')
  )
}

const getProvidersByEngine = (engineName: string): SuggestionProvider[] => {
  if (engineName === 'Baidu') {
    return [ 'baidu' ]
  }
  if (engineName === 'Google') {
    return [ 'google' ]
  }
  if (isSimplifiedChineseBrowserLanguage()) {
    return [ 'baidu' ]
  }
  return [ 'google' ]
}

const getBaiduSuggestions = async (keyword: string): Promise<SearchSuggestionItem[]> => {
  const res = await axios.get('https://suggestion.baidu.com/su', {
    params: {
      p: 3,
      ie: 'UTF-8',
      wd: keyword,
      cb: 'window.baidu.sug'
    },
    timeout: SUGGESTION_TIMEOUT
  })
  const match = res.data.match(/window.baidu.sug\(([\s\S]*?)\)/)
  let json: { s?: string[] } = {s: []}

  if (match?.[1]) {
    const fixed = match[1].replace(/(\w+):/g, '"$1":')
    json = JSON.parse(fixed)
  }
  return uniqueSuggestions(json.s || [])
}

const getGoogleSuggestions = async (keyword: string): Promise<SearchSuggestionItem[]> => {
  const res = await axios.get('https://www.google.com/complete/search', {
    params: {
      client: 'firefox',
      q: keyword,
      hl: await getGoogleSuggestionLanguage()
    },
    timeout: SUGGESTION_TIMEOUT
  })
  const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
  const suggestions = Array.isArray(data?.[1]) ? data[1] : []
  return uniqueSuggestions(suggestions.filter((item: unknown): item is string => typeof item === 'string'))
}

const getSuggestionsByProvider = async (
  provider: SuggestionProvider,
  keyword: string
): Promise<SearchSuggestionItem[]> => {
  if (provider === 'baidu') {
    return getBaiduSuggestions(keyword)
  }
  return getGoogleSuggestions(keyword)
}

export const getSearchSuggestions = async (
  engineName: string,
  keyword: string
): Promise<SearchSuggestionItem[]> => {
  const normalizedKeyword = keyword.trim()
  if (!normalizedKeyword) {
    return []
  }

  for (const provider of getProvidersByEngine(engineName)) {
    try {
      const suggestions = await getSuggestionsByProvider(provider, normalizedKeyword)
      if (suggestions.length) {
        return suggestions
      }
    } catch (error) {
      console.error(`Failed to get ${ provider } search suggestions:`, error)
    }
  }
  return []
}
