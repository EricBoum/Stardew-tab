<template>
  <div class="Navigation w-[600px] h-[79px] fixed bottom-[0px] left-1/2 -translate-x-1/2 z-[5]" style="isolation: isolate;">
    <ul class="flex w-full h-full pt-[30px] px-[30px] relative">
      <li v-for="(item, index) in navigationItems" :key="index" class="group relative Navigation-item" @contextmenu="openContextMenu($event, index)">
        <div class="w-[43px] h-[43px] mr-[2.4px] relative z-[5]" @click="jump(item)">
          <img class="w-full h-full p-[5px] z-[5] object-contain pointer transition-all Navigation-icon" :src="item.logo" :alt="item.name">

          <StardewTips>
            <template #title>{{ item.name }}</template>
            <template #subtitle>网站</template>
            <template #default>{{ item.desc }}</template>
          </StardewTips>
        </div>
      </li>
      <li class="w-[43px] h-[43px] mr-[3px] z-[5]" @click="openAddDialog()">
        <div class="w-full h-full flex items-center justify-center cursor-pointer transition-colors">
          <div class="Navigation-add w-[41px] h-[41px] mr-[1px] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 20 20" class="pixel-plus">
              <rect x="8" y="2" width="4" height="16" fill="#FFD54F" />
              <rect x="2" y="8" width="16" height="4" fill="#FFD54F" />
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
    <div class="px-2 py-1 hover:bg-[#f1e6c8] cursor-pointer context-menu-item" @click="editSite(contextMenu.itemIndex)">
      编辑网站
    </div>
    <div class="px-2 py-1 hover:bg-[#f1e6c8] cursor-pointer context-menu-item text-[#d32f2f] hover:text-[#b71c1c]" @click="deleteSite(contextMenu.itemIndex)">  
      删除网站
    </div>
  </div>
  
  <StardewAlert :model-value="showAlert" :message="alertMessage" @update:modelValue="showAlert = $event" />

  <StardewSiteDialog 
    v-model="showSiteDialog"
    :edit-mode="editMode"
    :site-data="currentSite"
    @save="handleSaveSite"
  />

</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import StardewAlert from './StardewAlert.vue'
import StardewTips from './StardewTips.vue'
import StardewSiteDialog from './StardewSiteDialog.vue'
import NavigationList from '@/assets/json/link.json'


interface Item {
  name: string;
  url: string;
  logo: string;
  desc?: string;
}


const navigationItems = ref<Item[]>([...NavigationList]);

// 最大书签数量限制
const MAX_BOOKMARKS = 11;

const showSiteDialog = ref(false);
const editMode = ref(false);
const editIndex = ref(-1);
const currentSite = ref({
  name: '',
  url: '',
  logo: '',
  desc: ''
});


const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  itemIndex: -1
});


onMounted(() => {
  loadFromLocalStorage();

  document.addEventListener('click', closeContextMenu);
});

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu);
});


const loadFromLocalStorage = () => {
  const savedSites = localStorage.getItem('custom-sites');
  if (savedSites) {
    try {
      const customSites = JSON.parse(savedSites);
      navigationItems.value = [...NavigationList, ...customSites];
    } catch (e) {
      console.error('Failed to parse saved sites:', e);
    }
  }
};


const saveToLocalStorage = () => {
  // 只保存用户添加的网站（排除默认的list）
  const customSites = navigationItems.value.slice(NavigationList.length);
  localStorage.setItem('custom-sites', JSON.stringify(customSites));
};


const openAddDialog = () => {
  // 点击添加按钮时先检查是否超过最大书签数量
  if (navigationItems.value.length >= MAX_BOOKMARKS) {
    customAlert(`目前无法拥有更多书签。`);
    return;
  }
  
  editMode.value = false;
  currentSite.value = { name: '', url: '', logo: '', desc: '' };
  showSiteDialog.value = true;
};


const editSite = (index: number) => {
  editMode.value = true;
  editIndex.value = index;
  const site = navigationItems.value[index];
  currentSite.value = {
    name: site.name,
    url: site.url,
    logo: site.logo,
    desc: site.desc || ''
  };
  showSiteDialog.value = true;
};


const deleteSite = (index: number) => {
  if (index < 0 || index >= navigationItems.value.length) return;
  
  // 只允许删除自定义网站，不能删除默认网站
  if (index < NavigationList.length) {
    customAlert('无法摧毁这个默认网站。');
    return;
  }
  
  navigationItems.value.splice(index, 1);
  saveToLocalStorage();
};


const handleSaveSite = (siteData: { name: string, url: string, logo: string, desc?: string }) => {
  if (editMode.value && editIndex.value >= 0) {
    // 编辑模式：更新现有网站
    navigationItems.value[editIndex.value] = siteData;
  } else {
    // 添加模式：添加新网站
    navigationItems.value.push(siteData);
  }
  
  // 保存到本地存储
  saveToLocalStorage();
};


const openContextMenu = (event: MouseEvent, index: number) => {
  event.preventDefault();
  

  const menuWidth = 140;
  const menuHeight = 100;
  const safetyMargin = 20;
  

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  

  let x = event.clientX;
  let y = event.clientY;
  

  if (x + menuWidth > viewportWidth - safetyMargin) {
    x = viewportWidth - menuWidth - safetyMargin;
  }
  if (x < safetyMargin) {
    x = safetyMargin;
  }
  if (y + menuHeight > viewportHeight - safetyMargin) {
    y = viewportHeight - menuHeight - safetyMargin;
  }
  if (y < safetyMargin) {
    y = safetyMargin;
  }
  
  contextMenu.value = {
    show: true,
    x,
    y,
    itemIndex: index
  };
};


const closeContextMenu = () => {
  contextMenu.value.show = false;
};


const jump = (item: Item) => {
  window.open(item.url, '_blank');
};


const showAlert = ref(false)
const alertMessage = ref('')
function customAlert(msg: string) {
  alertMessage.value = msg
  showAlert.value = true
}
function closeAlert() {
  showAlert.value = false
}
</script>

<style lang="less" scoped>
.Navigation {
  background-image: url("@/assets/image/app/common_bg.png");
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
