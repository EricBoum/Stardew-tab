<template>
  <div class="flex justify-center w-screen h-screen relative overflow-hidden bg-cover bg-no-repeat bg-center" :style="getBodyBg">
    <!--天气动效-->
    <Weather ref="WeatherRef" :information="information" />
    <!--信息看板-->
    <InfoBoard :information="information" />
    <!--输入框-->
    <SearchInput :information="information" />
    <!--快捷导航栏（开发中）-->
    <Navigation v-if="!linkBoxShow" ref="NavigationRef" @handleOpenLinkBox="handleOpenLinkBox" />
    <!--电量-->
    <Battery />
    <!--快捷链接工具栏-->
    <LinkBox v-model="linkBoxShow" ref="LinkBoxRef" @on-close="toRefreshList" />
  </div>
</template>

<script setup lang="ts">
import InfoBoard from '@/components/InfoBoard/index.vue'
import SearchInput from '@/components/SearchInput/index.vue'
import Navigation from '@/components/Navigation/index.vue'
import Battery from '@/components/Battery/index.vue'
import LinkBox from '@/components/LinkBox/index.vue'
import Weather from '@/components/Weather/index.vue'
import MorningBg from '@/assets/image/bg/bg.jpg'
import NightBg from '@/assets/image/bg/bg_night.png'
import { ref, reactive, onMounted, onUnmounted, useTemplateRef, computed } from 'vue'
import { type INFORMATION } from '@/libs/const/index.ts'
import { getWeatherData } from '@/libs/weather'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const LinkBoxRef = useTemplateRef('LinkBoxRef')
const NavigationRef = useTemplateRef('NavigationRef')
const WeatherRef = useTemplateRef('WeatherRef')
const timer = ref<number | null>(null)
const linkBoxShow = ref<boolean>(false)
const information = reactive<INFORMATION>({
  season: '',
  week: '',
  time: {
    hour: '00',
    minute: '00',
    second: '00',
    isNight: false,
  },
  weather: {
    today: {
      iconKey: 'Default',
      weatherKey: ''
    },
    tomorrow: {
      iconKey: 'Default',
      weatherKey: ''
    }
  }
})

// 根据时间段切换背景
const getBodyBg = computed(() => {
  return {
    backgroundImage: `url(${ information.time.isNight ? NightBg : MorningBg })`
  }
})

// 初始化
const init = (): void => {
  startTime() // 开始时间
  getWeather() // 获取天气
}
// 处理标签页可见性变化,节省性能
const handleVisibilityChange = (): void => {
  if (document.hidden) {
    stopTime()
    WeatherRef.value?.pause()
  } else {
    startTime()
    WeatherRef.value?.start()
    toRefreshList()
  }
}
// 开始时间
const startTime = () => {
  getTime()
  timer.value = window.setInterval(getTime, 1000)
}
// 停止时间
const stopTime = () => {
  timer.value && clearInterval(timer.value)
}
// 获取最新时间(每秒更新)
const getTime = (): void => {
  const now = new Date()
  getWeek(now.getDay()) // 获取当前周
  getSeasonByMonth(now.getMonth()) // 获取当前季节
  const pad = (n: number): string => n.toString().padStart(2, '0') // 填充0
  information.time.hour = pad(now.getHours())
  information.time.minute = pad(now.getMinutes())
  information.time.second = pad(now.getSeconds())
  information.time.isNight = now.getHours() <= 5 || now.getHours() >= 19
}
// 获取当前季节
const getSeasonByMonth = (month: number): void => {
  const seasons: string[] = [
    'winter', // 0 - Jan
    'winter', // 1 - Feb
    'spring', // 2 - Mar
    'spring', // 3 - Apr
    'spring', // 4 - May
    'summer', // 5 - Jun
    'summer', // 6 - Jul
    'summer', // 7 - Aug
    'fall', // 8 - Sep
    'fall', // 9 - Oct
    'fall', // 10 - Nov
    'winter'  // 11 - Dec
  ]
  information.season = seasons[month]
}
// 获取当前周
const getWeek = (day: number): void => {
  const weekKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  information.week = t(`week.${weekKeys[day]}`)
}
// 获取天气
const getWeather = async (): Promise<any> => {
  try {
    information.weather = await getWeatherData()
  } catch (error) {
    console.log(error)
  }
}
// 打开linkBox弹窗
const handleOpenLinkBox = (): void => {
  LinkBoxRef.value?.show()
}
// 刷新常用列表
const toRefreshList = () => {
  NavigationRef.value?.query()
}

onMounted(() => {
  init()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopTime()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
<style lang="less" scoped>

</style>
