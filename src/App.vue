<template>
  <div class="flex items-center justify-center w-screen h-screen relative overflow-hidden">
    <!--输入框-->
    <SearchInput />
    <!--草地-->
    <!--<GrassLand />-->
    <!--电量-->
    <Battery />
  </div>
</template>

<script setup lang="ts">
import SearchInput from '@/components/SearchInput/index.vue'
// import GrassLand from '@/components/GrassLand/index.vue'
import Battery from '@/components/Battery/index.vue'
</script>
<style lang="less" scoped>

</style>
