import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import en from './en.json'
import ja from './ja.json'
import ko from './ko.json'

// 获取浏览器默认语言（可选）
const getDefaultLocale = () => {
  return 'zh-CN'
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  globalInjection: true, // 允许全局使用 $t
  locale: getDefaultLocale(), // 默认语言
  fallbackLocale: 'en', // 备用语言
  messages: {
    'zh-CN': zhCN,
    en,
    ja,
    ko
  }
})

export default i18n
