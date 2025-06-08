<template>
  <div>
    <ul class="Tabs absolute bottom-full flex left-[10px]">
      <li class="flex pointer" :class="{'translate-y-[7px]': item.id === modelValue}" v-for="(item, index) in props.list" :key="index" @click="handleChoose(item)" @contextmenu="handleContextMenu($event, index)">
        <img src="@/assets/image/link/tab-left.png" alt="">
        <div class="center-value stardew-font max-w-[140px] h-[48px] flex items-center pt-[10px] px-[10px]">
          <span class="truncate">
            {{ item.name }}
          </span>
        </div>
        <img src="@/assets/image/link/tab-right.png" alt="">
      </li>
      <li class="ml-[10px] flex items-center">
        <img @click="handleEdit(-1)" class="h-[30px] pointer" src="@/assets/image/link/add.png" alt="">
      </li>
    </ul>
    <!--增加||编辑tab-->
    <ChangeTab ref="ChangeTabRef" @on-refresh="onRefresh" />
    <!--右键菜单-->
    <ContextMenu ref="ContextMenuRef" :showDelete="props.list.length > 1" @on-edit="handleEdit" @on-delete="toDelete" />
    <!--二次确认弹窗-->
    <ConfirmBox ref="ConfirmBoxRef" @on-commit="commitDelete" />
  </div>
</template>

<script setup lang="ts">
import ChangeTab from './ChangeTab.vue'
import ContextMenu from '@/components/_components/ContextMenu/index.vue'
import ConfirmBox from '@/components/_components/ConfirmBox/index.vue'
import { ref, useTemplateRef } from 'vue'
import type { TAB_ITEM } from '@/libs/const/type.ts'
import { deleteLink } from '@/libs'

const props = defineProps<{
  modelValue: string | number
  list: TAB_ITEM[]
}>()

const emit = defineEmits([ 'on-refresh', 'update:modelValue', 'on-delete' ])
const ContextMenuRef = useTemplateRef('ContextMenuRef')
const ChangeTabRef = useTemplateRef('ChangeTabRef')
const ConfirmBoxRef = useTemplateRef('ConfirmBoxRef')
const tempItem = ref<TAB_ITEM>({name: '', id: ''})

const handleChoose = (item: TAB_ITEM) => {
  emit('update:modelValue', item.id)
}
const handleContextMenu = (e: MouseEvent, index: number) => {
  e.preventDefault()
  ContextMenuRef.value?.show({e, detail: index})
}
// 编辑tab
const handleEdit = (e: number) => {
  let item: TAB_ITEM = {
    name: '',
    id: ''
  }
  if (e >= 0) {
    item = props.list[e]
  }
  ChangeTabRef.value?.show(item)
}
// 通知父组件刷新
const onRefresh = () => {
  emit('on-refresh')
}
// 删除tab
const toDelete = (e: number) => {
  tempItem.value = props.list[e]
  ConfirmBoxRef.value?.show()
}
// 确认删除
const commitDelete = async () => {
  await deleteLink(tempItem.value)
  onRefresh()
}
</script>

<style lang="less" scoped>
.Tabs {
  .center-value {
    background-image: url("@/assets/image/link/tab-center.png");
    background-repeat: repeat-x;
    background-size: auto 100%;
  }
}
</style>
