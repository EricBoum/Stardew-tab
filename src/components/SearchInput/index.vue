<template>
  <div :class="['SearchInput transition-[0.3s] w-1/2 h-[50px] mt-[29vh] bg-[#EFBD73] relative', getShadow && 'shadow-[0_5px_40px_5px_rgba(255,255,200,0.4)]']">
    <EngineSelection v-model="engineValue" :information="information" />
    <SpecialInput v-model="inputValue" @stardewEnter="toSearch" />
    <QuickJump :list="quickJumpList" @jump="toSearch" />
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import SpecialInput from './SpecialInput.vue'
import EngineSelection from './EngineSelection.vue'
import QuickJump from './QuickJump.vue'
import { ref, watch, onMounted, computed } from 'vue'
import { type INFORMATION, SEARCH_ENGINES, type SEARCH_ITEM } from '@/libs/const/index.ts'
import { useStorage } from '@/libs/storage'

const props = defineProps<{
  information: INFORMATION
}>()
const engineValue = ref<SEARCH_ITEM>(SEARCH_ENGINES[0])
const inputValue = ref<string>('')
const quickJumpList = ref<Array<any>>([])

// 获取阴影
const getShadow = computed(() => {
  return props.information.time.isNight
})

const toSearch = (e: { title: string } = {title: ''}): void => {
  const keyWords = ( e.title || inputValue.value ).trim()
  if (!keyWords) {
    return
  }
  if (engineValue.value.name === 'Default') {
    if (chrome.search?.query) {
      chrome.search.query({text: keyWords, disposition: 'NEW_TAB'})
    } else {
      // 兼容Firefox fallback 跳转百度
      window.open(`https://www.baidu.com/s?wd=${ encodeURIComponent(keyWords) }`)
    }
  } else {
    window.open(`${ engineValue.value.url }${ keyWords }`)
  }
}
const getQuickJumpList = (): void => {
  if (!inputValue.value) {
    quickJumpList.value = []
    return
  }
  // 暂时只支持百度搜索推荐
  BaiduSuggest()
}

const BaiduSuggest = async (): Promise<void> => {
  if (!inputValue.value) {
    quickJumpList.value = []
    return
  }
  try {
    const proxyUrl = 'https://suggestion.baidu.com/su'
    const temp = {
      p: 3,
      ie: 'UTF-8',
      wd: inputValue.value,
      cb: 'window.baidu.sug'
    }
    const res = await axios.get(proxyUrl, {
      params: temp,
      timeout: 3000
    })
    const match = res.data.match(/window.baidu.sug\(([\s\S]*?)\)/)
    let json = {s: []}

    if (match && match[1]) {
      const fixed = match[1].replace(/(\w+):/g, '"$1":') // 把 q: → "q":
      json = JSON.parse(fixed)
    }
    quickJumpList.value = ( json.s || [] ).map((item: string) => ( {title: item} ))
  } catch (error) {
    console.error('获取百度搜索建议失败:', error)
    quickJumpList.value = []
  }
}

onMounted(async () => {
  // 获取本地存储的用户默认选择的搜索引擎
  const storageEngine = await useStorage().getStorage('engine')
  if (storageEngine) {
    engineValue.value = storageEngine
  }
})

watch(inputValue, () => {
  getQuickJumpList()
})
watch(engineValue, () => {
  // 将默认搜索引擎存入本地
  useStorage().setStorage('engine', engineValue.value)
})
</script>

<style lang="less" scoped>
.SearchInput {
  border: 3px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  outline: 3px solid #552E2B;
  padding: 0 50px 0 10px;
  z-index: 10;
}
</style>
