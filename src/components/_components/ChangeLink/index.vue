<template>
  <StardewDialog v-model="visible">
    <template #default>
      <div class="relative">
        <div class="close-box" @click="hide">
          <img src="@/assets/image/link/close.png" :alt="$t('common.close')">
        </div>
        <div class="site-dialog bg-[#EFBD73] p-6 w-[520px] max-w-[90vw] stardew-border stardew-font">
          <h3 class="dialog-title">
            {{ isEdit ? $t('dialog.editWebsite') : $t('dialog.addWebsite') }}
          </h3>

          <div class="mb-3">
            <label class="block text-[#4e3623] text-sm font-medium mb-1">{{ $t('form.name') }}</label>
            <StardewInput v-model="formData.name" :placeholder="$t('form.placeholderName')" />
          </div>

          <div class="mb-3">
            <label class="block text-[#4e3623] text-sm font-medium mb-1">{{ $t('form.url') }}</label>
            <StardewInput v-model="formData.url" :placeholder="$t('form.placeholderUrl')" @blur="fetchFavicon" />
          </div>

          <div class="mb-3">
            <label class="block text-[#4e3623] text-sm font-medium mb-1">{{ $t('form.description') }}</label>
            <StardewInput v-model="formData.desc" type="textarea" rows="2" :placeholder="$t('form.placeholderDesc')" />
          </div>

          <div class="mb-5">
            <div class="flex flex-wrap gap-x-5">
              <label class="block pointer text-sm font-medium mb-1" :class="[currentIconSource === item.source ? 'text-[#4e3623]': 'text-[#A19187]']" v-for="item in ICON_SOURCE_LIST" :key="item.source" @click="changeIconSource(item.source)">
                {{ $t(item.label) }}
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
                <div class="flex flex-wrap gap-2" v-if="currentIconSource === 'favicon'">
                  <button type="button" @click="useDefaultIcon(true)" :disabled="isFetchingIcon" class="text-sm bg-[#CF802F] hover:bg-[#DF9040] text-white px-3 py-1 stardew-small-button pointer">
                    {{ isFetchingIcon ? $t('pixelIcon.fetchingIcon') : $t('dialog.getIcon') }}
                  </button>
                  <button type="button" @click="clearIcon" class="text-sm bg-[#B86646] hover:bg-[#C87656] text-white px-3 py-1 stardew-small-button pointer">
                    {{ $t('common.clear') }}
                  </button>
                  <p class="w-full text-[12px] leading-[16px] text-[#7B312A]">
                    {{ $t('pixelIcon.remotePixelizeTip') }}
                  </p>
                </div>
                <div class="flex flex-wrap gap-2" v-else-if="currentIconSource === 'upload'">
                  <button type="button" @click="openUpload" class="text-sm bg-[#CF802F] hover:bg-[#DF9040] text-white px-3 py-1 stardew-small-button pointer">
                    {{ formData.iconId ? $t('common.upload') : $t('pixelIcon.uploadIcon') }}
                  </button>
                  <button type="button" @click="openUploadEditor" :disabled="!formData.iconId" class="text-sm bg-[#CF802F] hover:bg-[#DF9040] text-white px-3 py-1 stardew-small-button pointer">
                    {{ $t('pixelIcon.pixelize') }}
                  </button>
                  <button type="button" @click="clearIcon" class="text-sm bg-[#B86646] hover:bg-[#C87656] text-white px-3 py-1 stardew-small-button pointer">
                    {{ $t('common.clear') }}
                  </button>
                  <input ref="fileInput" class="hidden" type="file" accept="image/*" @change="handleUpload">
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
              class="mt-[10px]"
              :selected-key="formData.builtinIconKey"
              max-height="260px"
              @select="selectBuiltinIcon"
            />
          </div>

          <div class="flex justify-center space-x-4">
            <button type="button" @click="save" class="stardew-button">
              {{ $t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </StardewDialog>
  <PixelIconDialog ref="PixelIconDialogRef" @apply="applyPixelIcon" />
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import StardewInput from '@/components/_components/StardewInput/index.vue'
import PixelIconDialog from '@/components/_components/PixelIconDialog/index.vue'
import IconLibraryPicker from '@/components/_components/IconLibraryPicker/index.vue'
import LinkIcon from '@/components/_common/LinkIcon/index.vue'
import { computed, ref, useTemplateRef } from 'vue'
import type { LINK_ITEM_TYPE } from '@/libs/const/type.ts'
import { useI18n } from 'vue-i18n'
import { getIconBlob, saveIconBlob } from '@/libs/db/iconRepository'
import { resolveFavicon } from '@/libs/favicon'
import { BUILTIN_ICON_MAP, type BuiltinIcon } from '@/libs/const/builtinIcons'

const { t } = useI18n()

type IconSource = 'favicon' | 'text' | 'upload' | 'builtin'

interface ICON_SOURCE {
  source: IconSource,
  label: string
}

const emit = defineEmits([ 'on-commit' ])
const PixelIconDialogRef = useTemplateRef('PixelIconDialogRef')
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
let faviconRequestId = 0
const ICON_SOURCE_LIST: ICON_SOURCE[] = [
  {
    source: 'favicon',
    label: 'dialog.getIcon'
  },
  {
    source: 'text',
    label: 'form.textIcon'
  },
  {
    source: 'upload',
    label: 'pixelIcon.uploadIcon'
  },
  {
    source: 'builtin',
    label: 'iconLibrary.title'
  }
]
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
const visible = ref<boolean>(false) // 弹窗显示状态
const isEdit = ref<boolean>(false) // 是否编辑状态
const isFetchingIcon = ref<boolean>(false)
const currentIconSource = computed<IconSource>(() => formData.value.iconSource || (formData.value.type === 'text' ? 'text' : 'favicon'))
const selectedBuiltinIcon = computed(() => formData.value.builtinIconKey ? BUILTIN_ICON_MAP.get(formData.value.builtinIconKey) : undefined)
const getUrlPlaceholder = computed(() => {
  if (currentIconSource.value !== 'text') {
    return t('form.placeholderIconUrl')
  } else {
    return t('form.placeholderIconText')
  }
})

const normalizeLinkIconSource = (item: LINK_ITEM_TYPE): LINK_ITEM_TYPE => {
  const iconSource = item.iconSource || (item.type === 'text' ? 'text' : (item.builtinIconKey ? 'builtin' : (item.iconId && !item.logo ? 'upload' : 'favicon')))
  return {
    ...item,
    iconSource,
    type: iconSource === 'text' ? 'text' : 'img'
  }
}

const show = (item?: LINK_ITEM_TYPE) => {
  // 先判断当前是新增还是编辑
  if (item?.id) {
    isEdit.value = true
    formData.value = normalizeLinkIconSource(item)
  } else {
    isEdit.value = false
    formData.value = {
      parentId: item!.parentId,
      id: '',
      name: '',
      url: '',
      logo: '',
      iconId: '',
      builtinIconKey: '',
      iconSource: 'favicon',
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

const clearIcon = () => {
  formData.value.logo = ''
  formData.value.iconId = ''
  formData.value.builtinIconKey = ''
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
  // 判断当前是编辑还是新增
  let temp = {
    ...formData.value,
    type: currentIconSource.value === 'text' ? 'text' : 'img',
    iconSource: currentIconSource.value
  }
  if (!formData.value.id) {
    temp.id = Date.now()
  }
  emit('on-commit', temp)
  hide()
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

// 修改图标来源
const changeIconSource = (source: IconSource): void => {
  const previousSource = currentIconSource.value
  if (source !== 'favicon') {
    faviconRequestId += 1
    isFetchingIcon.value = false
  }
  formData.value.iconSource = source
  formData.value.type = source === 'text' ? 'text' : 'img'
  if (source === 'favicon') {
    formData.value.iconId = ''
    formData.value.builtinIconKey = ''
  }
  if (source === 'upload') {
    formData.value.logo = ''
    formData.value.builtinIconKey = ''
    if (previousSource !== 'upload') {
      formData.value.iconId = ''
    }
  }
  if (source === 'builtin') {
    formData.value.logo = ''
    formData.value.iconId = ''
  }
  if (source === 'text') {
    formData.value.logo = ''
    formData.value.iconId = ''
    formData.value.builtinIconKey = ''
  }
}

const openUpload = () => {
  fileInput.value?.click()
}

const handleUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  formData.value.iconSource = 'upload'
  formData.value.type = 'img'
  formData.value.logo = ''
  formData.value.builtinIconKey = ''
  formData.value.iconId = await saveIconBlob(file)
}

const openUploadEditor = async () => {
  if (!formData.value.iconId) {
    return
  }
  const blob = await getIconBlob(formData.value.iconId)
  if (blob) {
    PixelIconDialogRef.value?.show(blob, `${ formData.value.name || 'stardew-tab-icon' }.png`)
  }
}

const applyPixelIcon = ({iconId}: { iconId: string }) => {
  formData.value.iconId = iconId
  formData.value.logo = ''
  formData.value.builtinIconKey = ''
  formData.value.type = 'img'
  formData.value.iconSource = 'upload'
}

const selectBuiltinIcon = (icon: BuiltinIcon) => {
  formData.value.builtinIconKey = icon.key
  formData.value.logo = ''
  formData.value.iconId = ''
  formData.value.type = 'img'
  formData.value.iconSource = 'builtin'
}

defineExpose({
  show,
  hide
})
</script>

<style lang="less" scoped>
@import "@/styles/common";
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
