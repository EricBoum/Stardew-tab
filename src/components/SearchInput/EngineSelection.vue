<template>
  <ul class="EngineSelection absolute -top-[46px] left-0 flex items-center">
    <li
      v-for="item in engines"
      :key="item.id"
      :class="['w-[30px]', 'h-[30px]', 'mr-[15px]', 'transition-[3s]', modelValue?.id === item.id ? 'opacity-100' : 'opacity-30']"
      @click="chooseEngine(item)"
    >
      <img class="w-full h-full object-contain pointer" :src="iconSrcMap[item.id] || ''" :alt="item.name">
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import type { SearchEngine } from '@/libs/const/type'
import { resolveEngineLogo } from '@/libs/searchEngines'
import { getIconObjectUrl } from '@/libs/db/iconRepository'

const props = defineProps<{
  modelValue?: SearchEngine;
  engines: SearchEngine[];
}>()
const emit = defineEmits<{
  'update:modelValue': [ SearchEngine ];
}>()

const iconSrcMap = ref<Record<string, string>>({})
// 记录本组件创建的 object URL，变更/卸载时释放，避免内存泄漏
let objectUrls: string[] = []

const revokeObjectUrls = () => {
  objectUrls.forEach(url => URL.revokeObjectURL(url))
  objectUrls = []
}

// 内置 logo 直接用导入 URL；上传/favicon 存在 IndexedDB 的走 object URL；favicon 有外链则兜底外链
const resolveEngineIcon = async (engine: SearchEngine): Promise<string> => {
  if (engine.iconSource !== 'builtin' && engine.iconId) {
    const objectUrl = await getIconObjectUrl(engine.iconId)
    if (objectUrl) {
      objectUrls.push(objectUrl)
      return objectUrl
    }
  }
  return resolveEngineLogo(engine)
}

const refreshIcons = async (list: SearchEngine[]) => {
  revokeObjectUrls()
  const entries = await Promise.all(
    list.map(async (engine) => [ engine.id, await resolveEngineIcon(engine) ] as const)
  )
  iconSrcMap.value = Object.fromEntries(entries)
}

watch(() => props.engines, (list) => {
  refreshIcons(list ?? [])
}, {immediate: true, deep: true})

onBeforeUnmount(revokeObjectUrls)

const chooseEngine = (item: SearchEngine) => {
  emit('update:modelValue', item)
}
</script>

<style lang="less" scoped>

</style>
