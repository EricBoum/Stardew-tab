<template>
  <div class="flex justify-center w-screen h-screen relative overflow-hidden">
    <!--信息看板-->
    <InfoBoard :information="information" />
    <!--输入框-->
    <SearchInput />
    <!--草地-->
    <!--<GrassLand />-->
    <!--电量-->
    <Battery />
  </div>
</template>

<script setup lang="ts">
import InfoBoard from '@/components/InfoBoard/index.vue'
import SearchInput from '@/components/SearchInput/index.vue'
// import GrassLand from '@/components/GrassLand/index.vue'
import Battery from '@/components/Battery/index.vue'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { type INFORMATION, WEEK_LIST } from '@/libs/const'

const timer = ref<number | null>(null)
const information = reactive<INFORMATION>({
  season: '',
  week: '',
  time: {
    hour: '00',
    minute: '00',
    second: '00'
  }
})

// 初始化
const init = (): void => {
  const now = new Date()
  getWeek(now.getDay()) // 获取当前周
  getSeasonByMonth(now.getMonth()) // 获取当前季节
  startTime() // 开始时间
}
// 处理标签页可见性变化,节省性能
const handleVisibilityChange = (): void => {
  if (document.hidden) {
    stopTime()
  } else {
    startTime()
  }
}

// 获取当前季节
const getSeasonByMonth = (month: number): void => {
  const seasons = [ 'winter', 'winter', 'spring', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn' ]
  information.season = seasons[month]
}

// 获取当前周
const getWeek = (day: number): void => {
  information.week = WEEK_LIST[day]
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
// 获取时间(每秒更新)
const getTime = (): void => {
  const now = new Date()
  const pad = (n: number): string => n.toString().padStart(2, '0') // 填充0
  information.time.hour = pad(now.getHours())
  information.time.minute = pad(now.getMinutes())
  information.time.second = pad(now.getSeconds())
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
