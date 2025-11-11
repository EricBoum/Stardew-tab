<template>
  <div>
    <StardewDialog v-model="visible" :closeOnMask="false">
      <div class="link-list-box w-[900px] h-[303px] pt-[0.1px] relative">
        <div class="close-box" @click="hide">
          <img src="@/assets/image/link/close.png" :alt="$t('common.close')">
        </div>
        <div class="w-[60px] h-[60px] absolute right-[49px] top-[46px]">
          <div class="w-full h-full flex items-center justify-center cursor-pointer transition-colors">
            <div class="Navigation-add w-[50px] h-[50px] mr-[1px] flex items-center justify-center pointer" :class="{'disabled': currentIsMax}" @click="toChangeLink({parentId: tabChoose})">
              <svg width="22" height="22" viewBox="0 0 20 20" class="pixel-plus">
                <rect x="8" y="2" width="4" height="16" fill="#FFD54F" />
                <rect x="2" y="8" width="16" height="4" fill="#FFD54F" />
              </svg>
            </div>
          </div>
        </div>
        <!--文件上传下载-->
        <FileOperate @on-upload-success="initAll" />
        <!--垃圾桶-->
        <Trashcan @on-drop="trashDelete" />
        <!--顶部切换tab-->
        <Tabs v-model="tabChoose" :list="tabList" @on-refresh="initAllLinkList" />
        <VueDraggable
          class="w-[820px] h-[73px] flex items-center mt-[40px] ml-[46.5px]"
          id="common"
          v-model="commonLinkList"
          :animation="150"
          group="link"
          ghostClass="ghost"
          @choose="(e) => draggleStart(e, 'common')"
          @end="draggleEnd"
          @move="(e) => handleMove(e, 'common')"
        >
          <div v-for="(item, index) in commonLinkList" :key="`common_${item.id}`" class="group relative">
            <div class="w-[60px] h-[60px] mr-[7.5px] relative z-[5]" @contextmenu="handleContextMenu($event, index, 'common')">
              <LinkItem :detail="item" />
              <StardewTips placement="top" v-if="showTips">
                <template #default>
                  <LinkInfo :detail="item" />
                </template>
              </StardewTips>
            </div>
          </div>
        </VueDraggable>
        <VueDraggable
          class="w-[850px] flex flex-wrap items-center mt-[17px] ml-[46.5px]"
          id="current"
          v-model="currentLinkList"
          :animation="150"
          group="link"
          ghostClass="ghost"
          @choose="(e) => draggleStart(e, 'current')"
          @end="draggleEnd"
          @move="(e) => handleMove(e, 'current')"
        >
          <div v-for="(item, index) in currentLinkList" :key="`current_${item.id}`" class="group relative">
            <div class="w-[60px] h-[60px] shrink-0 mr-[7.5px] mb-[13px] relative z-[5]" @contextmenu="handleContextMenu($event, index, 'current')">
              <LinkItem :detail="item" />
              <StardewTips placement="top" v-if="showTips">
                <template #default>
                  <LinkInfo :detail="item" />
                </template>
              </StardewTips>
            </div>
          </div>
        </VueDraggable>
      </div>
    </StardewDialog>
    <!--新增 || 编辑弹窗-->
    <ChangeLink ref="ChangeLinkRef" @on-commit="commitLink" />
    <!--右键菜单-->
    <ContextMenu ref="ContextMenuRef" @on-edit="openEdit" @on-delete="openDelete" />
  </div>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import LinkItem from '@/components/_common/LinkItem/index.vue'
import StardewTips from '@/components/_components/StardewTips/index.vue'
import LinkInfo from '@/components/_common/LinkInfo/index.vue'
import ChangeLink from '@/components/_components/ChangeLink/index.vue'
import ContextMenu from '@/components/_components/ContextMenu/index.vue'
import Tabs from './Tabs.vue'
import Trashcan from './Trashcan.vue'
import FileOperate from './FileOperate.vue'
import { ref, useTemplateRef, watch, computed, nextTick } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { LINK_ITEM_TYPE, TAB_ITEM } from '@/libs/const/type.ts'
import {
  deleteCommonLinkData,
  deleteLink,
  getCommonLinkData,
  getLinkData,
  setCommonLinkData,
  setLinkData,
  updateCurrentTabLinkList
} from '@/libs/index.ts'
import { useStorage } from '@/libs/storage.ts'
import { COMMON_LINK_LIST_KEY, MAX_COMMON_NUM, MAX_CURRENT_NUM } from '@/libs/const'
import { useI18n } from 'vue-i18n'

const { t: $t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits([ 'update:modelValue', 'on-close' ])
const ChangeLinkRef = useTemplateRef('ChangeLinkRef')
const ContextMenuRef = useTemplateRef('ContextMenuRef')
const commonLinkList = ref<LINK_ITEM_TYPE[]>([]) // 常用快捷链接
const visible = ref<boolean>(props.modelValue)
const tabChoose = ref<string | number>('')
const tabList = ref<TAB_ITEM[]>([])
const allLinkList = ref<any>([])
const currentLinkList = ref<LINK_ITEM_TYPE[]>([]) // 当前页面的快捷列表
const tempLinkType = ref<string>('') // 临时存储的链接类型
const showTips = ref<boolean>(true) // 是否展示tips
const draggleItem = ref<LINK_ITEM_TYPE | null>() // 拖拽时临时存储的数据，删除用

// 常用列表是否已达最大数量
const commonIsMax = computed(() => {
  return commonLinkList.value.length >= MAX_COMMON_NUM
})
// 当前tab列表链接是否已达最大数量
const currentIsMax = computed(() => {
  return currentLinkList.value.length >= MAX_CURRENT_NUM
})

const show = () => {
  initAll()
  visible.value = true
}
const hide = () => {
  visible.value = false
  emit('on-close')
}

const setLinkList = () => {
  let findTabData = allLinkList.value.find((item: TAB_ITEM) => item.id === tabChoose.value)
  if (!findTabData) {
    // 找不到当前tab，则取第一个
    tabChoose.value = tabList.value[0].id
    findTabData = allLinkList.value[0]
  }
  if (findTabData.list?.length) {
    currentLinkList.value = allLinkList.value.find((item: TAB_ITEM) => item.id === tabChoose.value).list
  } else {
    currentLinkList.value = []
  }
}

const initAll = () => {
  initCommonLinkList()
  initAllLinkList()
}
// 更新常用链接列表
const initCommonLinkList = async () => {
  commonLinkList.value = await getCommonLinkData()
}
// 更新全量链接列表
const initAllLinkList = async () => {
  allLinkList.value = await getLinkData()
  tabList.value = allLinkList.value.map((item: TAB_ITEM) => {
    return {
      name: item.name,
      id: item.id
    }
  })
  if (tabChoose.value === '' && tabList.value.length) {
    tabChoose.value = tabList.value[0].id
  }
  setLinkList()
}
// 添加链接
const toChangeLink = (item: any) => {
  if (currentIsMax.value) {
    return
  }
  ChangeLinkRef.value?.show(item)
}
// 链接表单保存回调
const commitLink = async (e: any) => {
  if (tempLinkType.value === 'common') {
    await setCommonLinkData(e)
    await initCommonLinkList()
  } else {
    await setLinkData(e)
    await initAllLinkList()
  }
}
// 拖拽开始
const draggleStart = (evt: any, type: string) => {
  tempLinkType.value = type
  if (type === 'common') {
    draggleItem.value = commonLinkList.value[evt.oldIndex]
  } else {
    draggleItem.value = currentLinkList.value[evt.oldIndex]
  }
  showTips.value = false
}
// 拖拽结束
const draggleEnd = async (evt: any) => {
  showTips.value = true
  if (!draggleItem.value) {
    // 解决vue-draggable-plus拖拽时，删除的元素没有更新问题，待后期优化
    // 垃圾桶删除结束回调
    if (tempLinkType.value === 'common') {
      if (commonLinkList.value.length <= 1) {
        const tempData = [ ...commonLinkList.value ]
        commonLinkList.value = []
        await nextTick()
        commonLinkList.value = [...tempData]
      }
    } else {
      if (currentLinkList.value.length <= 1) {
        const tempData = [ ...currentLinkList.value ]
        currentLinkList.value = []
        await nextTick()
        currentLinkList.value = [...tempData]
      }
    }
    return
  }
  // 判断是否是从commonLinkList拖到currentLinkList
  if (evt.from.id === 'common' && evt.to.id === 'current') {
    const fIndex = currentLinkList.value.findIndex((item: LINK_ITEM_TYPE) => item.id === evt.data.id)
    currentLinkList.value[fIndex].parentId = tabChoose.value
  }
  await useStorage().setStorage(COMMON_LINK_LIST_KEY, JSON.parse(JSON.stringify(commonLinkList.value)))
  await updateCurrentTabLinkList({id: tabChoose.value, linkList: currentLinkList.value})
  initAll()
}

// 拖拽 move 事件处理，阻止超限拖拽
const handleMove = (evt: any, key: string) => {
  if (evt.from === evt.to) {
    return true
  }
  if (( key === 'common' && currentIsMax.value ) || ( key === 'current' && commonIsMax.value )) {
    evt.preventDefault()
    return false
  }
  return true
}

// 右键点击事件
const handleContextMenu = (e: MouseEvent, index: number, type: 'common' | 'current') => {
  e.preventDefault()
  ContextMenuRef.value?.show({e, detail: {index, type}})
}
// 打开编辑弹窗
const openEdit = (e: any) => {
  let item
  tempLinkType.value = e.type
  if (e.type === 'common') {
    item = commonLinkList.value[e.index]
  } else {
    item = currentLinkList.value[e.index]
  }
  ChangeLinkRef.value?.show(JSON.parse(JSON.stringify(item)))
}
// 删除链接
const openDelete = async (e: any) => {
  if (e.type === 'common') {
    await deleteCommonLinkData(commonLinkList.value[e.index])
    await initCommonLinkList()
  } else {
    await deleteLink(currentLinkList.value[e.index])
    await initAllLinkList()
  }
}
// 垃圾桶删除
const trashDelete = async () => {
  if (!draggleItem.value) {
    return
  }
  const temp = JSON.parse(JSON.stringify(draggleItem.value))
  draggleItem.value = null // 删除时，兼容chrome.storage.local异步问题
  if (tempLinkType.value === 'common') {
    await deleteCommonLinkData(temp)
  } else {
    await deleteLink(temp)
  }
  initAll()
}

watch(() => tabChoose.value, () => {
  setLinkList()
})
watch(() => visible.value, (e: boolean) => {
  emit('update:modelValue', e)
})
watch(() => props.modelValue, (e: boolean) => {
  visible.value = e
})

defineExpose({
  show,
  hide,
  initCommonLinkList
})
</script>

<style lang="less" scoped>
@import "@/styles/common";
.link-list-box {
  background-image: url("@/assets/image/link/list_bg.png");
  background-repeat: no-repeat;
  background-size: 100% auto;
}
.Navigation-add {
  background-color: #CF802F;
  transition: current 0.2s;
  &:hover {
    opacity: 0.8;
  }
}
.disabled {
  opacity: 0.5;
  &:hover {
    opacity: 0.5;
  }
}
.close-box {
  .dialog-close-button(@w: 30px; @mg: 0px);
}
</style>
