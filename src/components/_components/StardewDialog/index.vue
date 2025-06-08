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
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  closeOnMask: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([ 'update:modelValue', 'on-close' ])

function close() {
  if (props.closeOnMask) {
    emit('update:modelValue', false)
    return
  }
  emit('on-close')
}
</script>
