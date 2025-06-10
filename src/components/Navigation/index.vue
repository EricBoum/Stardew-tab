<template>
  <div class="Navigation w-[700px] h-[85px] fixed bottom-[10px] left-1/2 -translate-x-1/2 z-[5]" style="isolation: isolate;">
    <ul class="flex w-full h-full pt-[15px] pl-[15px] relative">
      <li v-for="(item, index) in commonLinkList" :key="index" class="group relative" @contextmenu="openContextMenu($event, index)">
        <div class="w-[53px] h-[53px] mr-[3.1px] relative z-[5]">
          <LinkItem :detail="item" />
          <StardewTips placement="top">
            <template #default>
              <LinkInfo :detail="item" />
            </template>
          </StardewTips>
        </div>
      </li>
      <li class="w-[53px] h-[53px] absolute right-[15px]" @click="openLinkBox">
        <div class="w-full h-full flex items-center justify-center cursor-pointer transition-colors">
          <div class="Navigation-add w-[41px] h-[41px] mr-[1px] flex items-center justify-center pointer">
            <svg width="22" height="22" viewBox="0 0 20 20" class="pixel-plus">
              <circle cx="4" cy="10" r="2" fill="#FFD54F" />
              <circle cx="10" cy="10" r="2" fill="#FFD54F" />
              <circle cx="16" cy="10" r="2" fill="#FFD54F" />
            </svg>
          </div>
        </div>
      </li>
    </ul>
  </div>

  <!--右键菜单-->
  <ContextMenu ref="ContextMenuRef" @on-edit="openEdit" @on-delete="openDelete" />
  <!--编辑-->
  <ChangeLink ref="ChangeLinkRef" @on-commit="commitLink" />
  <!--二次确认弹窗-->
  <ConfirmBox ref="ConfirmBoxRef" @on-commit="commitDelete" />
</template>

<script setup lang="ts">
import StardewTips from '@/components/_components/StardewTips/index.vue'
import ChangeLink from '@/components/_components/ChangeLink/index.vue'
import LinkInfo from '@/components/_common/LinkInfo/index.vue'
import LinkItem from '@/components/_common/LinkItem/index.vue'
import ContextMenu from '@/components/_components/ContextMenu/index.vue'
import { ref, onMounted, useTemplateRef } from 'vue'
import { type LINK_ITEM_TYPE } from '@/libs/const/type.ts'
import { deleteCommonLinkData, getCommonLinkData, setCommonLinkData } from '@/libs/index.ts'
import ConfirmBox from '@/components/_components/ConfirmBox/index.vue'

const emit = defineEmits([ 'handleOpenLinkBox' ])
const ChangeLinkRef = useTemplateRef('ChangeLinkRef')
const ContextMenuRef = useTemplateRef('ContextMenuRef')
const ConfirmBoxRef = useTemplateRef('ConfirmBoxRef')
const commonLinkList = ref<LINK_ITEM_TYPE[]>([]) // 当前页面的快捷列表
const tempItem = ref<LINK_ITEM_TYPE>({} as LINK_ITEM_TYPE)

const query = async () => {
  commonLinkList.value = await getCommonLinkData()
}

const openContextMenu = (event: MouseEvent, index: number) => {
  event.preventDefault()
  ContextMenuRef.value?.show({e: event, detail: index})
}

// 打开链接弹窗
const openLinkBox = () => {
  emit('handleOpenLinkBox')
}
// 打开编辑弹窗
const openEdit = (index: number) => {
  const item = commonLinkList.value[index]
  ChangeLinkRef.value?.show(JSON.parse(JSON.stringify(item)))
}
// 删除链接
const openDelete = (index: number) => {
  tempItem.value = commonLinkList.value[index]
  ConfirmBoxRef.value?.show()
}
// 确认删除
const commitDelete = async () => {
  await deleteCommonLinkData(tempItem.value)
  await query()
}
// 链接表单保存回调
const commitLink = async (e: any) => {
  await setCommonLinkData(e)
  await query()
}

onMounted(() => {
  query()
})

defineExpose({
  query
})
</script>

<style lang="less" scoped>
.Navigation {
  background-image: url("@/assets/image/link/common_bg.png");
  background-size: 100% auto;
  background-repeat: no-repeat;
  // 书签项
  &-item {
    transition: transform 0.2s ease;
    &:hover {
      transform: translateY(-2px);
    }
  }
  // 添加按钮
  &-add {
    background-color: #CF802F;
    transition: all 0.2s;
    &:hover {
      background-color: #CF802F;
      opacity: 0.8;
    }
    &:active {
      background-color: #CF802F;
    }
  }
  // 书签图标样式
  &-icon {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    transition: all 0.2s;
    position: relative;
    z-index: 5; // 确保图标的z-index低于弹窗和提示
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    }
  }
  // 加号图标
  .pixel-plus {
    transition: transform 0.2s;
    rect {
      transition: fill 0.2s;
    }
  }
  // 悬停时加号变成金色且整体放大
  &-add:hover .pixel-plus {
    transform: scale(1.1);
  }
  &-add:hover .pixel-plus rect {
    fill: #FFD700;
  }
}
</style>
