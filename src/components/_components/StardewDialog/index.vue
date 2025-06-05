<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      @click.self="close"
      class="fixed inset-0 z-[9999] bg-black/50 overflow-y-auto text-center p-8"
    >
      <span class="inline-block h-full align-middle" aria-hidden="true">&#8203;</span>
      <div class="inline-block align-middle text-left">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>
