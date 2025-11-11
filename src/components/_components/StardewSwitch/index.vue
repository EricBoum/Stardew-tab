<template>
  <div class="stardew-switch pointer" :class="{ 'stardew-switch-checked': modelValue }" @click="toggle">
    <div class="stardew-switch-handle"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: boolean
  disabled?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const toggle = () => {
  if (props.disabled) return

  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style lang="less" scoped>
.stardew-switch {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 28px;
  background-color: #8e5f40;
  border: 2px solid #cf802f;
  border-left-color: #8e5f40;
  border-bottom-color: #8e5f40;
  transition: background-color 0.3s;
  font-family: 'StardewValley', sans-serif;

  &:hover {
    background-color: #7a5237;
  }

  &.stardew-switch-checked {
    background-color: #8abd39;
    border-color: #6a9d29;
    border-left-color: #5a8d19;
    border-bottom-color: #5a8d19;

    &:active {
      .stardew-switch-handle {
        left: 22px;
      }
    }
    &:hover {
      background-color: #7aad29;
    }

    .stardew-switch-handle {
      left: 28px;
      background-color: #f7f1df;
    }
  }

  &:active {
    .stardew-switch-handle {
      width: 28px;
    }
  }
}

.stardew-switch-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: #f7f1df;
  border: 2px solid #cf802f;
  border-left-color: #8e5f40;
  border-bottom-color: #8e5f40;
  transition: left 0.3s, width 0.1s;
}
</style>
