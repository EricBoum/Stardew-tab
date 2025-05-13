<template>
  <div class="SearchInput w-1/2 h-[50px] bg-[#EFBD73] relative">
    <EngineSelection v-model="engineValue" />
    <StardewInput v-model="inputValue" @stardewEnter="toSearch" />
    <QuickJump />
  </div>
</template>

<script setup lang="ts">
import StardewInput from './StardewInput.vue'
import EngineSelection from './EngineSelection.vue'
import QuickJump from './QuickJump.vue'
import { ref } from 'vue'
import { SEARCH_ENGINES, type SEARCH_ITEM } from '@/libs/const'

const engineValue = ref<SEARCH_ITEM>(SEARCH_ENGINES[0])
const inputValue = ref<string>('')

const toSearch = () => {
  window.open(`${ engineValue.value.url }${ inputValue.value }`)
}
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
