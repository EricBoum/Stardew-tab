import { ref, watch } from 'vue'
import { useStorage } from '@/libs/storage'
import { SYSTEM_SETTING_KEY } from '@/libs/const'
import type { SYSTEM_SETTING } from '@/libs/const/type'
import { useI18n } from 'vue-i18n'
import { getDefaultLocale } from '@/locales'
import { CUSTOM_WEATHER_OPTIONS } from '@/libs/weatherCanvas/customWeather'

const { getStorage, setStorage } = useStorage()

const createDefaultSystemSettings = (language = 'en'): SYSTEM_SETTING => ({
  language,
  bottomLinkShow: true,
  batteryShow: true,
  themeMode: 'auto',
  weatherDisplayMode: 'real',
  customWeatherIconKey: 'Rainy',
  customWeatherIntensity: 'medium'
})
const normalizeCustomWeatherIconKey = (iconKey: SYSTEM_SETTING['customWeatherIconKey'] | undefined): SYSTEM_SETTING['customWeatherIconKey'] => {
  return CUSTOM_WEATHER_OPTIONS.find(item => item.iconKey === iconKey)?.iconKey ?? createDefaultSystemSettings().customWeatherIconKey
}

// 全局共享的响应式状态
const systemSettings = ref<SYSTEM_SETTING>(createDefaultSystemSettings())

let isInitialized = false

export function useSystemSettings() {
  const { locale } = useI18n()

  // 初始化
  const init = async () => {
    if (isInitialized) return

    const storageData = await getStorage(SYSTEM_SETTING_KEY)
    const defaultLang = await getDefaultLocale()
    const defaultSettings = createDefaultSystemSettings(defaultLang)
    if (storageData && Object.keys(storageData).length) {
      const storedSettings = storageData as Partial<SYSTEM_SETTING>
      systemSettings.value = {
        language: storedSettings.language ?? defaultSettings.language,
        bottomLinkShow: storedSettings.bottomLinkShow ?? defaultSettings.bottomLinkShow,
        batteryShow: storedSettings.batteryShow ?? defaultSettings.batteryShow,
        themeMode: storedSettings.themeMode ?? defaultSettings.themeMode,
        weatherDisplayMode: storedSettings.weatherDisplayMode ?? defaultSettings.weatherDisplayMode,
        customWeatherIconKey: normalizeCustomWeatherIconKey(storedSettings.customWeatherIconKey),
        customWeatherIntensity: storedSettings.customWeatherIntensity ?? defaultSettings.customWeatherIntensity
      }
    } else {
      systemSettings.value = defaultSettings
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
