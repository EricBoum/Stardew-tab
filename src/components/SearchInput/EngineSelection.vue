<template>
  <ul class="EngineSelection absolute -top-[46px] left-0 flex items-center">
    <li :class="['w-[30px]', 'h-[30px]', 'mr-[15px]', 'transition-[3s]', localValue.name === item.name? 'opacity-100': 'opacity-30']" v-for="(item, index) in SEARCH_ENGINES" :key="index" @click="chooseEngines(item)">
      <img class="w-full h-full pointer" :src="item.logo" alt="">
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SEARCH_ENGINES, type SEARCH_ITEM } from '@/libs/const'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => SEARCH_ENGINES[0]
  }
})
const emit = defineEmits([ 'update:modelValue' ])
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const chooseEngines = (item: SEARCH_ITEM) => {
  localValue.value = item
}
</script>

<style lang="less" scoped>

</style>
