<template>
  <div class="w-screen h-screen fixed left-0 top-0">
    <canvas ref="weatherCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, useTemplateRef, watch, computed, onUnmounted } from 'vue'
import { createRainEffect } from '@/libs/weatherCanvas/rain.ts'
import { createSnowEffect } from '@/libs/weatherCanvas/snow.ts'
import { resolveWeatherEffect } from '@/libs/weatherCanvas/effectMap'
import type { WeatherEffectController } from '@/libs/weatherCanvas/types'
import type { INFORMATION } from '@/libs/const'

const props = defineProps<{
  information: INFORMATION
}>()

const canvasContent = shallowRef<WeatherEffectController | null>(null)

const getWeather = computed(() => {
  return props.information.weather.today.weatherKey
})

// 指定模板引用元素类型，避免后续强制断言
const weatherCanvas = useTemplateRef<HTMLCanvasElement>('weatherCanvas')

const init = () => {
  if (!weatherCanvas.value) {
    return
  }
  destroy()
  // 根据 iconCode 动态渲染雨 / 雪效果，并按强度调整参数
  const {type, options} = resolveWeatherEffect(getWeather.value)

  if (type === 'rain') {
    canvasContent.value = createRainEffect(weatherCanvas.value, options)
  } else if (type === 'snow') {
    canvasContent.value = createSnowEffect(weatherCanvas.value, options)
  }
}

const start = () => {
  if (!canvasContent.value) {
    return
  }
  canvasContent.value.start()
}
const pause = () => {
  if (!canvasContent.value) {
    return
  }
  canvasContent.value.pause()
}
const destroy = () => {
  if (!canvasContent.value) {
    return
  }
  canvasContent.value.destroy()
  canvasContent.value = null
}


watch(getWeather, () => {
  init()
})

onUnmounted(() => {
  destroy()
})

defineExpose({
  start,
  pause,
  destroy
})
</script>

<style lang="less" scoped>
</style>
