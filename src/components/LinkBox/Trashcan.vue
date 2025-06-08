<template>
  <div
    class="Trashcan absolute top-[190px] -right-[70px] flex flex-col items-center select-none"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover.prevent
    @drop="handleDrop"
  >
    <img
      class="trashcan-lid w-[50px] h-[30px] relative z-[2] transition-[0.2s]"
      src="@/assets/image/link/trashcan-lid.png"
      alt=""
      :class="{ 'flip': isActive }"
    >
    <img class="w-[46px] -translate-y-[29px]" src="@/assets/image/link/trashcan-barrel.png" alt="">
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['on-drop'])

const isActive = ref(false)
const dragCounter = ref(0)

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value++
  if (dragCounter.value === 1) {
    isActive.value = true
  }
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isActive.value = false
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isActive.value = false
  dragCounter.value = 0
  emit('on-drop')
}


</script>

<style lang="less" scoped>
.flip {
  transition: 0.2s;
  transform: rotate(90deg) translate(-30px, -10px);
  transform-origin: center 27px;
}
</style>
