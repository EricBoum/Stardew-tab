<template>
  <StardewDialog v-model="visible">
    <div class="site-dialog bg-[#EFBD73] p-6 w-[640px] max-w-[94vw] relative stardew-border stardew-font">
      <div class="close-box" @click="hide">
        <img src="@/assets/image/link/close.png" :alt="$t('common.close')">
      </div>
      <h3 class="text-xl text-[#4e3623] font-bold">
        {{ $t('settings.title') }}
      </h3>
      <div class="flex items-center text mt-2">
        <span class="w-[120px] select-none mr-[20px]">{{ $t('settings.language') }}</span>
        <StardewSelect class="w-[200px] pointer" v-model="systemDetail.language" :options="getOptions" />
      </div>
      <div class="flex items-center text mt-2">
        <span class="w-[120px] select-none mr-[20px]">{{ $t('settings.showBottomBar') }}</span>
        <StardewSwitch v-model="systemDetail.bottomLinkShow" />
      </div>
      <div class="flex items-center text mt-2">
        <span class="w-[120px] select-none mr-[20px]">{{ $t('settings.showBattery') }}</span>
        <StardewSwitch v-model="systemDetail.batteryShow" />
      </div>
      <div class="flex items-start text mt-4">
        <span class="w-[120px] select-none mr-[20px] pt-1">{{ $t('settings.searchOpenMode') }}</span>
        <div class="grid min-w-0 flex-1 grid-cols-2 gap-2">
          <button
            v-for="option in searchOpenModeOptions"
            :key="option.id"
            type="button"
            class="min-h-8 border-2 border-[#6f3a1c] px-3 py-1.5 text-sm leading-[18px] text-[#4e3623] shadow-[inset_-2px_-2px_0_#c98b45] pointer hover:bg-[#ffe0a3] active:translate-y-px active:shadow-[inset_2px_2px_0_#c98b45]"
            :class="systemDetail.searchOpenMode === option.id ? 'bg-[#f6d26f]' : 'bg-[#f8d18a]'"
            @click="systemDetail.searchOpenMode = option.id"
          >
            {{ option.name }}
          </button>
        </div>
      </div>
      <div class="flex items-start text mt-4">
        <span class="w-[120px] select-none mr-[20px] pt-1">{{ $t('settings.themeMode') }}</span>
        <div class="grid min-w-0 flex-1 grid-cols-3 gap-2">
          <button
            v-for="option in themeModeOptions"
            :key="option.id"
            type="button"
            class="min-h-8 border-2 border-[#6f3a1c] px-3 py-1.5 text-sm leading-[18px] text-[#4e3623] shadow-[inset_-2px_-2px_0_#c98b45] pointer hover:bg-[#ffe0a3] active:translate-y-px active:shadow-[inset_2px_2px_0_#c98b45]"
            :class="systemDetail.themeMode === option.id ? 'bg-[#f6d26f]' : 'bg-[#f8d18a]'"
            @click="systemDetail.themeMode = option.id"
          >
            {{ option.name }}
          </button>
        </div>
      </div>
      <div class="flex items-start text mt-4">
        <span class="w-[120px] select-none mr-[20px] pt-1">{{ $t('settings.weatherDisplayMode') }}</span>
        <div class="flex min-w-0 flex-1 flex-col gap-3">
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="option in weatherDisplayModeOptions"
              :key="option.id"
              type="button"
              class="min-h-8 border-2 border-[#6f3a1c] px-3 py-1.5 text-sm leading-[18px] text-[#4e3623] shadow-[inset_-2px_-2px_0_#c98b45] pointer hover:bg-[#ffe0a3] active:translate-y-px active:shadow-[inset_2px_2px_0_#c98b45]"
              :class="systemDetail.weatherDisplayMode === option.id ? 'bg-[#f6d26f]' : 'bg-[#f8d18a]'"
              @click="systemDetail.weatherDisplayMode = option.id"
            >
              {{ option.name }}
            </button>
          </div>
          <div v-if="systemDetail.weatherDisplayMode === 'custom'" class="space-y-3">
            <div>
              <div class="mb-2 text-sm leading-[18px] text-[#4e3623]">
                {{ $t('settings.customWeatherIcon') }}
              </div>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="option in CUSTOM_WEATHER_OPTIONS"
                  :key="option.iconKey"
                  type="button"
                  class="flex min-h-[58px] flex-col items-center justify-center border-2 border-[#6f3a1c] bg-[#f8d18a] px-1.5 py-1 text-xs leading-[14px] text-[#4e3623] shadow-[inset_-2px_-2px_0_#c98b45] pointer hover:bg-[#ffe0a3] active:translate-y-px active:shadow-[inset_2px_2px_0_#c98b45]"
                  :class="systemDetail.customWeatherIconKey === option.iconKey ? 'outline outline-2 outline-[#5f2e16] bg-[#f6d26f]' : ''"
                  @click="systemDetail.customWeatherIconKey = option.iconKey"
                >
                  <img class="size-8 object-contain image-render-pixel" :src="getWeatherIconSrc(option.iconKey)" :alt="getCustomWeatherIconText(option.labelKey)">
                  <span class="mt-0.5 max-w-full truncate">{{ getCustomWeatherIconText(option.labelKey) }}</span>
                </button>
              </div>
            </div>
            <div v-if="showCustomWeatherIntensity" class="flex items-center">
              <span class="w-[120px] select-none mr-[20px]">{{ $t('settings.customWeatherIntensity') }}</span>
              <StardewSelect class="w-[200px] pointer" v-model="systemDetail.customWeatherIntensity" :options="customWeatherIntensityOptions" />
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-start text mt-2">
        <span class="w-[120px] select-none mr-[20px] flex items-center">
          {{ $t('settings.weatherLocation') }}
          <span class="relative group inline-flex ml-1">
            <span class="w-4 h-4 inline-flex items-center justify-center border-2 border-[#6f3a1c] rounded-full bg-[#f8d18a] text-[#4e3623] text-xs leading-none pointer">?</span>
            <StardewTips placement="top-start">
              <template #default>
                <SimpleInfo :detail="{title: $t('settings.weatherLocationPrivacyTitle'), content: $t('settings.weatherLocationPrivacy')}" />
              </template>
            </StardewTips>
          </span>
        </span>
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span class="inline-flex min-h-7 items-center gap-1.5 text-[#4e3623] text-sm leading-[18px]">
            <span class="inline-flex size-3 items-center justify-center rounded-full border-2 border-[#5f2e16] bg-[#f4e0a2] shadow-[1px_1px_0_rgba(79,45,24,0.3)]">
              <span class="size-1.5 rounded-full shadow-[1px_1px_0_rgba(79,45,24,0.35)]" :class="getWeatherPermissionDotClass"></span>
            </span>
            {{ getWeatherPermissionBadgeText }}
          </span>
          <button
            v-if="showWeatherPermissionButton"
            type="button"
            class="min-h-7 px-2.5 py-[2px] border-2 border-[#6f3a1c] rounded bg-[#f8d18a] text-[#4e3623] text-sm leading-[18px] shadow-[inset_-2px_-2px_0_#c98b45] pointer hover:bg-[#ffe0a3] active:translate-y-px active:shadow-[inset_2px_2px_0_#c98b45] disabled:cursor-default disabled:opacity-75"
            :disabled="isWeatherPermissionButtonDisabled"
            @click="handleRequestWeatherLocation"
          >
            {{ getWeatherLocationButtonText }}
          </button>
        </div>
      </div>
      <p
        v-if="getWeatherLocationNoticeText"
        class="mt-2 ml-[140px] mb-0 px-2 py-1 border-2 border-[#8f3d27] bg-[#f8d18a] text-[#7b312a] text-xs leading-[16px]"
      >
        {{ getWeatherLocationNoticeText }}
      </p>
    </div>
  </StardewDialog>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import StardewSelect from '@/components/_components/StardewSelect/index.vue'
import StardewSwitch from '@/components/_components/StardewSwitch/index.vue'
import StardewTips from '@/components/_components/StardewTips/index.vue'
import SimpleInfo from '@/components/_common/SimpleInfo/index.vue'
import { ref, computed } from 'vue'
import { LanguageList, type LanguageItem } from '@/locales'
import { useSystemSettings } from '@/hooks/useSystemSettings'
import { useI18n } from 'vue-i18n'
import type { WeatherLocationStatus, WeatherPermissionStatus } from '@/libs/weather'
import {
  CUSTOM_WEATHER_INTENSITIES,
  CUSTOM_WEATHER_OPTIONS
} from '@/libs/weatherCanvas/customWeather'
import type { WeatherIconKey } from '@/libs/const/weatherMap'

const props = defineProps<{
  weatherLocationStatus: WeatherLocationStatus;
  weatherPermissionStatus: WeatherPermissionStatus;
  weatherLocationLoading: boolean;
}>()

const emit = defineEmits<{
  requestWeatherLocation: [];
}>()

const { t } = useI18n()
const { systemSettings: systemDetail, init: initSystemSettings } = useSystemSettings()

const visible = ref<boolean>(false)

const getOptions = computed(() => {
  return LanguageList.map((item: LanguageItem) => ({
    name: item.label,
    id: item.value
  }))
})
const weatherDisplayModeOptions = computed(() => [
  {name: t('settings.weatherDisplayReal'), id: 'real' as const},
  {name: t('settings.weatherDisplayCustom'), id: 'custom' as const}
])
const themeModeOptions = computed(() => [
  {name: t('settings.themeModeAuto'), id: 'auto' as const},
  {name: t('settings.themeModeDay'), id: 'day' as const},
  {name: t('settings.themeModeNight'), id: 'night' as const}
])
const searchOpenModeOptions = computed(() => [
  {name: t('settings.searchOpenNewTab'), id: 'newTab' as const},
  {name: t('settings.searchOpenCurrentTab'), id: 'currentTab' as const}
])
const customWeatherIntensityOptions = computed(() => {
  return CUSTOM_WEATHER_INTENSITIES.map((item) => ({
    name: t(`settings.weatherIntensity${ item.charAt(0).toUpperCase() }${ item.slice(1) }`),
    id: item
  }))
})
const showCustomWeatherIntensity = computed(() => {
  return systemDetail.value.customWeatherIconKey !== 'Sunny'
})
const weatherImages = import.meta.glob('@/assets/image/weather/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const getWeatherLocationButtonText = computed(() => {
  return props.weatherLocationLoading ? t('weather.locationLoading') : t('settings.weatherLocationAction')
})

const showWeatherPermissionButton = computed(() => {
  return props.weatherPermissionStatus !== 'granted'
})

const isWeatherPermissionButtonDisabled = computed(() => {
  return props.weatherLocationLoading || props.weatherPermissionStatus === 'granted'
})

const getWeatherPermissionBadgeText = computed(() => {
  return props.weatherPermissionStatus === 'granted'
    ? t('settings.weatherPermissionAuthorizedShort')
    : t('settings.weatherPermissionUnauthorizedShort')
})

const getWeatherPermissionDotClass = computed(() => {
  return props.weatherPermissionStatus === 'granted'
    ? 'bg-[#4f9b43]'
    : 'bg-[#c7472d]'
})

const getWeatherLocationNoticeText = computed(() => {
  if (props.weatherLocationStatus === 'permission-denied') {
    return t('weather.locationPromptDeniedContent')
  }

  if (props.weatherLocationStatus === 'failed') {
    return t('weather.locationPromptFailedContent')
  }

  return ''
})

const show = async () => {
  await initSystemSettings()
  visible.value = true
}

const hide = () => {
  visible.value = false
}

const handleRequestWeatherLocation = () => {
  if (isWeatherPermissionButtonDisabled.value) {
    return
  }
  emit('requestWeatherLocation')
}
const getWeatherIconSrc = (iconKey: WeatherIconKey): string => {
  return weatherImages[`/src/assets/image/weather/${ iconKey }.png`] || weatherImages['/src/assets/image/weather/Default.png']
}
const getCustomWeatherIconText = (labelKey: string): string => {
  return t(labelKey)
}

defineExpose({
  show,
  hide
})
</script>

<style lang="less" scoped>
@import "@/styles/common";
.close-box {
  .dialog-close-button();
}
</style>
