<template>
  <StardewDialog v-model="visible" :closeOnMask="false">
    <div class="pixel-dialog relative bg-[#EFBD73] p-5 w-[860px] max-w-[96vw] stardew-border stardew-font">
      <div class="close-box" @click="hide">
        <img src="@/assets/image/link/close.png" :alt="$t('common.close')">
      </div>
      <h3 class="dialog-title">
        {{ $t('pixelIcon.title') }}
      </h3>

      <div class="pixel-workbench">
        <div class="media-panel">
          <label class="control-label">{{ $t('pixelIcon.crop') }}</label>
          <div
            ref="cropBoxRef"
            class="crop-box bg-[#f7f1df] relative overflow-hidden pointer"
            @pointerdown="handleCropPointerDown"
            @wheel.prevent="handleCropWheel"
          >
            <img v-if="sourcePreviewUrl" :src="sourcePreviewUrl" class="crop-image" :style="cropImageStyle" alt="">
            <div class="crop-frame"></div>
          </div>

          <div class="zoom-control">
            <label class="control-label">{{ $t('pixelIcon.zoom') }}</label>
            <input v-model.number="options.cropScale" class="zoom-slider pointer" type="range" min="1" max="3" step="0.05">
          </div>

          <div class="preview-row">
            <div class="preview-label">
              <label class="control-label">{{ $t('pixelIcon.preview') }}</label>
              <span class="preview-size">{{ options.outputSize }}px</span>
            </div>
            <div class="preview-box bg-[#f7f1df] flex items-center justify-center">
              <img v-if="previewUrl" :src="previewUrl" class="w-[112px] h-[112px] object-contain" :class="{pixelated: options.pixelSize !== 'original'}" alt="">
              <span v-else class="text-[#8E5F40] text-sm">{{ $t('pixelIcon.preview') }}</span>
            </div>
          </div>
        </div>

        <div class="control-panel">
          <div class="control-grid">
            <div class="control-section">
              <label class="control-label">{{ $t('pixelIcon.pixelSize') }}</label>
              <div class="segmented">
                <button v-for="size in pixelSizeOptions" :key="size.id" class="segment-button" :class="{active: options.pixelSize === size.id}" @click="options.pixelSize = size.id">
                  {{ size.name }}
                </button>
              </div>
            </div>

            <div class="control-section">
              <label class="control-label">{{ $t('pixelIcon.outputSize') }}</label>
              <div class="segmented">
                <button v-for="size in outputSizeOptions" :key="size" class="segment-button" :class="{active: options.outputSize === size}" @click="options.outputSize = size">
                  {{ size }}
                </button>
              </div>
            </div>

            <div class="control-section">
              <label class="control-label">{{ $t('pixelIcon.colors') }}</label>
              <div class="segmented">
                <button v-for="item in colorOptions" :key="item.id" class="segment-button" :class="{active: options.colorCount === item.id}" @click="options.colorCount = item.id">
                  {{ item.name }}
                </button>
              </div>
            </div>

            <div class="control-section">
              <label class="control-label">{{ $t('pixelIcon.radius') }}</label>
              <div class="segmented">
                <button v-for="item in radiusOptions" :key="item.id" class="segment-button" :class="{active: options.borderRadius === item.id}" @click="options.borderRadius = item.id">
                  {{ item.name }}
                </button>
              </div>
            </div>

            <div class="control-section">
              <label class="control-label">{{ $t('pixelIcon.background') }}</label>
              <div class="control-inline">
                <div class="segmented">
                  <button v-for="item in backgroundOptions" :key="item.id" class="segment-button" :class="{active: options.background === item.id}" @click="options.background = item.id">
                    {{ item.name }}
                  </button>
                </div>
                <input v-if="options.background === 'custom'" v-model="options.backgroundColor" type="color" class="color-picker pointer">
              </div>
            </div>

            <div class="control-section">
              <label class="control-label">{{ $t('pixelIcon.style') }}</label>
              <div class="segmented">
                <button v-for="preset in stylePresets" :key="preset.id" class="segment-button" :class="{active: activePresetId === preset.id}" @click="applyStylePreset(preset)">
                  {{ preset.name }}
                </button>
              </div>
            </div>
          </div>

          <div class="tone-section">
            <label class="control-label">{{ $t('pixelIcon.colorAdjust') }}</label>
            <div class="tone-panel">
              <div v-for="slider in colorSliders" :key="slider.key" class="tone-row">
                <span class="tone-label">
                  <span class="tone-swatch" :style="{ backgroundColor: slider.color }"></span>
                  {{ slider.name }}
                </span>
                <input v-model.number="options.colorAdjust[slider.key]" class="tone-slider pointer" :style="{ '--tone-track': slider.track }" type="range" min="-100" max="100" step="1">
                <span class="tone-value">{{ signedValue(options.colorAdjust[slider.key]) }}</span>
              </div>
            </div>
          </div>

          <div class="action-row">
            <button v-if="showUploadFallback" class="stardew-button compact-action" @click="openFallbackUpload">
              {{ $t('pixelIcon.uploadIcon') }}
            </button>
            <button class="stardew-button compact-action" :disabled="isProcessing || !currentBlob" @click="applyIcon">
              {{ $t('pixelIcon.apply') }}
            </button>
            <button class="stardew-button compact-action" :disabled="isProcessing || !currentBlob" @click="exportIcon">
              {{ $t('pixelIcon.export') }}
            </button>
            <input ref="fallbackFileInput" class="hidden" type="file" accept="image/*" @change="handleFallbackUpload">
          </div>
        </div>
      </div>

      <p class="h-[20px] mt-3 text-sm text-[#7B312A]">
        {{ errorMessage }}
      </p>
    </div>
  </StardewDialog>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import { computed, reactive, ref, watch, useTemplateRef, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { pixelateImage, type ColorAdjustOptions, type ColorCount, type PixelBackground, type PixelateOptions, type PixelSize } from '@/libs/pixelate'
import { saveIconBlob } from '@/libs/db/iconRepository'

type PixelSource = string | Blob | File
type ColorAdjustKey = keyof ColorAdjustOptions
interface StylePreset {
  id: string;
  name: string;
  adjust: ColorAdjustOptions;
}

const { t: $t } = useI18n()

const emit = defineEmits<{
  (e: 'apply', payload: { iconId: string }): void
}>()

const visible = ref<boolean>(false)
const source = ref<PixelSource | null>(null)
const sourcePreviewUrl = ref<string>('')
const fileName = ref<string>('stardew-tab-icon.png')
const previewUrl = ref<string>('')
const currentBlob = ref<Blob | null>(null)
const isProcessing = ref<boolean>(false)
const errorMessage = ref<string>('')
const showUploadFallback = ref<boolean>(false)

const options = reactive<PixelateOptions>({
  pixelSize: 'original',
  outputSize: 128,
  colorCount: 'original',
  background: 'transparent',
  backgroundColor: '#ffffff',
  cropScale: 1,
  cropOffsetX: 0,
  cropOffsetY: 0,
  borderRadius: 0,
  colorAdjust: {
    red: 0,
    green: 0,
    blue: 0,
    brightness: 0,
    saturation: 0
  }
})

const cropBoxRef = useTemplateRef<HTMLDivElement>('cropBoxRef')
const fallbackFileInput = useTemplateRef<HTMLInputElement>('fallbackFileInput')
const pixelSizeOptions = computed<Array<{ id: PixelSize; name: string }>>(() => [
  {id: 'original', name: $t('pixelIcon.originalConfig')},
  {id: 16, name: '16'},
  {id: 24, name: '24'},
  {id: 32, name: '32'},
  {id: 48, name: '48'}
])
const outputSizeOptions = [64, 96, 128]
const radiusOptions = computed(() => {
  const outputSize = options.outputSize
  return [
    {id: 0, name: '0'},
    {id: Math.round(outputSize / 16), name: `${ Math.round(outputSize / 16) }`},
    {id: Math.round(outputSize / 8), name: `${ Math.round(outputSize / 8) }`},
    {id: Math.round(outputSize / 4), name: `${ Math.round(outputSize / 4) }`},
    {id: Math.round(outputSize * 3 / 8), name: `${ Math.round(outputSize * 3 / 8) }`},
    {id: outputSize / 2, name: $t('pixelIcon.circle')}
  ]
})
const colorOptions = computed<Array<{ id: ColorCount; name: string }>>(() => [
  {id: 'original', name: $t('pixelIcon.originalColors')},
  {id: 8, name: '8'},
  {id: 16, name: '16'},
  {id: 32, name: '32'}
])
const backgroundOptions = computed<Array<{ id: PixelBackground; name: string }>>(() => [
  {id: 'transparent', name: $t('pixelIcon.transparent')},
  {id: 'white', name: $t('pixelIcon.white')},
  {id: 'custom', name: $t('pixelIcon.custom')}
])
const stylePresets = computed<StylePreset[]>(() => [
  {
    id: 'original',
    name: $t('pixelIcon.originalStyle'),
    adjust: {red: 0, green: 0, blue: 0, brightness: 0, saturation: 0}
  },
  {
    id: 'stardew',
    name: $t('pixelIcon.stardewStyle'),
    adjust: {red: 30, green: 20, blue: -44, brightness: -4, saturation: 6}
  },
  {
    id: 'wood',
    name: $t('pixelIcon.woodStyle'),
    adjust: {red: 22, green: 8, blue: -28, brightness: -8, saturation: -14}
  }
])
const colorSliders = computed<Array<{ key: ColorAdjustKey; name: string; color: string; track: string }>>(() => [
  {key: 'red', name: $t('pixelIcon.red'), color: '#c84c3a', track: 'linear-gradient(90deg, #3a1f1a 0%, #8e3a2b 50%, #ff6b4a 100%)'},
  {key: 'green', name: $t('pixelIcon.green'), color: '#6f9f3b', track: 'linear-gradient(90deg, #23301b 0%, #6f9f3b 50%, #b7e05c 100%)'},
  {key: 'blue', name: $t('pixelIcon.blue'), color: '#4f70b7', track: 'linear-gradient(90deg, #1e263c 0%, #4f70b7 50%, #56b2ff 100%)'},
  {key: 'brightness', name: $t('pixelIcon.brightness'), color: '#f3d77a', track: 'linear-gradient(90deg, #2d211b 0%, #b17b45 48%, #ffe68a 100%)'},
  {key: 'saturation', name: $t('pixelIcon.saturation'), color: '#c875c8', track: 'linear-gradient(90deg, #7b6a58 0%, #d49b3e 30%, #7cba4c 55%, #4a8fd8 78%, #d553bb 100%)'}
])
const activePresetId = computed(() => {
  const activePreset = stylePresets.value.find((preset) => {
    return Object.entries(preset.adjust).every(([key, value]) => options.colorAdjust[key as ColorAdjustKey] === value)
  })
  return activePreset?.id || ''
})

let renderToken = 0
let sourceObjectUrl = ''
let dragStart: {
  pointerId: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
} | null = null

const cropImageStyle = computed(() => {
  const scale = options.cropScale
  const offsetRatio = scale - 1
  return {
    width: `${ scale * 100 }%`,
    height: `${ scale * 100 }%`,
    transform: `translate(calc(-50% + ${ options.cropOffsetX * offsetRatio * 50 }%), calc(-50% + ${ options.cropOffsetY * offsetRatio * 50 }%))`
  }
})

const revokePreview = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

const revokeSourcePreview = () => {
  if (sourceObjectUrl) {
    URL.revokeObjectURL(sourceObjectUrl)
    sourceObjectUrl = ''
  }
  sourcePreviewUrl.value = ''
}

const setSourcePreview = (input: PixelSource) => {
  revokeSourcePreview()
  if (typeof input === 'string') {
    sourcePreviewUrl.value = input
    return
  }
  sourceObjectUrl = URL.createObjectURL(input)
  sourcePreviewUrl.value = sourceObjectUrl
}

const resetOptions = () => {
  options.pixelSize = 'original'
  options.outputSize = 128
  options.colorCount = 'original'
  options.background = 'transparent'
  options.backgroundColor = '#ffffff'
  options.cropScale = 1
  options.cropOffsetX = 0
  options.cropOffsetY = 0
  options.borderRadius = 0
  resetColorAdjust()
}

const clampCrop = () => {
  if (options.cropScale <= 1) {
    options.cropOffsetX = 0
    options.cropOffsetY = 0
    return
  }
  options.cropOffsetX = Math.min(Math.max(options.cropOffsetX, -1), 1)
  options.cropOffsetY = Math.min(Math.max(options.cropOffsetY, -1), 1)
}

const clampBorderRadius = () => {
  options.borderRadius = Math.min(Math.max(options.borderRadius, 0), options.outputSize / 2)
}

const handleCropPointerDown = (event: PointerEvent) => {
  if (!cropBoxRef.value) {
    return
  }
  cropBoxRef.value.setPointerCapture(event.pointerId)
  dragStart = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    offsetX: options.cropOffsetX,
    offsetY: options.cropOffsetY
  }
  cropBoxRef.value.addEventListener('pointermove', handleCropPointerMove)
  cropBoxRef.value.addEventListener('pointerup', handleCropPointerUp)
  cropBoxRef.value.addEventListener('pointercancel', handleCropPointerUp)
}

const handleCropPointerMove = (event: PointerEvent) => {
  if (!dragStart || !cropBoxRef.value) {
    return
  }
  const boxSize = cropBoxRef.value.clientWidth || 1
  const movableRatio = Math.max(options.cropScale - 1, 0.01)
  options.cropOffsetX = dragStart.offsetX + (event.clientX - dragStart.x) / (boxSize * movableRatio * 0.5)
  options.cropOffsetY = dragStart.offsetY + (event.clientY - dragStart.y) / (boxSize * movableRatio * 0.5)
  clampCrop()
}

const handleCropPointerUp = () => {
  if (!cropBoxRef.value) {
    dragStart = null
    return
  }
  cropBoxRef.value.removeEventListener('pointermove', handleCropPointerMove)
  cropBoxRef.value.removeEventListener('pointerup', handleCropPointerUp)
  cropBoxRef.value.removeEventListener('pointercancel', handleCropPointerUp)
  dragStart = null
}

const handleCropWheel = (event: WheelEvent) => {
  const nextScale = options.cropScale + (event.deltaY > 0 ? -0.08 : 0.08)
  options.cropScale = Math.min(Math.max(nextScale, 1), 3)
  clampCrop()
}

const signedValue = (value: number): string => {
  return value > 0 ? `+${ value }` : String(value)
}

const applyStylePreset = (preset: StylePreset) => {
  Object.assign(options.colorAdjust, preset.adjust)
}

const resetColorAdjust = () => {
  Object.assign(options.colorAdjust, {
    red: 0,
    green: 0,
    blue: 0,
    brightness: 0,
    saturation: 0
  })
}

const renderPreview = async () => {
  if (!source.value) {
    return
  }

  const token = ++renderToken
  isProcessing.value = true
  errorMessage.value = ''
  showUploadFallback.value = false

  try {
    const result = await pixelateImage(source.value, {...options})
    if (token !== renderToken) {
      URL.revokeObjectURL(result.url)
      return
    }
    revokePreview()
    previewUrl.value = result.url
    currentBlob.value = result.blob
  } catch (error) {
    if (token === renderToken) {
      currentBlob.value = null
      revokePreview()
      errorMessage.value = $t('pixelIcon.processImageError')
      showUploadFallback.value = true
    }
  } finally {
    if (token === renderToken) {
      isProcessing.value = false
    }
  }
}

const show = (input: PixelSource, name: string = 'stardew-tab-icon.png') => {
  setActiveSource(input, name)
  visible.value = true
  renderPreview()
}

const setActiveSource = (input: PixelSource, name: string = 'stardew-tab-icon.png') => {
  source.value = input
  fileName.value = name
  resetOptions()
  setSourcePreview(input)
}

const hide = () => {
  visible.value = false
}

const applyIcon = async () => {
  if (!currentBlob.value) {
    return
  }
  const iconId = await saveIconBlob(currentBlob.value)
  emit('apply', {iconId})
  hide()
}

const exportIcon = () => {
  if (!currentBlob.value) {
    return
  }
  const url = URL.createObjectURL(currentBlob.value)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName.value.endsWith('.png') ? fileName.value : `${ fileName.value }.png`
  link.click()
  URL.revokeObjectURL(url)
}

const openFallbackUpload = () => {
  fallbackFileInput.value?.click()
}

const handleFallbackUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  setActiveSource(file, file.name.replace(/\.[^.]+$/, '.png'))
  renderPreview()
}

watch(options, () => {
  clampCrop()
  clampBorderRadius()
  renderPreview()
}, {deep: true})

watch(visible, (isVisible) => {
  if (!isVisible) {
    source.value = null
    currentBlob.value = null
    errorMessage.value = ''
    showUploadFallback.value = false
    revokePreview()
    revokeSourcePreview()
  }
})

onBeforeUnmount(() => {
  revokePreview()
  revokeSourcePreview()
})

defineExpose({
  show,
  hide
})
</script>

<style lang="less" scoped>
@import "@/styles/common";
.close-box {
  .dialog-close-button();
}
.pixel-workbench {
  display: grid;
  grid-template-columns: 252px minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
}
.media-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}
.control-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 16px;
}
.control-section {
  min-width: 0;
}
.control-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.preview-row {
  display: grid;
  grid-template-columns: 82px 1fr;
  align-items: end;
  gap: 10px;
  margin-top: 2px;
}
.preview-label {
  min-width: 0;
}
.tone-section {
  min-width: 0;
}
.action-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: auto;
}
.preview-size {
  display: block;
  color: #7B312A;
  font-size: 12px;
  line-height: 1;
}
.preview-box {
  width: 128px;
  height: 128px;
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
}
.crop-box {
  width: 240px;
  height: 240px;
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  touch-action: none;
  user-select: none;
}
.crop-image {
  position: absolute;
  left: 50%;
  top: 50%;
  max-width: none;
  max-height: none;
  object-fit: cover;
  transform-origin: center;
  pointer-events: none;
}
.crop-frame {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.8), inset 0 0 0 4px rgba(80, 48, 44, 0.35);
  pointer-events: none;
}
.pixelated {
  image-rendering: pixelated;
}
.control-label {
  display: block;
  color: #4e3623;
  font-size: 0.8rem;
  margin-bottom: 5px;
}
.segmented {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.segment-button {
  min-width: 42px;
  padding: 4px 8px;
  line-height: 1.15;
  background: #f7f1df;
  color: #4e3623;
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  cursor: url("@/assets/image/cursor/pointer.png"), auto;
}
.segment-button.active {
  background: #C87529;
  color: #ffffff;
}
.compact-action {
  min-width: 72px;
  padding: 5px 10px;
  font-size: 13px;
}
.color-picker {
  width: 42px;
  height: 26px;
}
.zoom-slider {
  appearance: none;
  width: 100%;
  height: 16px;
  margin: 0;
  background: transparent;
}
.zoom-slider::-webkit-slider-runnable-track {
  height: 4px;
  background: #5b3521;
  box-shadow: 0 1px 0 rgba(255, 224, 150, 0.65);
}
.zoom-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  margin-top: -6px;
  border-radius: 999px;
  background: #b96522;
  border: 3px solid #5b3521;
  box-shadow: inset 2px 2px 0 #e39a3c, inset -2px -2px 0 #6e3519;
}
.zoom-slider::-moz-range-track {
  height: 4px;
  background: #5b3521;
}
.zoom-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #b96522;
  border: 3px solid #5b3521;
}
.tone-panel {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 0;
  background: transparent;
  border: 0;
}
.tone-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 34px;
  align-items: center;
  gap: 7px;
}
.tone-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4e3623;
  font-size: 12px;
  line-height: 1;
}
.tone-swatch {
  width: 13px;
  height: 13px;
  border: 2px solid #5b3521;
  border-radius: 999px;
  box-shadow: inset 2px 2px 0 rgba(255, 205, 109, 0.55), inset -2px -2px 0 rgba(91, 53, 33, 0.45);
}
.tone-slider {
  --tone-track: linear-gradient(90deg, #8E5F40, #CF802F);
  appearance: none;
  width: 100%;
  height: 16px;
  margin: 0;
  background: transparent;
}
.tone-slider::-webkit-slider-runnable-track {
  height: 4px;
  background: var(--tone-track);
  border: 1px solid rgba(91, 53, 33, 0.45);
  box-shadow: 0 1px 0 rgba(255, 224, 150, 0.65), 0 -1px 0 rgba(91, 53, 33, 0.35);
}
.tone-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  margin-top: -7px;
  border-radius: 999px;
  background: #b96522;
  border: 3px solid #5b3521;
  box-shadow: inset 2px 2px 0 #e39a3c, inset -2px -2px 0 #6e3519, 0 1px 0 rgba(91, 53, 33, 0.5);
}
.tone-slider::-moz-range-track {
  height: 4px;
  background: var(--tone-track);
  border: 1px solid rgba(91, 53, 33, 0.45);
  box-shadow: 0 1px 0 rgba(255, 224, 150, 0.65), 0 -1px 0 rgba(91, 53, 33, 0.35);
}
.tone-slider::-moz-range-thumb {
  width: 13px;
  height: 13px;
  border-radius: 999px;
  background: #b96522;
  border: 3px solid #5b3521;
  box-shadow: inset 2px 2px 0 #e39a3c, inset -2px -2px 0 #6e3519, 0 1px 0 rgba(91, 53, 33, 0.5);
}
.tone-value {
  color: #7B312A;
  font-size: 12px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.stardew-button:disabled {
  opacity: 0.55;
  transform: none;
}
@media (max-width: 760px) {
  .pixel-workbench,
  .control-grid {
    grid-template-columns: 1fr;
  }
  .crop-box {
    width: min(240px, 100%);
    aspect-ratio: 1;
    height: auto;
  }
  .preview-row {
    grid-template-columns: 82px 128px;
    justify-content: start;
  }
  .preview-box {
    width: 128px;
    height: 128px;
  }
}
</style>
