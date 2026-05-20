<template>
  <div class="popup-box px-6 py-2 w-[400px] stardew-border stardew-font relative">
    <div v-if="showMask" class="w-full h-full top-0 left-0 absolute z-[2] bg-[#C87529] flex flex-col items-center justify-center text-[#ffffff]">
      <img class="w-[50px] mb-[20px]" src="@/assets/image/star.png" alt="">
      {{ $t('message.addSuccess') }}
    </div>
    <div class="popup-content">
      <div class="popup-form-row">
        <label class="form-label">{{ $t('form.name') }}</label>
        <StardewInput v-model="formData.name" :placeholder="$t('form.placeholderName')" />
      </div>
      <div class="popup-form-row">
        <label class="form-label">{{ $t('common.category') }}</label>
        <StardewSelect v-model="formData.parentId" :options="typeOptions" :placeholder="$t('form.placeholderSelectCategory')" />
      </div>
      <div class="popup-form-row">
        <label class="form-label">{{ $t('form.url') }}</label>
        <StardewInput v-model="formData.url" :placeholder="$t('form.placeholderUrl')" @blur="fetchFavicon" />
      </div>
      <div class="popup-form-row">
        <label class="form-label">{{ $t('form.description') }}</label>
        <StardewInput v-model="formData.desc" type="textarea" rows="2" :placeholder="$t('form.placeholderDesc')" />
      </div>
      <div class="popup-icon-section">
        <div class="flex flex-wrap gap-x-5">
          <label class="block pointer text-[16px] font-medium mb-1" :class="[currentIconSource === item.source ? 'text-[#ffffff]': 'text-[#ffffffb0]']" v-for="item in ICON_TYPE_LIST" :key="item.source" @click="changeIconType(item)">
            {{ item.label }}
          </label>
        </div>
        <div class="flex items-center bg-[#f7f1df] p-2 stardew-input-container">
          <div class="w-[60px] h-[60px] mr-3 flex items-center justify-center icon-preview">
            <template v-if="currentIconSource !== 'text'">
              <LinkIcon v-if="formData.logo || formData.iconId || formData.builtinIconKey" :detail="formData" />
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
            <div class="flex space-x-2" v-if="currentIconSource === 'favicon'">
              <button type="button" @click="useDefaultIcon(true)" :disabled="isFetchingIcon" class="text-sm bg-[#CF802F] hover:bg-[#DF9040] text-white px-3 py-1 stardew-small-button pointer">
                {{ isFetchingIcon ? $t('pixelIcon.fetchingIcon') : $t('dialog.getIcon') }}
              </button>
              <button type="button" @click="clearIcon" class="text-sm bg-[#B86646] hover:bg-[#C87656] text-white px-3 py-1 stardew-small-button pointer">
                {{ $t('common.clear') }}
              </button>
            </div>
            <div class="flex flex-wrap gap-2" v-else-if="currentIconSource === 'builtin'">
              <p v-if="selectedBuiltinIcon" class="w-full text-[12px] leading-[16px] text-[#7B312A]">
                {{ $t('iconLibrary.selected') }}：{{ selectedBuiltinIcon.name }}
              </p>
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
        <StardewInput class="mt-[10px]" v-if="currentIconSource === 'favicon'" v-model="formData.logo" :placeholder="getUrlPlaceholder" />
        <IconLibraryPicker
          v-if="currentIconSource === 'builtin'"
          class="popup-icon-library mt-[10px]"
          compact
          :selected-key="formData.builtinIconKey"
          max-height="220px"
          @select="selectBuiltinIcon"
        />
      </div>
    </div>
    <div class="popup-actions flex flex-col items-center justify-center space-x-4">
      <span :class="[showHint? 'opacity-100': 'opacity-0']" class="h-[20px] my-[3px] text-[#ffffff] text-[12px]">{{ $t('message.categoryFull') }}</span>
      <button type="button" @click="save" class="stardew-button w-1/2">
        {{ $t('common.save') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import StardewInput from '@/components/_components/StardewInput/index.vue'
import StardewSelect from '@/components/_components/StardewSelect/index.vue'
import IconLibraryPicker from '@/components/_components/IconLibraryPicker/index.vue'
import LinkIcon from '@/components/_common/LinkIcon/index.vue'
import { computed, onMounted, ref } from 'vue'
import type { LINK_ITEM_TYPE } from '@/libs/const/type.ts'
import { getLinkData, setLinkData, getCommonLinkData, setCommonLinkData } from '@/libs/index.ts'
import { MAX_COMMON_NUM, MAX_CURRENT_NUM } from '@/libs/const/index.ts'
import { useI18n } from 'vue-i18n'
import { resolveFavicon } from '@/libs/favicon'
import { BUILTIN_ICON_MAP, type BuiltinIcon } from '@/libs/const/builtinIcons'

const { t: $t } = useI18n()

type IconSource = 'favicon' | 'text' | 'builtin'
let faviconRequestId = 0

interface ICON_SOURCE {
  source: IconSource,
  label: string
}

interface TYPE_OPTIONS {
  id: string;
  name: string;
  list: any[]
}

const emit = defineEmits([ 'on-commit' ])
// 改为 computed 确保语言切换时 label 能响应式更新
const ICON_TYPE_LIST = computed<ICON_SOURCE[]>(() => [
  {
    source: 'favicon',
    label: $t('dialog.getIcon')
  },
  {
    source: 'text',
    label: $t('form.textIcon')
  },
  {
    source: 'builtin',
    label: $t('iconLibrary.title')
  }
])
const formData = ref<LINK_ITEM_TYPE>({
  parentId: '',
  id: '',
  name: '',
  url: '',
  logo: '',
  builtinIconKey: '',
  iconSource: 'favicon',
  desc: '',
  type: 'img',
  bgColor: '#C87529',
  textColor: '#FFCF46'
})
const typeOptions = ref<{ id: string; name: string; list: any }[]>([])
const showMask = ref<boolean>(false) // 是否展示提交成功弹窗
const showHint = ref<boolean>(false) // 是否展示提示信息
const isFetchingIcon = ref<boolean>(false)
const currentIconSource = computed<IconSource>(() => formData.value.iconSource === 'text' ? 'text' : (formData.value.iconSource === 'builtin' ? 'builtin' : 'favicon'))
const selectedBuiltinIcon = computed(() => formData.value.builtinIconKey ? BUILTIN_ICON_MAP.get(formData.value.builtinIconKey) : undefined)
const getUrlPlaceholder = computed(() => {
  if (currentIconSource.value !== 'text') {
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
    logo: '',
    iconId: '',
    builtinIconKey: '',
    iconSource: 'favicon',
    desc: '',
    type: 'img',
    bgColor: '#C87529',
    textColor: '#FFCF46'
  }
  void useDefaultIcon()
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
    ...formData.value,
    type: currentIconSource.value === 'text' ? 'text' : 'img',
    iconSource: currentIconSource.value
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

// 使用默认图标
const useDefaultIcon = async (forceRefresh = false): Promise<void> => {
  if (!formData.value.url || !isValidUrl(formData.value.url)) {
    return
  }
  const requestId = ++faviconRequestId
  isFetchingIcon.value = true
  try {
    const favicon = await resolveFavicon(formData.value.url, {forceRefresh})
    if (requestId !== faviconRequestId || currentIconSource.value !== 'favicon') {
      return
    }
    formData.value.logo = favicon.logo
    formData.value.iconId = favicon.iconId || ''
    formData.value.builtinIconKey = ''
    formData.value.iconSource = 'favicon'
    formData.value.type = 'img'
  } finally {
    if (requestId === faviconRequestId) {
      isFetchingIcon.value = false
    }
  }
}

// 尝试获取网站favicon
const fetchFavicon = async (): Promise<void> => {
  if (currentIconSource.value === 'favicon' && formData.value.url && isValidUrl(formData.value.url)) {
    await useDefaultIcon()
  }
}

// 修改图标类型
const changeIconType = (item: ICON_SOURCE): void => {
  if (item.source !== 'favicon') {
    faviconRequestId += 1
    isFetchingIcon.value = false
  }
  formData.value.iconSource = item.source
  formData.value.type = item.source === 'text' ? 'text' : 'img'
  if (item.source === 'favicon') {
    formData.value.iconId = ''
    formData.value.builtinIconKey = ''
  }
  if (item.source === 'builtin') {
    formData.value.logo = ''
    formData.value.iconId = ''
  }
  if (item.source === 'text') {
    formData.value.logo = ''
    formData.value.iconId = ''
    formData.value.builtinIconKey = ''
  }
}

const clearIcon = () => {
  formData.value.logo = ''
  formData.value.iconId = ''
  formData.value.builtinIconKey = ''
}

const selectBuiltinIcon = (icon: BuiltinIcon) => {
  formData.value.builtinIconKey = icon.key
  formData.value.logo = ''
  formData.value.iconId = ''
  formData.value.type = 'img'
  formData.value.iconSource = 'builtin'
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
.popup-content {
  padding-bottom: 76px;
  padding-right: 4px;
}
.popup-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 400px;
  padding: 4px 24px 8px;
  background: linear-gradient(to top, rgba(80, 48, 44, 0.75), rgba(80, 48, 44, 0));
  box-sizing: border-box;
}
.popup-form-row {
  margin-bottom: 8px;
}
.popup-icon-section {
  padding-bottom: 4px;
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
  &:disabled {
    opacity: 0.55;
    transform: none;
  }
}
</style>
