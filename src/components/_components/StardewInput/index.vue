<template>
  <template v-if="type === 'textarea'">
    <textarea
      class="stardew-input w-full bg-[#f7f1df] px-3 py-2 stardew-input"
      :placeholder="placeholder"
      :value="modelValue"
      :rows="rows"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
    ></textarea>
  </template>
  <template v-else>
    <input
      class="stardew-input w-full bg-[#f7f1df] px-3 py-2 stardew-input"
      type="text"
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
    >
  </template>
</template>

<script setup lang="ts">
const emit = defineEmits([ 'update:modelValue', 'focus', 'blur', 'keydown' ])
const props = defineProps<{
  modelValue?: string
  placeholder?: string
  rows?: number | string
  type?: 'text' | 'textarea'
}>()

// 设置默认值为 'text' 的方式
const type = props.type || 'text'

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
  if (target) {
    emit('update:modelValue', target.value)
  }
}

const onFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const onBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const onKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}
</script>

<style lang="less" scoped>
.stardew-input {
  font-family: 'StardewValley', sans-serif;
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #8ABD39;
  }
}
</style>
