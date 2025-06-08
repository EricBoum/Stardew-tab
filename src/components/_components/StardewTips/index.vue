<template>
  <div
    ref="tipRef"
    class="stardew-tips opacity-0 group-hover:opacity-100 absolute transition-opacity duration-200 min-h-[20px]"
    :style="[positionStyle]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tipRef = ref<HTMLElement | null>(null)

const props = defineProps<{
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end'
}>()

const placement = props.placement || 'top'

const positionStyle = ref<Record<string, string>>({})

const updateOffset = () => {
  if (!tipRef.value) return
  const offset = 8
  let style: Record<string, string>
  switch (placement) {
    case 'top':
      style = {
        bottom: `100%`,
        left: '50%',
        transform: `translateX(-50%) translateY(-${ offset }px)`
      }
      break
    case 'top-start':
      style = {
        bottom: `100%`,
        left: '0',
        transform: `translateY(-${ offset }px)`
      }
      break
    case 'top-end':
      style = {
        bottom: `100%`,
        right: '0',
        transform: `translateY(-${ offset }px)`
      }
      break
    case 'bottom':
      style = {
        top: `100%`,
        left: '50%',
        transform: `translateX(-50%) translateY(${ offset }px)`
      }
      break
    case 'bottom-start':
      style = {
        top: `100%`,
        left: '0',
        transform: `translateY(${ offset }px)`
      }
      break
    case 'bottom-end':
      style = {
        top: `100%`,
        right: '0',
        transform: `translateY(${ offset }px)`
      }
      break
    case 'left':
      style = {
        right: `100%`,
        top: '50%',
        transform: `translateX(-${ offset }px) translateY(-50%)`
      }
      break
    case 'left-start':
      style = {
        right: `100%`,
        top: '0',
        transform: `translateX(-${ offset }px)`
      }
      break
    case 'left-end':
      style = {
        right: `100%`,
        bottom: '0',
        transform: `translateX(-${ offset }px)`
      }
      break
    case 'right':
      style = {
        left: `100%`,
        top: '50%',
        transform: `translateX(${ offset }px) translateY(-50%)`
      }
      break
    case 'right-start':
      style = {
        left: `100%`,
        top: '0',
        transform: `translateX(${ offset }px)`
      }
      break
    case 'right-end':
      style = {
        left: `100%`,
        bottom: '0',
        transform: `translateX(${ offset }px)`
      }
      break
    default:
      style = {
        bottom: `100%`,
        left: '50%',
        transform: `translateX(-50%) translateY(-${ offset }px)`
      }
  }
  positionStyle.value = style
}

onMounted(() => {
  updateOffset()
})

</script>

<style scoped>
.stardew-tips {
  pointer-events: none;
  z-index: 50;
  min-width: 0;
  max-width: 120px;
  background: #EFBD73;
  border: 3px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  outline: 2px solid #552E2B;
  font-family: 'StardewValley', sans-serif;
  box-shadow: -2px 2px 0 rgba(0, 0, 0, 0.25);
  image-rendering: pixelated;
  overflow: hidden;
  border-radius: 2px;
  position: absolute;
}

</style>
