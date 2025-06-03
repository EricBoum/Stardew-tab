<template>
  <div class="stardew-tips opacity-0 group-hover:opacity-100 absolute transition-opacity duration-200" :class="customClass" :style="customStyle">
    <div class="stardew-tips-title">
      <div class="main-title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div class="sub-title" v-if="$slots.subtitle || subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </div>
    </div>
    <div class="stardew-tips-desc">
      <slot>{{ description }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  description?: string
  customClass?: string
  customStyle?: string | object
}>()
</script>

<style scoped>
.stardew-tips {
  left: 50%;
  top: -80px; 
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 50; 
  width: 120px; 
  background: #EFBD73;
  border: 3px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  outline: 2px solid #552E2B;
  font-family: 'StardewValley', sans-serif;
  box-shadow: -2px 2px 0px rgba(0, 0, 0, 0.25); 
  image-rendering: pixelated;
  overflow: hidden;
  border-radius: 2px;
}

.stardew-tips-title {
  padding: 4px 6px 3px;
  background: #FBD17C;
  border-bottom: 2px solid #CF802F;
}

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

.stardew-tips-desc {
  padding: 4px 6px 3px;
  font-size: 0.6rem;
  color: #333;
  line-height: 1.3;
  background: #FBD17C;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
}
</style>
