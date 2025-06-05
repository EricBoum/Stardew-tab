<template>
  <ul class="Tabs absolute bottom-full flex left-[10px]">
    <li class="flex min-[100px]:" :class="{'translate-y-[7px]': item.id === tabChoose}" v-for="(item, index) in props.list" :key="index" @click="handleChoose(item)">
      <img class="pointer" src="@/assets/image/link/tab-left.png" alt="">
      <div class="pointer center-value h-[48px] flex items-center pt-[10px] px-[10px]">
        {{ item.name }}
      </div>
      <img class="pointer" src="@/assets/image/link/tab-right.png" alt="">
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TAB_ITEM } from '@/libs/const/type.ts'

const props = defineProps<{
  list: TAB_ITEM[]
}>()

const tabChoose = ref<string | number>('1')

const handleChoose = (item: TAB_ITEM) => {
  tabChoose.value = item.id
}
</script>

<style lang="less" scoped>
.Tabs {
  .center-value {
    background-image: url("@/assets/image/link/tab-center.png");
    background-repeat: repeat-x;
    background-size: auto 100%;
  }
}
</style>
