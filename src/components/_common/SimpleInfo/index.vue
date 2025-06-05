<template>
  <div class="SimpleInfo">
    <div class="stardew-tips-title">
      <div class="main-title">
        {{ detail.title }}
      </div>
    </div>
    <div class="stardew-tips-desc">
      {{ detail.content }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  detail: {
    title: string,
    content: string
  }
}>()
</script>

<style lang="less" scoped>
.SimpleInfo {
  width: 100px;
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
  }
  .stardew-tips-desc {
    padding: 4px 6px 3px;
    line-height: 1.3;
    background: #FBD17C;
    font-size: 0.6rem;
    color: #333;
    text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
  }
}
</style>
