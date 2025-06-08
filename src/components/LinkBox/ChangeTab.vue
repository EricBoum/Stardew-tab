<template>
  <StardewDialog v-model="visible">
    <div class="site-dialog bg-[#EFBD73] p-6 w-[400px] max-w-[90vw] relative stardew-border stardew-font">
      <div class="close-box" @click="hide">
        <img src="@/assets/image/link/close.png" alt="关闭">
      </div>
      <h3 class="text-xl text-[#4e3623] font-bold mb-4 text-center stardew-font dialog-title">
        {{ isEdit ? '编辑分类' : '添加分类' }}</h3>
      <div class="mb-3">
        <StardewInput v-model="formData.name" placeholder="请输入分类名称" />
      </div>

      <div class="flex justify-center space-x-4">
        <button @click="commit" class="px-20 py-2 bg-[#CF802F] hover:bg-[#DF9040] text-white stardew-button pointer">
          保存
        </button>
      </div>
    </div>
  </StardewDialog>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import StardewInput from '@/components/_components/StardewInput/index.vue'
import { ref } from 'vue'
import type { TAB_ITEM } from '@/libs/const/type.ts'
import { setLinkData } from '@/libs/index.ts'

const emit = defineEmits([ 'on-refresh' ])
const visible = ref<boolean>(false)
const isEdit = ref<boolean>(false)
const formData = ref<TAB_ITEM>({
  name: '',
  id: '',
  list: []
})

const show = (item: TAB_ITEM | null) => {
  if (item?.id) {
    isEdit.value = true
    formData.value = {...item}
  } else {
    isEdit.value = false
    formData.value = {
      name: '',
      id: '',
      list: []
    }
  }
  visible.value = true
}
const hide = () => {
  visible.value = false
}
const commit = async () => {
  let temp = {
    ...formData.value
  }
  if (!temp.id) {
    temp.id = Date.now()
  }
  await setLinkData({...temp})
  emit('on-refresh')
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
