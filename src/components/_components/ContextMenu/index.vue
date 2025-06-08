<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed z-[9999] bg-[#EFBD73] py-1 w-25 stardew-border stardew-font"
         :style="{top: `${contextMenu.y}px`, left: `${contextMenu.x}px`}">
      <div class="px-2 py-1 hover:bg-[#f1e6c8] pointer context-menu-item" @click="handleClick('on-edit')">
        编辑
      </div>
      <div v-if="props.showDelete" class="px-2 py-1 hover:bg-[#f1e6c8] pointer context-menu-item text-[#d32f2f] hover:text-[#b71c1c]" @click="handleClick('on-delete')">
        删除
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  showDelete: {
    type: Boolean,
    default: true
  },
})

const emit = defineEmits([ 'on-edit', 'on-delete' ])
const visible = ref<boolean>(false)
const tempDetail = ref<any>({})
const contextMenu = ref<{
  x: number,
  y: number
}>({
  x: 0,
  y: 0
})

const show = ({e, detail}: { e: MouseEvent, detail: any }) => {
  initPosition(e)
  tempDetail.value = detail
  visible.value = true
}
const hide = () => {
  visible.value = false
}
const handleClick = (key: 'on-edit' | 'on-delete') => {
  emit(key, tempDetail.value)
}

const initPosition = (e: MouseEvent) => {
  const menuWidth = 140
  const menuHeight = 130
  const safetyMargin = 20

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let x = e.clientX
  let y = e.clientY

  if (x + menuWidth > viewportWidth - safetyMargin) {
    x = viewportWidth - menuWidth - safetyMargin
  }
  if (x < safetyMargin) {
    x = safetyMargin
  }
  if (y + menuHeight > viewportHeight - safetyMargin) {
    y = viewportHeight - menuHeight - safetyMargin
  }
  if (y < safetyMargin) {
    y = safetyMargin
  }
  contextMenu.value = {
    x,
    y
  }
}

onMounted(() => {
  document.addEventListener('click', hide)
})

onUnmounted(() => {
  document.removeEventListener('click', hide)
})

defineExpose({
  show,
  hide
})
</script>

<style lang="less" scoped>
</style>
