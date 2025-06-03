<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[99999]" style="background-color: rgba(0,0,0,0.6);">
      <div class="site-dialog-container relative">
        <div class="close-button" @click="close">
          <img src="@/assets/image/app/close.png" alt="关闭" class="close-icon">
        </div>
        <div class="site-dialog bg-[#EFBD73] p-6 w-[400px] max-w-[90vw] stardew-border stardew-font">
          <h3 class="text-xl text-[#4e3623] font-bold mb-4 text-center stardew-font dialog-title">{{ editMode ? '编辑网站' : '添加网站' }}</h3>
          
          <div class="mb-4">
            <label class="block text-[#4e3623] text-sm font-medium mb-1">名称</label>
            <input v-model="site.name" 
                   class="w-full bg-[#f7f1df] px-3 py-2 stardew-input" 
                   placeholder="网站名称" />
          </div>
        
          <div class="mb-4">
            <label class="block text-[#4e3623] text-sm font-medium mb-1">网址</label>
            <input v-model="site.url" 
                   class="w-full bg-[#f7f1df] px-3 py-2 stardew-input" 
                   placeholder="https://example.com" 
                   @blur="fetchFavicon" />
          </div>

          <div class="mb-4">
            <label class="block text-[#4e3623] text-sm font-medium mb-1">描述</label>
            <textarea v-model="site.desc" 
                   class="w-full bg-[#f7f1df] px-3 py-2 stardew-input" 
                   placeholder="网站描述（可选）"
                   rows="2"></textarea>
          </div>
          
          <div class="mb-5">
            <label class="block text-[#4e3623] text-sm font-medium mb-1">图标</label>
            <div class="flex items-center bg-[#f7f1df] p-2 stardew-input-container">
              <div class="w-[40px] h-[40px] mr-3 flex items-center justify-center icon-preview">
                <img v-if="site.logo" :src="site.logo" class="max-w-full max-h-full object-contain" />
                <div v-else class="w-full h-full flex items-center justify-center bg-gray-200 rounded-full text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <div class="flex space-x-2">
                  <button @click="useDefaultIcon" class="text-sm bg-[#CF802F] hover:bg-[#DF9040] text-white px-3 py-1 stardew-small-button">
                    获取图标
                  </button>
                  <button @click="site.logo = ''" class="text-sm bg-[#B86646] hover:bg-[#C87656] text-white px-3 py-1 stardew-small-button">
                    清除
                  </button>
                </div>
              </div>
            </div>
            <input v-model="site.logo" 
                   class="mt-2 w-full bg-[#f7f1df] px-3 py-2 text-xs stardew-input" 
                   placeholder="自定义图标URL" />
          </div>
          
          <div class="flex justify-center space-x-4">
            <button @click="save" 
                    class="px-20 py-2 bg-[#CF802F] hover:bg-[#DF9040] text-white stardew-button">
              {{ editMode ? '保存' : '添加' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  editMode: boolean
  siteData: {
    name: string
    url: string
    logo: string
    desc?: string
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [siteData: { name: string, url: string, logo: string, desc?: string }]
}>()

// 创建本地副本，避免直接修改props
const site = ref({
  name: '',
  url: '',
  logo: '',
  desc: ''
})

// 当props中的siteData变化时，更新本地副本
watch(() => props.siteData, (newVal) => {
  site.value = { ...newVal }
}, { immediate: true, deep: true })


// 校验URL
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// 关闭对话框
function close() {
  emit('update:modelValue', false)
}

// 保存网站
function save() {
  emit('save', {
    name: site.value.name.trim(),
    url: site.value.url.trim(),
    logo: site.value.logo || getDefaultFavicon(site.value.url),
    desc: site.value.desc?.trim()
  })
  
  close()
}

// 获取默认favicon
function getDefaultFavicon(url: string): string {
  try {
    return `https://t0.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=32`;
  } catch (e) {
    return '';
  }
}

// 使用默认图标
function useDefaultIcon() {
  if (site.value.url && isValidUrl(site.value.url)) {
    site.value.logo = getDefaultFavicon(site.value.url);
  }
}

// 尝试获取网站favicon
function fetchFavicon() {
  if (site.value.url && isValidUrl(site.value.url) && !site.value.logo) {
    useDefaultIcon();
  }
}
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
  cursor: pointer;
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
