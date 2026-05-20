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
      <div class="flex items-start text mt-2">
        <span class="w-[120px] select-none mr-[20px] flex items-center">
          {{ $t('settings.weatherLocation') }}
          <span class="relative group inline-flex ml-1">
            <span class="w-4 h-4 inline-flex items-center justify-center border-2 border-[#6f3a1c] rounded-full bg-[#f8d18a] text-[#4e3623] text-xs leading-none cursor-help">?</span>
            <StardewTips placement="top-start">
              <template #default>
                <SimpleInfo :detail="{title: $t('settings.weatherLocationPrivacyTitle'), content: $t('settings.weatherLocationPrivacy')}" />
              </template>
            </StardewTips>
          </span>
        </span>
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span class="inline-flex min-h-7 items-center gap-1.5 text-[#4e3623] text-sm leading-[18px]">
            <span class="inline-flex size-3 items-center justify-center rounded-full border-2 border-[#5f2e16] bg-[#f4e0a2] shadow-[1px_1px_0_rgba(79,45,24,0.3)]">
              <span class="size-1.5 rounded-full shadow-[1px_1px_0_rgba(79,45,24,0.35)]" :class="getWeatherPermissionDotClass"></span>
            </span>
            {{ getWeatherPermissionBadgeText }}
          </span>
          <button
            v-if="showWeatherPermissionButton"
            type="button"
            class="min-h-7 px-2.5 py-[2px] border-2 border-[#6f3a1c] rounded bg-[#f8d18a] text-[#4e3623] text-sm leading-[18px] shadow-[inset_-2px_-2px_0_#c98b45] cursor-pointer hover:bg-[#ffe0a3] active:translate-y-px active:shadow-[inset_2px_2px_0_#c98b45] disabled:cursor-default disabled:opacity-75"
            :disabled="isWeatherPermissionButtonDisabled"
            @click="handleRequestWeatherLocation"
          >
            {{ getWeatherLocationButtonText }}
          </button>
        </div>
      </div>
    </div>
  </StardewDialog>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import StardewSelect from '@/components/_components/StardewSelect/index.vue'
import StardewSwitch from '@/components/_components/StardewSwitch/index.vue'
import StardewTips from '@/components/_components/StardewTips/index.vue'
import SimpleInfo from '@/components/_common/SimpleInfo/index.vue'
import { ref, computed } from 'vue'
import { LanguageList, type LanguageItem } from '@/locales'
import { useSystemSettings } from '@/hooks/useSystemSettings'
import { useI18n } from 'vue-i18n'
import type { WeatherPermissionStatus } from '@/libs/weather'

const props = defineProps<{
  weatherPermissionStatus: WeatherPermissionStatus;
  weatherLocationLoading: boolean;
}>()

const emit = defineEmits<{
  requestWeatherLocation: [];
}>()

const { t } = useI18n()
const { systemSettings: systemDetail, init: initSystemSettings } = useSystemSettings()

const visible = ref<boolean>(false)

const getOptions = computed(() => {
  return LanguageList.map((item: LanguageItem) => ({
    name: item.label,
    id: item.value
  }))
})

const getWeatherLocationButtonText = computed(() => {
  return props.weatherLocationLoading ? t('weather.locationLoading') : t('settings.weatherLocationAction')
})

const showWeatherPermissionButton = computed(() => {
  return props.weatherPermissionStatus !== 'granted'
})

const isWeatherPermissionButtonDisabled = computed(() => {
  return props.weatherLocationLoading || props.weatherPermissionStatus !== 'prompt'
})

const getWeatherPermissionBadgeText = computed(() => {
  return props.weatherPermissionStatus === 'granted'
    ? t('settings.weatherPermissionAuthorizedShort')
    : t('settings.weatherPermissionUnauthorizedShort')
})

const getWeatherPermissionDotClass = computed(() => {
  return props.weatherPermissionStatus === 'granted'
    ? 'bg-[#4f9b43]'
    : 'bg-[#c7472d]'
})

const show = async () => {
  await initSystemSettings()
  visible.value = true
}

const hide = () => {
  visible.value = false
}

const handleRequestWeatherLocation = () => {
  if (isWeatherPermissionButtonDisabled.value) {
    return
  }
  emit('requestWeatherLocation')
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
