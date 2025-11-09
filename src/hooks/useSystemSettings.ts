import { ref, watch } from 'vue'
import { useStorage } from '@/libs/storage'
import { SYSTEM_SETTING_KEY } from '@/libs/const'
import type { SYSTEM_SETTING } from '@/libs/const/type'
import { useI18n } from 'vue-i18n'

const { getStorage, setStorage } = useStorage()

// 全局共享的响应式状态
const systemSettings = ref<SYSTEM_SETTING>({
  language: 'zh-CN',
  bottomLinkShow: true,
  batteryShow: true
})

let isInitialized = false

export function useSystemSettings() {
  const { locale } = useI18n()

  // 初始化(只执行一次)
  const init = async () => {
    if (isInitialized) return
    
    const storageData = await getStorage(SYSTEM_SETTING_KEY)
    if (Object.keys(storageData).length) {
      systemSettings.value = storageData as SYSTEM_SETTING
      locale.value = systemSettings.value.language as any
    }
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
