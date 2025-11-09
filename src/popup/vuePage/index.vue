<template>
  <div class="popup-box px-6 py-2 w-[400px] stardew-border stardew-font relative">
    <div v-if="showMask" class="w-full h-full top-0 left-0 absolute z-[2] bg-[#C87529] flex flex-col items-center justify-center text-[#ffffff]">
      <img class="w-[50px] mb-[20px]" src="@/assets/image/star.png" alt="">
      {{ $t('message.addSuccess') }}
    </div>
    <div class="mb-2">
      <label class="form-label">{{ $t('form.name') }}</label>
      <StardewInput v-model="formData.name" :placeholder="$t('form.placeholderName')" />
    </div>
    <div class="mb-2">
      <label class="form-label">{{ $t('common.category') }}</label>
      <StardewSelect v-model="formData.parentId" :options="typeOptions" :placeholder="$t('form.placeholderSelectCategory')" />
    </div>
    <div class="mb-2">
      <label class="form-label">{{ $t('form.url') }}</label>
      <StardewInput v-model="formData.url" :placeholder="$t('form.placeholderUrl')" @blur="fetchFavicon" />
    </div>
    <div class="mb-2">
      <label class="form-label">{{ $t('form.description') }}</label>
      <StardewInput v-model="formData.desc" type="textarea" rows="2" :placeholder="$t('form.placeholderDesc')" />
    </div>
    <div>
      <div class="flex">
        <label class="mr-5 block pointer text-[16px] font-medium mb-1" :class="[formData.type === item.type? 'text-[#ffffff]': 'text-[#ffffffb0]']" v-for="(item, index) in ICON_TYPE_LIST" :key="index" @click="changeIconType(item)">
          {{ item.label }}
        </label>
      </div>
      <div class="flex items-center bg-[#f7f1df] p-2 stardew-input-container">
        <div class="w-[60px] h-[60px] mr-3 flex items-center justify-center icon-preview">
          <template v-if="formData.type === 'img'">
            <img v-if="formData.logo" :src="formData.logo" class="max-w-full max-h-full object-contain" alt="logo" />
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-200 rounded-full text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </template>
          <template v-else>
            <div class="w-full h-full flex items-center justify-center rounded-full" :style="{ backgroundColor: formData.bgColor, color: formData.textColor }">
              {{ formData.name.substring(0, 3) }}
            </div>
          </template>
        </div>
        <div class="flex-1">
          <div class="flex space-x-2" v-if="formData.type === 'img'">
            <button @click="useDefaultIcon" class="text-sm bg-[#CF802F] hover:bg-[#DF9040] text-white px-3 py-1 stardew-small-button pointer">
              {{ $t('dialog.getIcon') }}
            </button>
            <button @click="formData.logo = ''" class="text-sm bg-[#B86646] hover:bg-[#C87656] text-white px-3 py-1 stardew-small-button pointer">
              {{ $t('common.clear') }}
            </button>
          </div>
          <div v-else class="flex">
            <div class="flex items-center text-[12px]">
              {{ $t('form.background') }}：<input type="color" v-model="formData.bgColor">
            </div>
            <div class="flex items-center text-[12px] ml-5">
              {{ $t('form.text') }}：<input type="color" v-model="formData.textColor">
            </div>
          </div>
        </div>
      </div>
      <StardewInput class="mt-[10px]" v-if="formData.type === 'img'" v-model="formData.logo" :placeholder="getUrlPlaceholder" />
    </div>
    <div class="flex flex-col items-center justify-center space-x-4">
      <span :class="[showHint? 'opacity-100': 'opacity-0']" class="h-[20px] my-[3px] text-[#ffffff] text-[12px]">{{ $t('message.categoryFull') }}</span>
      <button @click="save" class="stardew-button w-1/2">
        {{ $t('common.save') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import StardewInput from '@/components/_components/StardewInput/index.vue'
import StardewSelect from '@/components/_components/StardewSelect/index.vue'
import { computed, onMounted, ref } from 'vue'
import type { LINK_ITEM_TYPE } from '@/libs/const/type.ts'
import { getLinkData, setLinkData, getCommonLinkData, setCommonLinkData } from '@/libs/index.ts'
import { MAX_COMMON_NUM, MAX_CURRENT_NUM } from '@/libs/const/index.ts'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

interface ICON_TYPE {
  type: string,
  label: string
}

interface TYPE_OPTIONS {
  id: string;
  name: string;
  list: any[]
}

const emit = defineEmits([ 'on-commit' ])
// 改为 computed 确保语言切换时 label 能响应式更新
const ICON_TYPE_LIST = computed(() => [
  {
    type: 'img',
    label: $t('form.imageIcon')
  },
  {
    type: 'text',
    label: $t('form.textIcon')
  }
])
const formData = ref<LINK_ITEM_TYPE>({
  parentId: '',
  id: '',
  name: '',
  url: '',
  logo: '',
  desc: '',
  type: 'img',
  bgColor: '#C87529',
  textColor: '#FFCF46'
})
const typeOptions = ref<{ id: string; name: string; list: any }[]>([])
const showMask = ref<boolean>(false) // 是否展示提交成功弹窗
const showHint = ref<boolean>(false) // 是否展示提示信息
const getUrlPlaceholder = computed(() => {
  if (formData.value.type === 'img') {
    return $t('form.placeholderIconUrl')
  } else {
    return $t('form.placeholderIconText')
  }
})

const init = async () => {
  const res = await getLinkData()
  const commonRes = await getCommonLinkData()
  typeOptions.value = [ {id: 'common', name: $t('link.common'), list: commonRes || []}, ...res as TYPE_OPTIONS[] ]
  const tabDetail = await chrome.tabs.query({active: true, currentWindow: true})
  const {title, url} = tabDetail[0] as { title: string; url: string }
  formData.value = {
    parentId: 'common',
    id: '',
    name: title,
    url: url,
    logo: `https://t0.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${ url }&size=64`,
    desc: '',
    type: 'img',
    bgColor: '#C87529',
    textColor: '#FFCF46'
  }
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
const save = async (): Promise<undefined> => {
  if (checkForm()) {
    showHint.value = true
    return
  } else {
    showHint.value = false
  }
  let temp = {
    ...formData.value
  }
  if (!formData.value.id) {
    temp.id = Date.now()
  }
  if (formData.value.parentId === 'common') {
    await setCommonLinkData(temp)
  } else {
    await setLinkData(temp)
  }
  showMask.value = true
  setTimeout(() => {
    showMask.value = false
    window.close()
  }, 1500)
}

// 校验
const checkForm = () => {
  const currentOption = typeOptions.value.find(item => item.id === formData.value.parentId)
  const currentList = currentOption ? currentOption?.list : []
  // 判断不同类型列表下长度是否已达上限
  if (formData.value.parentId === 'common') {
    return currentList.length >= MAX_COMMON_NUM
  } else {
    return currentList.length >= MAX_CURRENT_NUM
  }
}

// 获取默认favicon
const getDefaultFavicon = (url: string): string => {
  try {
    return `https://t0.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${ url }&size=64`
  } catch (e) {
    return ''
  }
}

// 使用默认图标
const useDefaultIcon = (): void => {
  if (formData.value.url && isValidUrl(formData.value.url)) {
    formData.value.logo = getDefaultFavicon(formData.value.url)
  }
}

// 尝试获取网站favicon
const fetchFavicon = (): void => {
  if (formData.value.url && isValidUrl(formData.value.url)) {
    useDefaultIcon()
  }
}

// 修改图标类型
const changeIconType = (item: ICON_TYPE): void => {
  formData.value.type = item.type as 'text' | 'img'
}

onMounted(() => {
  init()
})

</script>

<style lang="less" scoped>
@import "@/styles/common";
.popup-box {
  background-image: url('@/assets/image/bg/popup_bg.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  .form-label {
    display: block;
    color: #ffffff;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
}
.close-box {
  .dialog-close-button();
}
.stardew-input-container {
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
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
</style>
