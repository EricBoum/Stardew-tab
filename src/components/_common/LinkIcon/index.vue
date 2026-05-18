<template>
  <div class="w-full h-full p-[3px]">
    <img v-if="detail.type === 'img'" class="w-full h-full p-[5px] z-[5] object-contain transition-all pointer" :src="iconSrc" :alt="detail.name">
    <div v-else-if="detail.type === 'text'" class="w-full h-full flex items-center justify-center rounded-full pointer" :style="{ backgroundColor: detail.bgColor, color: detail.textColor }">
      {{ detail.name.substring(0, SINGLE_LINK_TEXT_LENGTH) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { type LINK_ITEM_TYPE } from '@/libs/const/type.ts'
import { SINGLE_LINK_TEXT_LENGTH } from '@/libs/const'
import { getIconObjectUrl } from '@/libs/db/iconRepository'

const props = defineProps<{
  detail: LINK_ITEM_TYPE
}>()

const iconSrc = ref<string>('')

let currentObjectUrl = ''

const resolveIcon = async () => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = ''
  }

  if (props.detail.iconId) {
    const objectUrl = await getIconObjectUrl(props.detail.iconId)
    if (objectUrl) {
      iconSrc.value = objectUrl
      currentObjectUrl = objectUrl
      return
    }
  }

  iconSrc.value = props.detail.logo || ''
}

watch(() => [props.detail.iconId, props.detail.logo, props.detail.type, props.detail.name], resolveIcon, { immediate: true })

onBeforeUnmount(() => {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
  }
})
</script>

<style lang="less" scoped>
</style>
