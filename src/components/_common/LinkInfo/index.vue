<template>
  <div class="LinkInfo">
    <div class="stardew-tips-title">
      <div class="main-title">
        {{ detail.name }}
      </div>
      <div class="sub-title">
        网站
      </div>
    </div>
    <div class="stardew-tips-desc">
      {{ detail.desc }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { type LINK_ITEM_TYPE } from '@/libs/const/type.ts'

defineProps<{
  detail: LINK_ITEM_TYPE
}>()
</script>

<style lang="less" scoped>
.LinkInfo {
  width: 120px;
  .stardew-tips-title {
    padding: 4px 6px 3px;
    background: #FBD17C;
    border-bottom: 2px solid #CF802F;
    .main-title {
      font-size: 0.7rem;
      font-weight: bold;
      color: #000;
      text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.1);
    }
    .sub-title {
      font-size: 0.55rem;
      color: #777;
      margin-top: 1px;
    }
  }
  .stardew-tips-desc {
    padding: 4px 6px 3px;
    font-size: 0.6rem;
    color: #333;
    line-height: 1.3;
    background: #FBD17C;
    text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
  }
}
</style>
