<template>
  <StardewDialog v-model="visible">
    <template #default>
      <div class="relative">
        <div class="close-button" @click="hide">
          <img src="@/assets/image/link/close.png" alt="关闭" class="close-icon pointer">
        </div>
        <div class="site-dialog bg-[#EFBD73] p-6 w-[400px] max-w-[90vw] stardew-border stardew-font">
          <h3 class="text-xl text-[#4e3623] font-bold mb-4 text-center stardew-font dialog-title">
            {{ isEdit ? '编辑网站' : '添加网站' }}</h3>

          <div class="mb-3">
            <label class="block text-[#4e3623] text-sm font-medium mb-1">名称</label>
            <input v-model="site.name"
                   class="w-full bg-[#f7f1df] px-3 py-2 stardew-input"
                   placeholder="请输入网站名称" />
          </div>

          <div class="mb-3">
            <label class="block text-[#4e3623] text-sm font-medium mb-1">网址</label>
            <input v-model="site.url"
                   class="w-full bg-[#f7f1df] px-3 py-2 stardew-input"
                   placeholder="请输入网站链接"
                   @blur="fetchFavicon" />
          </div>

          <div class="mb-3">
            <label class="block text-[#4e3623] text-sm font-medium mb-1">描述</label>
            <textarea v-model="site.desc"
                      class="w-full bg-[#f7f1df] px-3 py-2 stardew-input"
                      placeholder="请输入网站描述（可选）"
                      rows="2"></textarea>
          </div>

          <div class="mb-5">
            <div class="flex">
              <label class="mr-5 block pointer text-sm font-medium mb-1" :class="[site.type === item.type? 'text-[#4e3623]': 'text-[#A19187]']" v-for="(item, index) in ICON_TYPE_LIST" :key="index" @click="changeIconType(item)">
                {{ item.label }}
              </label>
            </div>
            <div class="flex items-center bg-[#f7f1df] p-2 stardew-input-container">
              <div class="w-[60px] h-[60px] mr-3 flex items-center justify-center icon-preview">
                <template v-if="site.type === 'img'">
                  <img v-if="site.logo" :src="site.logo" class="max-w-full max-h-full object-contain" alt="logo" />
                  <div v-else class="w-full h-full flex items-center justify-center bg-gray-200 rounded-full text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </template>
                <template v-else>
                  <div class="w-full h-full flex items-center justify-center rounded-full" :style="{ backgroundColor: site.bgColor, color: site.textColor }">
                    {{ site.name.substring(0, 3) }}
                  </div>
                </template>
              </div>
              <div class="flex-1">
                <div class="flex space-x-2" v-if="site.type === 'img'">
                  <button @click="useDefaultIcon" class="text-sm bg-[#CF802F] hover:bg-[#DF9040] text-white px-3 py-1 stardew-small-button pointer">
                    获取图标
                  </button>
                  <button @click="site.logo = ''" class="text-sm bg-[#B86646] hover:bg-[#C87656] text-white px-3 py-1 stardew-small-button pointer">
                    清除
                  </button>
                </div>
                <div v-else class="flex">
                  <div class="flex items-center text-[12px]">
                    背景：<input type="color" v-model="site.bgColor">
                  </div>
                  <div class="flex items-center text-[12px] ml-5">
                    文字：<input type="color" v-model="site.textColor">
                  </div>
                </div>
              </div>
            </div>
            <input v-if="site.type === 'img'" v-model="site.logo"
                   class="mt-2 w-full bg-[#f7f1df] px-3 py-2 text-xs stardew-input"
                   :placeholder="getUrlPlaceholder" />
          </div>

          <div class="flex justify-center space-x-4">
            <button @click="save"
                    class="px-20 py-2 bg-[#CF802F] hover:bg-[#DF9040] text-white stardew-button pointer">
              {{ isEdit ? '保存' : '添加' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </StardewDialog>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import { computed, ref } from 'vue'
import type { LINK_ITEM_TYPE } from '@/libs/const/type.ts'

interface ICON_TYPE {
  type: string,
  label: string
}
const ICON_TYPE_LIST: ICON_TYPE[] = [
  {
    type: 'img',
    label: '图片图标'
  },
  {
    type: 'text',
    label: '文字图标'
  }
]
const site = ref<LINK_ITEM_TYPE>({
  name: '',
  url: '',
  logo: '',
  desc: '',
  type: 'img',
  bgColor: '#C87529',
  textColor: '#FFCF46'
})
const visible = ref<boolean>(false) // 弹窗显示状态
const isEdit = ref<boolean>(false)
const getUrlPlaceholder = computed(() => {
  if (site.value.type === 'img') {
    return '请输入图标链接'
  } else {
    return '请输入图标文字'
  }
})

const show = (item: LINK_ITEM_TYPE) => {
  // 先判断当前是新增还是编辑
  if (item.logo) {
    isEdit.value = true
    site.value = item
  } else {
    isEdit.value = false
    site.value = {
      name: '',
      url: '',
      logo: '',
      desc: '',
      type: 'img',
      bgColor: '#C87529',
      textColor: '#FFCF46'
    }
  }
  visible.value = true
}
const hide = () => {
  visible.value = false
}

// 校验URL
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return [ 'http:', 'https:' ].includes(urlObj.protocol)
  } catch (e) {
    return false
  }
}

// 保存网站
const save = (): void => {
  // 判断当前是编辑还是新增
  if (site.value.id) {

  } else {

  }
  hide()
}

// 获取默认favicon
const getDefaultFavicon = (url: string): string => {
  try {
    return `https://t0.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${ url }&size=32`
  } catch (e) {
    return ''
  }
}

// 使用默认图标
const useDefaultIcon = (): void => {
  if (site.value.url && isValidUrl(site.value.url)) {
    site.value.logo = getDefaultFavicon(site.value.url)
  }
}

// 尝试获取网站favicon
const fetchFavicon = (): void => {
  if (site.value.url && isValidUrl(site.value.url) && !site.value.logo) {
    useDefaultIcon()
  }
}

// 修改图标类型
const changeIconType = (item: ICON_TYPE): void => {
  site.value.type = item.type as 'text' | 'img'
}

defineExpose({
  show,
  hide
})
</script>

<style lang="less" scoped>
// 边框
.stardew-border {
  border: 3px solid #CF802F;
  border-radius: 2px;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  outline: 3px solid #552E2B;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
// 字体
.stardew-font {
  font-family: 'StardewValley', sans-serif;
  color: var(--text-color, #4e3623);
}
// 输入框
.stardew-input {
  font-family: 'StardewValley', sans-serif;
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #8ABD39;
  }
}
.stardew-input-container {
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
}
.stardew-button {
  font-family: 'StardewValley', sans-serif;
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  }
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
}
// 小按钮
.stardew-small-button {
  font-family: 'StardewValley', sans-serif;
  border: 1px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  &:hover {
    transform: translateY(-1px);
  }
}
// 关闭按钮
.close-button {
  position: absolute;
  top: -30px;
  right: -20px;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  z-index: 5;
}
.close-button:hover {
  transform: scale(1.1);
}
.close-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
</style>
