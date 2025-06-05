<template>
  <div class="popup-content flex flex-col items-center absolute w-[400px] h-[550px] z-99999">
    <div class="w-[260px] flex justify-between mt-[60px]">
      <div class="logo-box pointer w-[90px] h-[90px]">

      </div>
      <div class="logo-box pointer w-[90px] h-[90px]">
        <img v-if="netImage" class="w-full h-full p-[10px]" :src="netImage" alt="">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const netImage = ref<string>('')

// 自动获取 favicon 图标并赋值给 netImage
const fetchFavicon = async (pageUrl: string) => {
  try {
    const domain = new URL(pageUrl).origin
    netImage.value = `https://www.google.com/s2/favicons?domain=${ domain }&sz=64`
  } catch (error) {
    console.error('获取 favicon 失败', error)
  }
}

onMounted(() => {
  // 获取当前页面的 url
  const currentUrl = window.location.href
  // 调用 fetchFavicon 函数获取 favicon 图标
  fetchFavicon(currentUrl)
})

</script>

<style lang="less" scoped>
.popup-content {
  background-image: url("@/assets/image/popup/popup-bg.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  .logo-box {
    background-image: url("@/assets/image/popup/border_default.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
}
</style>
