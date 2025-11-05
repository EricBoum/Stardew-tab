<template>
  <StardewDialog v-model="visible" @on-close="emit('on-close')">
    <div class="w-[400px] h-[200px] stardew-border p-5 bg-[#EFBD73] relative flex flex-col items-center">
      <div class="dialog-title">
        {{ $t('dialog.notice') }}
      </div>
      <div class="text-center stardew-font">
        {{ text }}
      </div>
      <button class="stardew-button mt-auto" @click="commit">
        {{ $t('common.confirm') }}
      </button>
      <div class="close-box pointer" @click="hide">
        <img src="@/assets/image/link/close.png" :alt="$t('common.close')">
      </div>
    </div>
  </StardewDialog>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const emit = defineEmits([ 'on-close', 'on-commit' ])
const visible = ref<boolean>(false)
const text = ref<string>($t('message.deleteConfirm'))

const show = (e?: string) => {
  if (e) {
    text.value = e
  }
  visible.value = true
}
const hide = () => {
  visible.value = false
}
const commit = () => {
  emit('on-commit')
  hide()
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
