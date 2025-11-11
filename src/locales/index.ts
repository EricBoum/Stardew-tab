import zhCN from './zh-CN.json'
import zhTW from './zh-TW.json'
import en from './en.json'
import ja from './ja.json'
import ko from './ko.json'
import ru from './ru.json'
import pt from './pt.json'
import es from './es.json'
import { useStorage } from '@/libs/storage'
import { SYSTEM_SETTING_KEY } from '@/libs/const'
import type { SYSTEM_SETTING } from '@/libs/const/type'
import { createI18n } from 'vue-i18n'

// 定义语言类型
export type LocaleType = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'ru' | 'pt' | 'es'

// 定义语言列表项类型
export interface LanguageItem {
  label: string
  value: LocaleType
  data: Record<string, any>
}

export const LanguageList: LanguageItem[] = [
  { label: '简体中文', value: 'zh-CN', data: zhCN },
  { label: '繁體中文', value: 'zh-TW', data: zhTW },
  { label: 'English', value: 'en', data: en },
  { label: '日本語', value: 'ja', data: ja },
  { label: '한국어', value: 'ko', data: ko },
  { label: 'Русский', value: 'ru', data: ru },
  { label: 'Português', value: 'pt', data: pt },
  { label: 'Español', value: 'es', data: es }
]

const { getStorage } = useStorage()

// 把浏览器语言转成支持的语言类型
const normalizeBrowserLang = (browserLang: string): LocaleType => {
  const lang = browserLang.toLowerCase()

  // 中文特殊处理
  if (lang.startsWith('zh')) {
    // zh-TW, zh-HK, zh-Hant -> 繁体
    if (lang.includes('tw') || lang.includes('hk') || lang.includes('hant')) {
      return 'zh-TW'
    }
    // 其他都当简体
    return 'zh-CN'
  }

  const mainLang = lang.split('-')[0]

  const supportedLangs: Record<string, LocaleType> = {
    'en': 'en',
    'ja': 'ja',
    'ko': 'ko',
    'ru': 'ru',
    'pt': 'pt',
    'es': 'es'
  }

  // 不支持的语言降级到英语
  return supportedLangs[mainLang] || 'en'
}

// 获取默认语言
export const getDefaultLocale = async (): Promise<LocaleType> => {
  // 先看看用户有没有手动设置过
  try {
    const systemSetting = await getStorage(SYSTEM_SETTING_KEY) as SYSTEM_SETTING
    if (systemSetting?.language) {
      return systemSetting.language as LocaleType
    }
  } catch (e) {
    console.warn('Failed to get language from storage:', e)
  }
  // 没设置过就用浏览器语言
  try {
    const browserLang = navigator.language || 'en'
    return normalizeBrowserLang(browserLang)
  } catch (e) {
    console.warn('Failed to get browser language:', e)
  }

  // 都失败了就用英语
  return 'en'
}

// 创建 i18n 实例
const createI18nInstance = (locale: LocaleType = 'zh-CN') => {
  return createI18n({
    legacy: false,
    globalInjection: true,
    locale, // 使用传入的语言
    fallbackLocale: 'en', // 备用语言
    messages: LanguageList.reduce<Record<LocaleType, Record<string, any>>>((acc, item) => {
      acc[item.value] = item.data
      return acc
    }, {} as Record<LocaleType, Record<string, any>>)
  })
}

// 异步初始化 i18n，等待语言设置加载完成
export const initI18n = async () => {
  const locale = await getDefaultLocale()
  return createI18nInstance(locale)
}
