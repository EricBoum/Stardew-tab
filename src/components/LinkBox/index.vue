<template>
  <StardewDialog v-model="visible">
    <div class="link-list-box w-[900px] h-[303px] pt-[0.1px] relative">
      <!--顶部切换tab-->
      <Tabs :list="tabList" />
      <VueDraggable
        class="w-[900px] h-[73px] flex items-center mt-[41px] ml-[46px]"
        v-model="navigationItems"
        :animation="150"
        group="people"
        ghostClass="ghost"
      >
        <div v-for="(item) in navigationItems" :key="item.id" class="group relative">
          <div class="w-[60px] h-[60px] mr-[7.5px] relative z-[5]">
            <LinkItem :detail="item" />
            <StardewTips placement="top">
              <template #default>
                <LinkInfo :detail="item" />
              </template>
            </StardewTips>
          </div>
        </div>
      </VueDraggable>
      <VueDraggable
        class="w-[900px] flex items-center mt-[16px] ml-[46px]"
        v-model="linkList"
        :animation="150"
        group="people"
        ghostClass="ghost"
      >
        <div v-for="(item) in linkList" :key="item.id" class="group relative">
          <div class="w-[60px] h-[60px] mr-[7.5px] relative z-[5]">
            <LinkItem :detail="item" />
            <StardewTips placement="top">
              <template #default>
                <LinkInfo :detail="item" />
              </template>
            </StardewTips>
          </div>
        </div>
      </VueDraggable>
    </div>
  </StardewDialog>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import LinkItem from '@/components/_common/LinkItem/index.vue'
import StardewTips from '@/components/_components/StardewTips/index.vue'
import LinkInfo from '@/components/_common/LinkInfo/index.vue'
import NavigationList from '@/assets/json/commonly.json'
import Tabs from './Tabs.vue'
import { ref } from 'vue'
import type { LINK_ITEM_TYPE, TAB_ITEM } from '@/libs/const/type.ts'
import { VueDraggable } from 'vue-draggable-plus'
import { getTabData } from '@/libs/index.ts'


const navigationItems = ref<LINK_ITEM_TYPE[]>([ ...NavigationList as LINK_ITEM_TYPE[] ])
const visible = ref<boolean>(false)
const tabList = ref<TAB_ITEM[]>([])
const linkList = ref<LINK_ITEM_TYPE[]>([])

const show = () => {
  init()
  visible.value = true
}
const hide = () => {
  visible.value = false
}

const init = async () => {
  const res = await getTabData()
  tabList.value = res.map((item: TAB_ITEM) => {
    return {
      name: item.name,
      id: item.id
    }
  })
  linkList.value = res.find((item: TAB_ITEM) => item.id === '1').list
}

defineExpose({
  show,
  hide
})
</script>

<style lang="less" scoped>
.link-list-box {
  background-image: url("@/assets/image/link/list_bg.png");
  background-repeat: no-repeat;
  background-size: 100% auto;
}
</style>
