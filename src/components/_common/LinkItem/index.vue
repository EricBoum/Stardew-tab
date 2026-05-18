<template>
  <div class="w-full h-full" @click="jump">
    <LinkIcon :detail="detail" />
  </div>
</template>

<script setup lang="ts">
import LinkIcon from '@/components/_common/LinkIcon/index.vue'
import { type LINK_ITEM_TYPE } from '@/libs/const/type.ts'

const props = defineProps<{
  detail: LINK_ITEM_TYPE
}>()

const jump = () => {
  window.open(props.detail.url, '_blank')
}
</script>

<style lang="less" scoped>
</style>
