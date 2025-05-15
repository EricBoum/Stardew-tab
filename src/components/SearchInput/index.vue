<template>
  <div class="SearchInput w-1/2 h-[50px] mt-[40vh] bg-[#EFBD73] relative">
    <EngineSelection v-model="engineValue" />
    <StardewInput v-model="inputValue" @stardewEnter="toSearch" />
    <QuickJump :list="quickJumpList" @jump="toSearch" />
  </div>
</template>

<script setup lang="ts">
import StardewInput from './StardewInput.vue'
import EngineSelection from './EngineSelection.vue'
import QuickJump from './QuickJump.vue'
import { ref, watch } from 'vue'
import { SEARCH_ENGINES, type SEARCH_ITEM } from '@/libs/const'

const engineValue = ref<SEARCH_ITEM>(SEARCH_ENGINES[0])
const inputValue = ref<string>('')
const quickJumpList = ref<Array<any>>([])

const toSearch = (e: { title: string } = {title: ''}): void => {
  const keyWords = e.title || inputValue.value
  window.open(`${ engineValue.value.url }${ keyWords }`)
}
const getQuickJumpList = (): void => {
  if (!inputValue.value) {
    quickJumpList.value = []
    return
  }
  // 暂时只支持百度搜索推荐
  BaiduSuggest()
}
const BaiduSuggest = (): void => {
  const callbackName = '__baidu_cb'
  const query = encodeURIComponent(inputValue.value)
  const script = document.createElement('script')
  // @ts-ignore
  window[callbackName] = (response: any): void => {
    if (response?.s) {
      quickJumpList.value = response.s.map((item: string) => ( {title: item} ))
    } else {
      quickJumpList.value = []
    }
    if (document.body.contains(script)) {
      document.body.removeChild(script)
    }
  }

  script.src = `https://suggestion.baidu.com/su?wd=${ query }&cb=${ callbackName }`
  document.body.appendChild(script)
}

watch(inputValue, () => {
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
  z-index: 999;
}
</style>
