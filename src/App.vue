<template>
  <div class="flex justify-center w-screen h-screen relative overflow-hidden">
    <!--信息看板-->
    <InfoBoard :information="information" />
    <!--输入框-->
    <SearchInput />
    <!--快捷导航栏（开发中）-->
    <Navigation />
    <!--电量-->
    <Battery />
  </div>
</template>

<script setup lang="ts">
import InfoBoard from '@/components/InfoBoard/index.vue'
import SearchInput from '@/components/SearchInput/index.vue'
import Navigation from '@/components/Navigation/index.vue'
import Battery from '@/components/Battery/index.vue'
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { type INFORMATION, WEEK_LIST } from '@/libs/const'
import { byGaoDe } from '@/libs/weather'

const timer = ref<number | null>(null)
const information = reactive<INFORMATION>({
  season: '',
  week: '',
  time: {
    hour: '00',
    minute: '00',
    second: '00'
  },
  weather: {
    today: {
      zh: '默认',
      en: 'Default'
    },
    tomorrow: {
      zh: '默认',
      en: 'Default'
    }
  }
})

// 初始化
const init = (): void => {
  startTime() // 开始时间
  getWeather()
}
// 处理标签页可见性变化,节省性能
const handleVisibilityChange = (): void => {
  if (document.hidden) {
    stopTime()
  } else {
    startTime()
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
}
// 获取当前季节
const getSeasonByMonth = (month: number): void => {
  const seasons: string[] = [ 'winter', 'winter', 'spring', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn' ]
  information.season = seasons[month]
}
// 获取当前周
const getWeek = (day: number): void => {
  information.week = WEEK_LIST[day]
}
// 获取天气
const getWeather = async (): Promise<any> => {
  information.weather = await byGaoDe()
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
