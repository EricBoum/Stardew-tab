<template>
  <Teleport to="body">
    <div v-if="modelValue" class="stardew-alert-mask">
      <div class="stardew-alert-box">
        <div class="alert-message">{{ message }}</div>
        <div class="close-button pointer" @click="$emit('update:modelValue', false)">
          <img src="@/assets/image/link/close.png" alt="关闭" class="close-icon pointer">
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps({
  modelValue: Boolean,
  message: {
    type: String,
    default: ''
  }
})
defineEmits([ 'update:modelValue' ])
</script>

<style scoped lang="less">
.stardew-alert-mask {
  position: fixed;
  z-index: 20;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}
.stardew-alert-box {
  background: #EFBD73;
  border: 3px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  outline: 3px solid #552E2B;
  font-family: 'StardewValley', sans-serif;
  color: #4e3623;
  min-width: 260px;
  max-width: 90vw;
  padding: 20px 20px 20px 20px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.32);
  border-radius: 2px;
  text-align: center;
  position: relative;
}
/* 关闭按钮样式 */
.close-button {
  position: absolute;
  top: -30px;
  right: -20px;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  z-index: 5;
}
.close-button:hover {
  transform: scale(1.1);
}
.close-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  filter: drop-shadow(-1px 1px 0 rgba(0, 0, 0, 0.2));
}
/* 消息文本样式 */
.alert-message {
  margin: 10px 0 5px;
  font-size: 1.1rem;
  line-height: 1.5;
  text-align: center;
  width: 100%;
  padding: 0 20px;
}
</style>
