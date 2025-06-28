<template>
  <div class="w-screen h-screen fixed left-0 top-0">
    <canvas ref="weatherCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch, computed } from 'vue'
import { createRainEffect } from '@/libs/weatherCanvas/rain.ts'
import { createSnowEffect } from '@/libs/weatherCanvas/snow.ts'
import type { INFORMATION } from '@/libs/const'

const props = defineProps<{
  information: INFORMATION
}>()

const canvasContent = ref<any>(null)

const getWeather = computed(() => {
  return props.information.weather.today.weatherKey
})

/** 解析 getWeather 的 iconCode，返回 { type, options }，保持响应式 */
const parsedWeather = computed(() => {
  const code = Number(getWeather.value)
  // ===== Rain 300–399 =====
  if (code >= 300 && code < 400) {
    if ([ 300, 305, 309, 313 ].includes(code)) {
      // 小雨
      return {type: 'rain', options: {dropSizeMultiplier: 0.3, rainIntensity: 150}}
    }
    if ([ 306 ].includes(code)) {
      // 中雨
      return {type: 'rain', options: {dropSizeMultiplier: 0.5, rainIntensity: 300}}
    }
    if ([ 307, 308, 310, 311, 312 ].includes(code)) {
      // 大雨
      return {type: 'rain', options: {dropSizeMultiplier: 0.7, rainIntensity: 600}}
    }
    // 暴雨或雷暴
    return {type: 'rain', options: {dropSizeMultiplier: 1, rainIntensity: 800}}
  }
  // ===== Snow 400–499 =====
  if (code >= 400 && code < 500) {
    if ([ 400, 406, 407 ].includes(code)) {
      // 小雪
      return {
        type: 'snow',
        options: {minSize: 2, maxSize: 5, flakeCount: 150, minSpeed: 0.3, maxSpeed: 1.2},
      }
    }
    if ([ 401, 408 ].includes(code)) {
      // 中雪
      return {
        type: 'snow',
        options: {minSize: 3, maxSize: 7, flakeCount: 300, minSpeed: 0.5, maxSpeed: 2},
      }
    }
    // 大雪或暴雪
    return {
      type: 'snow',
      options: {minSize: 4, maxSize: 10, flakeCount: 600, minSpeed: 0.8, maxSpeed: 3},
    }
  }
  return {type: undefined, options: {}}
})

// 指定模板引用元素类型，避免后续强制断言
const weatherCanvas = useTemplateRef<HTMLCanvasElement>('weatherCanvas')

const init = () => {
  if (!weatherCanvas.value) {
    return
  }
  // 根据 iconCode 动态渲染雨 / 雪效果，并按强度调整参数
  const {type, options} = parsedWeather.value

  if (type === 'rain') {
    canvasContent.value = createRainEffect(weatherCanvas.value, {
      ...options
    })
  } else if (type === 'snow') {
    canvasContent.value = createSnowEffect(weatherCanvas.value, {
      ...options
    })
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
}


watch(() => getWeather.value, () => {
  init()
}, {deep: true})

defineExpose({
  start,
  pause,
  destroy
})
</script>

<style lang="less" scoped>
</style>
