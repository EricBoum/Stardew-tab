<template>
  <div :class="['SearchInput transition-[0.3s] w-1/2 h-[50px] mt-[29vh] bg-[#EFBD73] relative', getShadow && 'shadow-[0_5px_40px_5px_rgba(255,255,200,0.4)]']">
    <EngineSelection :model-value="selectedEngine" :engines="engines" @update:model-value="onSelectEngine" />
    <SpecialInput v-model="inputValue" @stardewEnter="toSearch" />
    <QuickJump :list="quickJumpList" @jump="toSearch" />
  </div>
</template>

<script setup lang="ts">
import SpecialInput from './SpecialInput.vue'
import EngineSelection from './EngineSelection.vue'
import QuickJump from './QuickJump.vue'
import { ref, watch, onMounted, computed } from 'vue'
import { type INFORMATION } from '@/libs/const/index.ts'
import type { SearchEngine } from '@/libs/const/type'
import { buildSearchUrl } from '@/libs/searchEngines'
import { getSearchSuggestions, type SearchSuggestionItem } from '@/libs/searchSuggestions'
import { useSystemSettings } from '@/hooks/useSystemSettings'
import { useSearchEngines } from '@/hooks/useSearchEngines'

const props = defineProps<{
  information: INFORMATION;
  isNightTheme: boolean;
}>()
const { systemSettings: systemDetail } = useSystemSettings()
const { engines, selectedEngine, init: initEngines, setSelected } = useSearchEngines()
const inputValue = ref<string>('')
const quickJumpList = ref<SearchSuggestionItem[]>([])
let suggestionRequestId = 0

// 保留原有搜索框样式，只让原本的夜间阴影跟随主题模式
const getShadow = computed(() => {
  return props.isNightTheme
})

const toSearch = (e: { title: string } = {title: ''}): void => {
  const keyWords = ( e.title || inputValue.value ).trim()
  const engine = selectedEngine.value
  if (!keyWords || !engine) {
    return
  }
  // Default（chromeSearch）委托浏览器默认引擎；Firefox 无此 API 时兜底跳百度
  if (engine.kind === 'chromeSearch') {
    if (chrome.search?.query) {
      chrome.search.query({
        text: keyWords,
        disposition: systemDetail.value.searchOpenMode === 'currentTab' ? 'CURRENT_TAB' : 'NEW_TAB'
      })
    } else {
      openSearchUrl(`https://www.baidu.com/s?wd=${ encodeURIComponent(keyWords) }`)
    }
    return
  }
  openSearchUrl(buildSearchUrl(engine, keyWords))
}
const openSearchUrl = (url: string): void => {
  if (systemDetail.value.searchOpenMode === 'currentTab') {
    window.location.href = url
    return
  }

  window.open(url)
}
const getQuickJumpList = async (): Promise<void> => {
  const keyword = inputValue.value.trim()
  const requestId = ++suggestionRequestId
  if (!keyword) {
    quickJumpList.value = []
    return
  }

  const provider = selectedEngine.value?.suggestionProvider ?? 'auto'
  const suggestions = await getSearchSuggestions(provider, keyword)
  if (requestId === suggestionRequestId && keyword === inputValue.value.trim()) {
    quickJumpList.value = suggestions
  }
}

const onSelectEngine = (engine: SearchEngine) => {
  // 只持久化选中 id，编辑引擎定义即时生效
  setSelected(engine.id)
}

onMounted(() => {
  initEngines()
})

watch(inputValue, () => {
  getQuickJumpList()
})
watch(selectedEngine, () => {
  getQuickJumpList()
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
