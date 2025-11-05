<template>
  <StardewDialog v-model="visible">
    <template #default>
      <div class="relative">
        <div class="close-box" @click="hide">
          <img src="@/assets/image/link/close.png" :alt="$t('common.close')">
        </div>
        <div class="site-dialog bg-[#EFBD73] p-6 w-[400px] max-w-[90vw] stardew-border stardew-font">
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
            <div class="flex">
              <label class="mr-5 block pointer text-sm font-medium mb-1" :class="[formData.type === item.type? 'text-[#4e3623]': 'text-[#A19187]']" v-for="(item, index) in ICON_TYPE_LIST" :key="index" @click="changeIconType(item)">
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

          <div class="flex justify-center space-x-4">
            <button @click="save" class="stardew-button">
              {{ $t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </StardewDialog>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import StardewInput from '@/components/_components/StardewInput/index.vue'
import { computed, ref } from 'vue'
import type { LINK_ITEM_TYPE } from '@/libs/const/type.ts'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface ICON_TYPE {
  type: string,
  label: string
}

const emit = defineEmits([ 'on-commit' ])
const ICON_TYPE_LIST: ICON_TYPE[] = [
  {
    type: 'img',
    label: t('form.imageIcon')
  },
  {
    type: 'text',
    label: t('form.textIcon')
  }
]
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
const visible = ref<boolean>(false) // 弹窗显示状态
const isEdit = ref<boolean>(false) // 是否编辑状态
const getUrlPlaceholder = computed(() => {
  if (formData.value.type === 'img') {
    return t('form.placeholderIconUrl')
  } else {
    return t('form.placeholderIconText')
  }
})

const show = (item?: LINK_ITEM_TYPE) => {
  // 先判断当前是新增还是编辑
  if (item?.id) {
    isEdit.value = true
    formData.value = item
  } else {
    isEdit.value = false
    formData.value = {
      parentId: item!.parentId,
      id: '',
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
const save = async (): Promise<undefined> => {
  // 判断当前是编辑还是新增
  let temp = {
    ...formData.value
  }
  if (!formData.value.id) {
    temp.id = Date.now()
  }
  emit('on-commit', temp)
  hide()
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
}
</style>
