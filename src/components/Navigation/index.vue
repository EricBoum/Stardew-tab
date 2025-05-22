<template>
  <div class="Navigation  w-[600px] h-[79px] fixed bottom-[0px] left-1/2 -translate-x-1/2">
    <ul class="flex w-full h-full pt-[30px] px-[30px]">
      <li v-for="(item, index) in NavigationList" :key="index" class="w-[43px] h-[43px] mr-[3px]" @click="jump(item)">
        <img class="w-full h-full p-[5px] object-contain pointer" :src="item.logo" alt="">
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import NavigationList from '@/assets/json/link.json'

interface Item {
  name: string;
  url: string;
}

const jump = (item: Item) => {
  console.log(item)
  window.open(item.url)
}
</script>

<style lang="less" scoped>
.Navigation {
  background-image: url("@/assets/image/app/common_bg.png");
  background-size: 100% auto;
  background-repeat: no-repeat;
}
</style>
