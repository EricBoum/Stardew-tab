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
      <img class="w-full h-full" :src="getTomorrowWeather" alt="">
      <StardewTips placement="bottom-end">
        <template #default>
          <SimpleInfo :detail="{title: t('weather.tomorrow'), content: getTomorrowWeatherText}" />
        </template>
      </StardewTips>
    </div>
    <div class="absolute w-[40px] h-[40px] -bottom-[50px] right-[10px] pointer" @click="handleToSetting">
      <img class="w-full h-full" src="@/assets/image/setting.png" alt="">
    </div>
    <OperateDialog ref="OperateDialogRef"/>
  </div>
</template>

<script setup lang="ts">
import StardewTips from '@/components/_components/StardewTips/index.vue'
import SimpleInfo from '@/components/_common/SimpleInfo/index.vue'
import OperateDialog from './OperateDialog.vue'
import { computed, useTemplateRef } from 'vue'
import { type INFORMATION, type SEASON_ITEM, SEASON, type SEASON_TYPE } from '@/libs/const/index.ts'
import { WEATHER_ICON_MAP } from '@/libs/const/weatherMap.ts'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps<{
  information: INFORMATION
}>()

const OperateDialogRef = useTemplateRef('OperateDialogRef')

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
  return weatherImages[key]
})
// 获取明天天气
const getTomorrowWeather = computed(() => {
  const iconKey = props.information.weather.tomorrow.iconKey
  const key = `/src/assets/image/weather/${ iconKey }_tm.gif`
  return weatherImagesTomorrow[key]
})
// 获取今天天气文本
const getTodayWeatherText = computed(() => {
  const weatherKey = props.information.weather.today.weatherKey
  if (weatherKey && WEATHER_ICON_MAP[weatherKey]) {
    return WEATHER_ICON_MAP[weatherKey][locale.value as keyof typeof WEATHER_ICON_MAP[typeof weatherKey]]
  }
  return t('weather.default')
})
// 获取明天天气文本
const getTomorrowWeatherText = computed(() => {
  const weatherKey = props.information.weather.tomorrow.weatherKey
  if (weatherKey && WEATHER_ICON_MAP[weatherKey]) {
    return WEATHER_ICON_MAP[weatherKey][locale.value as keyof typeof WEATHER_ICON_MAP[typeof weatherKey]]
  }
  return t('weather.default')
})
// 打开设置弹窗
const handleToSetting = () => {
  OperateDialogRef.value?.show()
}
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
