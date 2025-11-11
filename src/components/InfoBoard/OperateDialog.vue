<template>
  <StardewDialog v-model="visible">
    <div class="site-dialog bg-[#EFBD73] p-6 w-[500px] max-w-[90vw] relative stardew-border stardew-font">
      <div class="close-box" @click="hide">
        <img src="@/assets/image/link/close.png" :alt="$t('common.close')">
      </div>
      <h3 class="text-xl text-[#4e3623] font-bold">
        {{ $t('settings.title') }}
      </h3>
      <div class="flex items-center text mt-2">
        <span class="w-[120px] select-none mr-[20px]">{{ $t('settings.language') }}</span>
        <StardewSelect class="w-[200px]" v-model="systemDetail.language" :options="getOptions" />
      </div>
      <div class="flex items-center text mt-2">
        <span class="w-[120px] select-none mr-[20px]">{{ $t('settings.showBottomBar') }}</span>
        <StardewSwitch v-model="systemDetail.bottomLinkShow" />
      </div>
      <div class="flex items-center text mt-2">
        <span class="w-[120px] select-none mr-[20px]">{{ $t('settings.showBattery') }}</span>
        <StardewSwitch v-model="systemDetail.batteryShow" />
      </div>
    </div>
  </StardewDialog>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import StardewSelect from '@/components/_components/StardewSelect/index.vue'
import StardewSwitch from '@/components/_components/StardewSwitch/index.vue'
import { ref, computed } from 'vue'
import { LanguageList, type LanguageItem } from '@/locales'
import { useSystemSettings } from '@/hooks/useSystemSettings'

const { systemSettings: systemDetail, init: initSystemSettings } = useSystemSettings()

const visible = ref<boolean>(false)

const getOptions = computed(() => {
  return LanguageList.map((item: LanguageItem) => ({
    name: item.label,
    id: item.value
  }))
})

const show = async () => {
  await initSystemSettings()
  visible.value = true
}

const hide = () => {
  visible.value = false
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
</style>
