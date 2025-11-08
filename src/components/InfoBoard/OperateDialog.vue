<template>
  <StardewDialog v-model="visible">
    <div class="site-dialog bg-[#EFBD73] p-6 w-[400px] max-w-[90vw] relative stardew-border stardew-font">
      <div class="close-box" @click="hide">
        <img src="@/assets/image/link/close.png" :alt="$t('common.close')">
      </div>
      <h3 class="text-xl text-[#4e3623] font-bold">
        基础设置
      </h3>
      <div class="flex items-center text mt-2">
        <span class="w-[125px] select-none">语言</span>
        <StardewSelect class="w-[200px]" v-model="operateDetail.language" :options="getOptions" />
      </div>
      <div class="flex items-center text mt-2">
        <span class="w-[125px] select-none">是否显示底部栏</span>
        <StardewSwitch v-model="operateDetail.bottomLinkShow" />
      </div>
      <div class="flex items-center text mt-2">
        <span class="w-[125px] select-none">是否显示电量</span>
        <StardewSwitch v-model="operateDetail.batteryShow" />
      </div>
    </div>
  </StardewDialog>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import StardewSelect from '@/components/_components/StardewSelect/index.vue'
import StardewSwitch from '@/components/_components/StardewSwitch/index.vue'
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LanguageList, type LanguageItem } from '@/locales'
import type { SYSTEM_SETTING } from '@/libs/const/type.ts'
import { SYSTEM_SETTING_KEY } from '@/libs/const'
import { useStorage } from '@/libs/storage.ts'

const {locale} = useI18n()

const {setStorage, getStorage} = useStorage()

const visible = ref<boolean>(false)
const operateDetail = ref<SYSTEM_SETTING>({
  language: 'zh-CN',
  bottomLinkShow: true,
  batteryShow: true
})

const getOptions = computed(() => {
  return LanguageList.map((item: LanguageItem) => ( {
    name: item.label,
    id: item.value
  } ))
})

const show = async () => {
  const storageData = await getStorage(SYSTEM_SETTING_KEY)
  if (Object.keys(storageData).length) {
    operateDetail.value = storageData as SYSTEM_SETTING
  } else {
    operateDetail.value = {
      language: 'zh-CN',
      bottomLinkShow: true,
      batteryShow: true
    }
  }
  visible.value = true
}
const hide = () => {
  visible.value = false
}

watch(() => operateDetail.value.language, () => {
  setStorage(SYSTEM_SETTING_KEY, {...operateDetail.value})
  // 更新全局 i18n 语言
  locale.value = operateDetail.value.language as any
}, {deep: true})

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
</style>
