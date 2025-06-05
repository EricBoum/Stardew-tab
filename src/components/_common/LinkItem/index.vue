<template>
  <div class="w-full h-full p-[3px]">
    <img v-if="detail.type === 'img'" class="w-full h-full p-[5px] z-[5] object-contain transition-all pointer" :src="detail.logo" :alt="detail.name">
    <div v-else-if="detail.type === 'text'" class="w-full h-full flex items-center justify-center rounded-full pointer" :style="{ backgroundColor: detail.bgColor, color: detail.textColor }">
      {{ detail.name.substring(0,2) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { type LINK_ITEM_TYPE } from '@/libs/const/type.ts'

defineProps<{
  detail: LINK_ITEM_TYPE
}>()
</script>

<style lang="less" scoped>
</style>
