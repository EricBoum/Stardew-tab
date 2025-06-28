<template>
  <div class="InfoBoard absolute top-[30px] right-0 z-[2] w-[230px] h-[129px]">
    <img :style="{transform: `rotate(${getPointerRotate}deg)`}" class="time-pointer absolute w-[20px] top-[53px] left-[64px]" src="@/assets/image/time-pointer.png" alt="">
    <p class="info-text h-[33px] leading-[33px] top-[13px]">
      {{ props.information.week }}
    </p>
    <div class="w-[45px] h-[30px] absolute top-[49px] right-[92px] group">
      <img class="w-full h-full" :src="getTodayWeather" :alt="props.information.weather.today.zh">
      <StardewTips placement="top-start">
        <template #default>
          <SimpleInfo :detail="{title: '今天天气', content: props.information.weather.today.zh}" />
        </template>
      </StardewTips>
    </div>
    <img class="w-[36px] h-[27px] absolute top-[51px] right-[20px]" :src="getSeasonImage.img" :title="getSeasonImage.zh" :alt="getSeasonImage.zh">
    <p class="info-text h-[29px] leading-[33px] bottom-[11px]">
      {{ props.information.time.hour }}<span class="flash-dot">:</span>{{ props.information.time.minute }}
    </p>
    <div class="absolute w-[40px] h-[40px] -bottom-[50px] right-[10px] group">
      <img class="w-full h-full" :src="getTomorrowWeather" alt="">
      <StardewTips placement="bottom-end">
        <template #default>
          <SimpleInfo :detail="{title: '明天天气', content: props.information.weather.tomorrow.zh}" />
        </template>
      </StardewTips>
    </div>
  </div>
</template>

<script setup lang="ts">
import StardewTips from '@/components/_components/StardewTips/index.vue'
import SimpleInfo from '@/components/_common/SimpleInfo/index.vue'
import { computed } from 'vue'
import { type INFORMATION, type SEASON_ITEM, SEASON, type SEASON_TYPE } from '@/libs/const/index.ts'

const props = defineProps<{
  information: INFORMATION
}>()

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
  const en = props.information.weather.today.en
  const key = `/src/assets/image/weather/${ en }.png`
  return weatherImages[key]
})
// 获取明天天气
const getTomorrowWeather = computed(() => {
  const en = props.information.weather.tomorrow.en
  const key = `/src/assets/image/weather/${ en }_tm.gif`
  return weatherImagesTomorrow[key]
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
