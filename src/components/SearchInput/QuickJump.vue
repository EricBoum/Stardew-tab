<template>
  <ul class="absolute w-full top-[60px] left-0 shadow-2xl">
    <li class="quick-item h-[40px] flex items-center bg-[#EFBD73] p-1 pointer" v-for="(item,index) in props.list" :key="index" @click="jump(item)">
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
.quick-item {
  transition: 0.3s;
  &:hover {
    background-color: #e2aa56;
  }
}
</style>
