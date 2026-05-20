<template>
  <div class="InfoBoard absolute top-[30px] right-0 z-[2] w-[230px] h-[129px]">
    <img :style="{transform: `rotate(${getPointerRotate}deg)`}" class="time-pointer absolute w-[20px] top-[53px] left-[64px]" src="@/assets/image/time-pointer.png" alt="">
    <p class="info-text h-[33px] leading-[33px] top-[13px]">
      {{ props.information.week }}
    </p>
    <div class="w-[45px] h-[30px] absolute top-[49px] right-[92px] group">
      <img class="w-full h-full" :src="getTodayWeather" :alt="getTodayWeatherText">
      <StardewTips placement="top-start">
        <template #default>
          <SimpleInfo :detail="{title: t('weather.today'), content: getTodayWeatherText}" />
        </template>
      </StardewTips>
    </div>
    <img class="w-[36px] h-[27px] absolute top-[51px] right-[20px]" :src="getSeasonImage.img" :title="getSeasonText" :alt="getSeasonText">
    <p class="info-text h-[29px] leading-[33px] bottom-[11px]">
      {{ props.information.time.hour }}<span class="flash-dot">:</span>{{ props.information.time.minute }}
    </p>
    <div class="absolute w-[40px] h-[40px] -bottom-[50px] right-[60px] group">
      <img class="w-full h-full" :src="getTomorrowWeather" :alt="getTomorrowWeatherText">
      <StardewTips placement="bottom-end">
        <template #default>
          <SimpleInfo :detail="{title: t('weather.tomorrow'), content: getTomorrowWeatherText}" />
        </template>
      </StardewTips>
    </div>
    <div class="absolute w-[40px] h-[40px] -bottom-[50px] right-[10px] pointer" @click="handleToSetting">
      <img class="w-full h-full" src="@/assets/image/setting.png" alt="">
    </div>
    <div
      v-if="showLocationPrompt"
      class="absolute top-[190px] right-0 w-[268px] p-3 bg-[#efbd73] text-[#4e3623] shadow-[4px_5px_0_rgba(79,45,24,0.35)] stardew-border stardew-font"
    >
      <div class="absolute -top-[10px] right-5 w-4 h-4 border-t-[3px] border-l-[3px] border-[#5f2e16] bg-[#efbd73] rotate-45"></div>
      <p class="m-0 mb-1.5 text-base leading-5 font-bold">
        {{ t('weather.locationPromptTitle') }}
      </p>
      <p class="m-0 text-[13px] leading-[18px]">
        {{ getLocationPromptContent }}
      </p>
      <div class="grid grid-cols-3 items-stretch gap-1.5 mt-2.5">
        <button
          type="button"
          class="min-w-0 min-h-7 px-1.5 py-[2px] border-2 border-[#6f3a1c] rounded bg-[#a7d86f] text-[#4e3623] text-[11px] leading-[14px] text-center break-words shadow-[inset_-2px_-2px_0_#6e9b43] cursor-pointer hover:bg-[#b8e680] active:translate-y-px active:shadow-[inset_2px_2px_0_#6e9b43] disabled:cursor-default disabled:opacity-75"
          :disabled="isWeatherLocationDisabled"
          @click="handleRequestWeatherLocation"
        >
          {{ props.weatherLocationLoading ? t('weather.locationLoading') : t('weather.locationPromptEnable') }}
        </button>
        <button
          type="button"
          class="min-w-0 min-h-7 px-1.5 py-[2px] border-2 border-[#6f3a1c] rounded bg-[#f8d18a] text-[#4e3623] text-[11px] leading-[14px] text-center break-words shadow-[inset_-2px_-2px_0_#c98b45] cursor-pointer hover:bg-[#ffe0a3] active:translate-y-px active:shadow-[inset_2px_2px_0_#c98b45]"
          @click="handleCloseLocationPrompt"
        >
          {{ t('weather.locationPromptLater') }}
        </button>
        <button
          type="button"
          class="min-w-0 min-h-7 px-1.5 py-[2px] border-2 border-[#6f3a1c] rounded bg-[#f8d18a] text-[#4e3623] text-[11px] leading-[14px] text-center break-words shadow-[inset_-2px_-2px_0_#c98b45] cursor-pointer hover:bg-[#ffe0a3] active:translate-y-px active:shadow-[inset_2px_2px_0_#c98b45]"
          @click="handleHideLocationPrompt"
        >
          {{ t('weather.locationPromptNever') }}
        </button>
      </div>
    </div>
    <OperateDialog
      ref="OperateDialogRef"
      :weather-permission-status="props.weatherPermissionStatus"
      :weather-location-loading="props.weatherLocationLoading"
      @request-weather-location="handleRequestWeatherLocation"
    />
  </div>
</template>

<script setup lang="ts">
import StardewTips from '@/components/_components/StardewTips/index.vue'
import SimpleInfo from '@/components/_common/SimpleInfo/index.vue'
import OperateDialog from './OperateDialog.vue'
import { computed, onMounted, shallowRef, useTemplateRef } from 'vue'
import {
  type INFORMATION,
  type SEASON_ITEM,
  SEASON,
  type SEASON_TYPE,
  WEATHER_LOCATION_PROMPT_HIDDEN_KEY
} from '@/libs/const/index.ts'
import { useI18n } from 'vue-i18n'
import type { WeatherLocationStatus, WeatherPermissionStatus } from '@/libs/weather'
import { useStorage } from '@/libs/storage'

const { t } = useI18n()
const { getStorage, setStorage } = useStorage()

const props = defineProps<{
  information: INFORMATION;
  weatherLocationStatus: WeatherLocationStatus;
  weatherPermissionStatus: WeatherPermissionStatus;
  weatherLocationLoading: boolean;
}>()

const emit = defineEmits<{
  requestWeatherLocation: [];
}>()

const OperateDialogRef = useTemplateRef('OperateDialogRef')
const locationPromptHidden = shallowRef<boolean>(false)
const locationPromptClosed = shallowRef<boolean>(false)

// 根据当前时间返回刻度
const getPointerRotate = computed(() => {
  const hour = Number(props.information.time.hour)
  const minute = Number(props.information.time.minute)
  const totalMinutes = hour * 60 + minute
  return ( totalMinutes / 1440 ) * 180
})
// 获取季节图片
const getSeasonImage = computed(() => {
  return ( SEASON as SEASON_TYPE )[props.information.season] as SEASON_ITEM || {zh: '', img: ''}
})
// 获取季节文本
const getSeasonText = computed(() => {
  const seasonKey = props.information.season // 'spring', 'summer', 'fall', 'winter'
  if (seasonKey) {
    return t(`season.${seasonKey}`)
  }
  return ''
})
// 预加载所有天气图片（今天）
const weatherImages = import.meta.glob('@/assets/image/weather/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>
// 预加载所有天气图片（明天）
const weatherImagesTomorrow = import.meta.glob('@/assets/image/weather/*.gif', {
  eager: true,
  import: 'default'
}) as Record<string, string>

// 获取今天天气
const getTodayWeather = computed(() => {
  const iconKey = props.information.weather.today.iconKey
  const key = `/src/assets/image/weather/${ iconKey }.png`
  return weatherImages[key] || weatherImages['/src/assets/image/weather/Default.png']
})
// 获取明天天气
const getTomorrowWeather = computed(() => {
  const iconKey = props.information.weather.tomorrow.iconKey
  const key = `/src/assets/image/weather/${ iconKey }_tm.gif`
  return weatherImagesTomorrow[key] || weatherImagesTomorrow['/src/assets/image/weather/Default_tm.gif']
})
// 获取今天天气文本
const getTodayWeatherText = computed(() => {
  const weatherKey = props.information.weather.today.weatherKey
  if (weatherKey) {
    return t(`weatherCode.${weatherKey}`)
  }
  return t('weather.default')
})
// 获取明天天气文本
const getTomorrowWeatherText = computed(() => {
  const weatherKey = props.information.weather.tomorrow.weatherKey
  if (weatherKey) {
    return t(`weatherCode.${weatherKey}`)
  }
  return t('weather.default')
})
// 是否显示定位提示窗
const showLocationPrompt = computed(() => {
  return !locationPromptHidden.value &&
    !locationPromptClosed.value &&
    props.weatherPermissionStatus !== 'granted' &&
    !['idle', 'success'].includes(props.weatherLocationStatus)
})

// 定位提示窗内容
const getLocationPromptContent = computed(() => {
  if (props.weatherLocationStatus === 'permission-denied') {
    return t('weather.locationPromptDeniedContent')
  }
  return t('weather.locationPromptContent')
})

const isWeatherLocationDisabled = computed(() => {
  return props.weatherLocationLoading || props.weatherPermissionStatus !== 'prompt'
})

// 打开设置弹窗
const handleToSetting = () => {
  OperateDialogRef.value?.show()
}
// 请求浏览器定位授权
const handleRequestWeatherLocation = () => {
  if (isWeatherLocationDisabled.value) {
    return
  }
  emit('requestWeatherLocation')
}
// 关闭本次提示
const handleCloseLocationPrompt = () => {
  locationPromptClosed.value = true
}
// 不再自动显示提示
const handleHideLocationPrompt = async () => {
  locationPromptHidden.value = true
  await setStorage(WEATHER_LOCATION_PROMPT_HIDDEN_KEY, true)
}

onMounted(async () => {
  locationPromptHidden.value = await getStorage<boolean>(WEATHER_LOCATION_PROMPT_HIDDEN_KEY) || false
})
</script>

<style lang="less" scoped>
.InfoBoard {
  background-image: url("@/assets/image/bg/info_bg.png");
  background-size: cover;
  background-repeat: no-repeat;
  .time-pointer {
    transform-origin: 10px 10px;
    transition: 1s;
  }
  .info-text {
    width: 126px;
    text-align: center;
    position: absolute;
    right: 15px;
    color: var(--text-color);
    font-weight: 600;
    text-shadow: -2px 1px 0 rgba(0, 0, 0, 0.1);
  }
  .flash-dot {
    animation: flash 1s infinite;
  }
}
@keyframes flash {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
