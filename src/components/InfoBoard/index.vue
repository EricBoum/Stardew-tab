<template>
  <div class="InfoBoard absolute top-[30px] right-0 w-[200px] h-[150px] bg-blue-500">
    {{ props.information.season }}
    {{ props.information.week }}
    {{ props.information.time.hour }}
    {{ props.information.time.minute }}
    {{ props.information.time.second }}
  </div>
</template>

<script setup lang="ts">
import { type INFORMATION } from '@/libs/const'

const props = defineProps<{
  information: INFORMATION
}>()
</script>

<style lang="less" scoped>
.InfoBoard {
}
</style>
