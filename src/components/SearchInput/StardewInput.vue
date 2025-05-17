<template>
  <div class="h-full">
    <div
      contenteditable
      ref="editableDiv"
      @input="onInput"
      @keydown="onKeyDown"
      class="stardew-input w-full h-full indent-px flex items-center text-mouse"
    >
    </div>
    <div :style="{left: sickleLeft}" class="delete-animation absolute top-1/2 -translate-y-1/2 z-20" v-show="showSickle">
      <img class="sickle w-[20px] h-[20px] relative" src="@/assets/image/sickle.png" alt="">
    </div>
    <img v-if="inputText" @click="setInputValue('')" class="w-[20px] h-[20px] absolute top-1/2 -translate-y-1/2 right-[10px] pointer" src="@/assets/image/clean.png" alt="">
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { debounce } from '@/libs'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
const emit = defineEmits([ 'update:modelValue', 'stardewEnter' ])
const inputText = computed({
  get() {
    return props.modelValue.replace(/^&nbsp;/, '')
  },
  set(val: string) {
    emit('update:modelValue', val.replace(/^&nbsp;/, ''))
  }
})
const editableDiv = ref<HTMLElement | null>(null)
const showSickle = ref<boolean>(false) // 是否显示镰刀动画
const sickleLeft = ref<string>('0') // 镰刀图标的 left 偏移量（相对输入框）
const lastKey = ref<string>('') // 上一次按下的键，用于判断是否为删除
const isComposing = ref<boolean>(false) // 是否处于输入法组合输入中（防止误触发回车）

// 触发镰刀动画
const updateDeleteAnimationPosition = () => {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) {
    return
  }
  const range = sel.getRangeAt(0).cloneRange()
  const rect = range.getClientRects()[0]
  if (!rect) {
    return
  }
  const containerRect = editableDiv.value?.getBoundingClientRect()
  if (!containerRect) {
    return
  }
  const offsetX = rect.left - containerRect.left + 10 // 加10的间距
  sickleLeft.value = `${ offsetX }px`
  showSickle.value = true
  // 自动隐藏动画图标（需加上防抖）
  hideSickle()
}
const hideSickle = debounce(() => {
  showSickle.value = false
}, 300)
// 监听输入事件
const onInput = () => {
  const el = editableDiv.value
  const text = ( el?.innerText ?? '' ).trim()
  const isDeleting = [ 'Backspace', 'Delete' ].includes(lastKey.value)
  if (isDeleting) {
    // 判断是否删除操作
    updateDeleteAnimationPosition()
  }
  setInputValue(text)
  if (el) {
    el.scrollLeft = el.scrollWidth
  }
}

// 监听键盘事件，支持 Enter 键触发 enter 事件
const onKeyDown = (e: KeyboardEvent) => {
  lastKey.value = e.key
  if (e.key === 'Enter' && !isComposing.value) {
    e.preventDefault()
    emit('stardewEnter')
  }
}
// 给输入框赋值
const setInputValue = (value: string = '') => {
  inputText.value = value
  const el = editableDiv.value
  if (el && !value) {
    // div作为输入框时需保留一个字符串，否则会导致输入框为空时，光标位置垂直不居中的问题
    el.innerHTML = '&nbsp;'
  }
}
// 初始化输入框
const initInput = () => {
  const el = editableDiv.value
  if (!el) {
    return
  }
  if (el.innerText.trim() === '') {
    el.innerHTML = '&nbsp;'
  }
  // 由于用的是div做输入框，所以需要监听粘贴事件，将dom转为文字
  el.addEventListener('paste', (e: ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData?.getData('text/plain') ?? ''
    setInputValue(text)
    insertTextAtCursor(text)
    // 滚动到末尾
    el.scrollLeft = el.scrollWidth
  })
  el.addEventListener('compositionstart', () => {
    isComposing.value = true
  })
  el.addEventListener('compositionend', () => {
    isComposing.value = false
  })
}
// 手动插入文字
const insertTextAtCursor = (text: string) => {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) {
    return
  }
  sel.deleteFromDocument()
  sel.getRangeAt(0).insertNode(document.createTextNode(text))
  sel.collapseToEnd()
}

onMounted(() => {
  initInput()
})
</script>

<style lang="less" scoped>
.stardew-input {
  white-space: nowrap;
  overflow-x: scroll;
  font-size: 20px;
  position: relative;
  background-color: transparent;
  color: var(--text-color);
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
  &:focus {
    outline: none;
  }
}
.delete-animation {
  pointer-events: none;
  transition: transform 0.2s ease-out;
  .sickle {
    animation: sickle-animation 0.2s infinite;
  }
}
@keyframes sickle-animation {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(-90deg);
  }
}
</style>
