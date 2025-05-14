<template>
  <ul class="absolute w-full top-[60px] left-0">
    <li class="h-[30px] bg-[#EFBD73] p-1" v-for="(item,index) in props.list" :key="index" @click="jump(item)">
      {{ item.title }}
    </li>
  </ul>
</template>

<script setup lang="ts">
interface Item {
  title: string
}

const props = defineProps<{
  list: Item[]
}>()
const emit = defineEmits<{
  (e: 'jump', item: Item): void
}>()

const jump = (item: Item) => {
  emit('jump', item)
}
</script>

<style lang="less" scoped>
</style>
