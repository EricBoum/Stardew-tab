<template>
  <div class="Navigation w-[900px] h-[117px] fixed bottom-[0px] left-1/2 -translate-x-1/2 z-[5]" style="isolation: isolate;">
    <ul class="flex w-full h-full pt-[46px] pl-[46px] relative">
      <li v-for="(item, index) in navigationItems" :key="index" class="group relative" @contextmenu="openContextMenu($event, index)">
        <div class="w-[60px] h-[60px] mr-[8px] relative z-[5]" @click="jump(item)">
          <LinkItem :detail="item" />
          <StardewTips placement="top">
            <template #default>
              <LinkInfo :detail="item" />
            </template>
          </StardewTips>
        </div>
      </li>
      <li class="w-[60px] h-[60px] absolute right-[46px]" @click="openLinkBox">
        <div class="w-full h-full flex items-center justify-center cursor-pointer transition-colors">
          <div class="Navigation-add w-[50px] h-[50px] mr-[1px] flex items-center justify-center">
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

  <div v-if="contextMenu.show"
       class="fixed z-[20] bg-[#EFBD73] py-1 w-25 stardew-border stardew-font"
       :style="{top: contextMenu.y + 'px', left: contextMenu.x + 'px'}"
       @click="contextMenu.show = false">
    <div class="px-2 py-1 hover:bg-[#f1e6c8] pointer context-menu-item" @click="openAddDialog(contextMenu.itemIndex)">
      编辑网站
    </div>
    <div class="px-2 py-1 hover:bg-[#f1e6c8] pointer context-menu-item text-[#d32f2f] hover:text-[#b71c1c]" @click="deleteSite(contextMenu.itemIndex)">
      删除网站
    </div>
  </div>
  <!--提示弹窗-->
  <StardewAlert :model-value="showAlert" :message="alertMessage" @update:modelValue="showAlert = $event" />
  <!--新增 || 编辑弹窗-->
  <StardewSiteDialog ref="StardewSiteDialogRef" />
</template>

<script setup lang="ts">
import StardewAlert from './StardewAlert.vue'
import StardewTips from '@/components/_components/StardewTips/index.vue'
import StardewSiteDialog from './StardewSiteDialog.vue'
import NavigationList from '@/assets/json/commonly.json'
import LinkInfo from '@/components/_common/LinkInfo/index.vue'
import LinkItem from '@/components/_common/LinkItem/index.vue'

import { ref, onMounted, onUnmounted, useTemplateRef } from 'vue'
import { type LINK_ITEM_TYPE } from '@/libs/const/type.ts'

interface ContextMenu {
  show: boolean
  x: number
  y: number
  itemIndex: number
}

const emit = defineEmits(['handleOpenLinkBox'])
const navigationItems = ref<LINK_ITEM_TYPE[]>([ ...NavigationList as LINK_ITEM_TYPE[] ])
const StardewSiteDialogRef = useTemplateRef('StardewSiteDialogRef')
const contextMenu = ref<ContextMenu>({
  show: false,
  x: 0,
  y: 0,
  itemIndex: -1
})

const loadFromLocalStorage = () => {
  const savedSites = localStorage.getItem('custom-sites')
  if (savedSites) {
    try {
      const customSites = JSON.parse(savedSites)
      navigationItems.value = [ ...NavigationList, ...customSites ]
    } catch (e) {
      console.error('Failed to parse saved sites:', e)
    }
  }
}

const saveToLocalStorage = () => {
  // 只保存用户添加的网站（排除默认的list）
  const customSites = navigationItems.value.slice(NavigationList.length)
  localStorage.setItem('custom-sites', JSON.stringify(customSites))
}

const openAddDialog = (index: number) => {
  const itemData = navigationItems.value[index] || {}
  StardewSiteDialogRef.value!.show(JSON.parse(JSON.stringify(itemData)))
}

const deleteSite = (index: number) => {
  if (index < 0 || index >= navigationItems.value.length) return

  // 只允许删除自定义网站，不能删除默认网站
  if (index < NavigationList.length) {
    customAlert('无法摧毁这个默认网站。')
    return
  }

  navigationItems.value.splice(index, 1)
  saveToLocalStorage()
}

const openContextMenu = (event: MouseEvent, index: number) => {
  event.preventDefault()

  const menuWidth = 140
  const menuHeight = 100
  const safetyMargin = 20

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let x = event.clientX
  let y = event.clientY

  if (x + menuWidth > viewportWidth - safetyMargin) {
    x = viewportWidth - menuWidth - safetyMargin
  }
  if (x < safetyMargin) {
    x = safetyMargin
  }
  if (y + menuHeight > viewportHeight - safetyMargin) {
    y = viewportHeight - menuHeight - safetyMargin
  }
  if (y < safetyMargin) {
    y = safetyMargin
  }
  contextMenu.value = {
    show: true,
    x,
    y,
    itemIndex: index
  }
}

const closeContextMenu = () => {
  contextMenu.value.show = false
}

const jump = (item: LINK_ITEM_TYPE) => {
  window.open(item.url, '_blank')
}

const showAlert = ref<boolean>(false)
const alertMessage = ref<string>('')

const customAlert = (msg: string) => {
  alertMessage.value = msg
  showAlert.value = true
}

// 打开链接弹窗
const openLinkBox = () => {
  emit('handleOpenLinkBox')
}

onMounted(() => {
  loadFromLocalStorage()
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
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
// 右键菜单和弹窗公共样式
.stardew-border {
  border: 3px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  outline: 3px solid #552E2B;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
// 游戏字体
.stardew-font {
  font-family: 'StardewValley', sans-serif;
  color: var(--text-color, #4e3623);
}
// 右键菜单项
.context-menu-item {
  font-size: 0.9rem;
  transition: all 0.15s ease;
}
// 主按钮样式
.stardew-button {
  font-family: 'StardewValley', sans-serif;
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  }
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
}
.stardew-button-cancel {
  background-color: #B86646;
  &:hover {
    background-color: #cc7856;
  }
  &:active {
    background-color: #a35a3f;
  }
}
// 小按钮样式
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
// 网站弹窗
.site-dialog {
  // 图标预览区
  .icon-preview {
    transition: all 0.3s ease;
    &:hover {
      transform: scale(1.05);
    }
  }
  // 弹窗标题
  .dialog-title {
    text-shadow: -1px 1px 0 rgba(0, 0, 0, 0.1);
  }
}


</style>
