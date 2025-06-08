<template>
  <div class="stardew-select-container relative">
    <div
      class="stardew-select w-full bg-[#f7f1df] px-3 py-2"
      :class="{ 'stardew-select-open': isOpen, 'stardew-placeholder': !selectedLabel }"
      @click="toggleDropdown"
    >
      {{ selectedLabel || placeholder }}
    </div>
    <div
      v-if="isOpen"
      class="stardew-dropdown absolute w-full bg-[#f7f1df] mt-1 z-10"
    >
      <div
        v-for="option in options"
        :key="option.id"
        class="stardew-option px-3 py-2 hover:bg-[#C87529] hover:text-white"
        @click="selectOption(option)"
      >
        {{ option.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue?: string | number
  options: Array<{ name: string; id: string | number }>
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const option = props.options.find(opt => opt.id === props.modelValue)
  return option?.name
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    emit('focus')
  } else {
    emit('blur')
  }
}

const selectOption = (option: { name: string; id: string | number }) => {
  emit('update:modelValue', option.id)
  emit('change', option)
  isOpen.value = false
}
</script>

<style lang="less" scoped>
.stardew-select-container {
  font-family: 'StardewValley', sans-serif;
}

.stardew-select {
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  cursor: pointer;
}

.stardew-dropdown {
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  max-height: 200px;
  overflow-y: auto;
}

.stardew-option {
  cursor: pointer;
  &:hover {
    background-color: #C87529;
    color: white;
  }
}

.stardew-placeholder {
  color: #A0A0A0;
}
</style>
