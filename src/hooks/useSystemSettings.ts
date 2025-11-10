import { ref, watch } from 'vue'
import { useStorage } from '@/libs/storage'
import { SYSTEM_SETTING_KEY } from '@/libs/const'
import type { SYSTEM_SETTING } from '@/libs/const/type'
import { useI18n } from 'vue-i18n'
import { getDefaultLocale } from '@/locales'

const { getStorage, setStorage } = useStorage()

// 全局共享的响应式状态
const systemSettings = ref<SYSTEM_SETTING>({
  language: 'en',
  bottomLinkShow: true,
  batteryShow: true
})

let isInitialized = false

export function useSystemSettings() {
  const { locale } = useI18n()

  // 初始化
  const init = async () => {
    if (isInitialized) return

    const storageData = await getStorage(SYSTEM_SETTING_KEY)
    if (storageData && Object.keys(storageData).length) {
      systemSettings.value = storageData as SYSTEM_SETTING
    } else {
      // 首次使用，检测浏览器语言
      const defaultLang = await getDefaultLocale()
      systemSettings.value = {
        language: defaultLang,
        bottomLinkShow: true,
        batteryShow: true
      }
    }
    locale.value = systemSettings.value.language as any
    isInitialized = true
  }

  // 监听语言变化
  watch(() => systemSettings.value.language, (newLang) => {
    locale.value = newLang as any
  })

  // 自动保存到 storage
  watch(systemSettings, (newValue) => {
    setStorage(SYSTEM_SETTING_KEY, { ...newValue })
  }, { deep: true })

  return {
    systemSettings,
    init
  }
}
