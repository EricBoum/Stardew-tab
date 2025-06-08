<template>
  <div class="w-full h-full p-[3px]" @click="jump">
    <img v-if="detail.type === 'img'" class="w-full h-full p-[5px] z-[5] object-contain transition-all pointer" :src="detail.logo" :alt="detail.name">
    <div v-else-if="detail.type === 'text'" class="w-full h-full flex items-center justify-center rounded-full pointer" :style="{ backgroundColor: detail.bgColor, color: detail.textColor }">
      {{ detail.name.substring(0, SINGLE_LINK_TEXT_LENGTH) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { type LINK_ITEM_TYPE } from '@/libs/const/type.ts'
import { SINGLE_LINK_TEXT_LENGTH } from '@/libs/const'

const props = defineProps<{
  detail: LINK_ITEM_TYPE
}>()

const jump = () => {
  window.open(props.detail.url, '_blank')
}
</script>

<style lang="less" scoped>
</style>
