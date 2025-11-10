import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import zhHant from './zh-Hant.json'
import en from './en.json'
import ja from './ja.json'
import ko from './ko.json'
import ru from './ru.json'
import pt from './pt.json'
import es from './es.json'
import { useStorage } from '@/libs/storage'
import { SYSTEM_SETTING_KEY } from '@/libs/const'
import type { SYSTEM_SETTING } from '@/libs/const/type'

// 定义语言类型
export type LocaleType = 'zh-CN' | 'zh-Hant' | 'en' | 'ja' | 'ko' | 'ru' | 'pt' | 'es'

// 定义语言列表项类型
export interface LanguageItem {
  label: string
  value: LocaleType
  data: Record<string, any>
}

export const LanguageList: LanguageItem[] = [
  { label: '简体中文', value: 'zh-CN', data: zhCN },
  { label: '繁體中文', value: 'zh-Hant', data: zhHant },
  { label: 'English', value: 'en', data: en },
  { label: '日本語', value: 'ja', data: ja },
  { label: '한국어', value: 'ko', data: ko },
  { label: 'Русский', value: 'ru', data: ru },
  { label: 'Português', value: 'pt', data: pt },
  { label: 'Español', value: 'es', data: es }
]

const { getStorage } = useStorage()

// 获取默认语言
const getDefaultLocale = async (): Promise<LocaleType> => {
  // 尝试从 storage 读取保存的语言设置
  try {
    const systemSetting = await getStorage(SYSTEM_SETTING_KEY) as SYSTEM_SETTING
    if (systemSetting?.language) {
      return systemSetting.language as LocaleType
    }
  } catch (e) {
    console.warn('Failed to get language from storage:', e)
  }
  return 'zh-CN'
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

// 导出默认实例（用于类型推断）
const i18n = createI18nInstance()
export default i18n
