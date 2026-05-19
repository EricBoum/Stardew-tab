<template>
  <section class="icon-library-picker" :class="{ 'icon-library-picker-compact': compact }">
    <div v-if="showHeader" class="icon-library-header">
      <button v-if="showBack" type="button" class="icon-library-back pointer" @click="emit('close')">
        {{ $t('iconLibrary.back') }}
      </button>
      <h3 class="icon-library-title">
        {{ $t('iconLibrary.title') }}
      </h3>
    </div>

    <div class="icon-library-categories">
      <button
        v-for="category in categories"
        :key="category.key"
        type="button"
        class="icon-library-category pointer"
        :class="{ 'is-active': activeCategory === category.key }"
        @click="activeCategory = category.key"
      >
        {{ category.label }}
      </button>
    </div>

    <input
      v-model="searchText"
      class="icon-library-search"
      type="text"
      :placeholder="$t('iconLibrary.searchPlaceholder')"
    >

    <div class="icon-library-grid" :style="{ maxHeight }">
      <button
        v-for="icon in filteredIcons"
        :key="icon.key"
        type="button"
        class="icon-library-item pointer"
        :class="{ 'is-active': icon.key === selectedKey }"
        :title="icon.name"
        @click="emit('select', icon)"
      >
        <img class="icon-library-image" :src="icon.src" :alt="icon.name">
        <span class="icon-library-name">{{ icon.name }}</span>
      </button>
      <div v-if="filteredIcons.length === 0" class="icon-library-empty">
        {{ $t('iconLibrary.noIcons') }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { BUILTIN_ICON_CATEGORIES, BUILTIN_ICONS, type BuiltinIcon } from '@/libs/const/builtinIcons'

withDefaults(defineProps<{
  selectedKey?: string
  compact?: boolean
  showHeader?: boolean
  showBack?: boolean
  maxHeight?: string
}>(), {
  selectedKey: '',
  compact: false,
  showHeader: false,
  showBack: false,
  maxHeight: '240px'
})

const emit = defineEmits<{
  (event: 'select', icon: BuiltinIcon): void
  (event: 'close'): void
}>()

const { t: $t } = useI18n()

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  'animal-products': 'iconLibrary.category.animalProducts',
  artifacts: 'iconLibrary.category.artifacts',
  crops: 'iconLibrary.category.crops',
  fish: 'iconLibrary.category.fish',
  'menu-icons': 'iconLibrary.category.menuIcons',
  minerals: 'iconLibrary.category.minerals',
  resources: 'iconLibrary.category.resources',
  seeds: 'iconLibrary.category.seeds',
  'special-items': 'iconLibrary.category.specialItems',
  tools: 'iconLibrary.category.tools'
}

const activeCategory = ref<string>('all')
const searchText = ref<string>('')

const categories = computed(() => [
  { key: 'all', label: $t('iconLibrary.all') },
  ...BUILTIN_ICON_CATEGORIES.map((category) => ({
    key: category.key,
    label: $t(CATEGORY_LABEL_KEYS[category.key] || category.label)
  }))
])

const filteredIcons = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  return BUILTIN_ICONS.filter((icon) => {
    const matchesCategory = activeCategory.value === 'all' || icon.category === activeCategory.value
    const matchesSearch = !keyword || icon.name.toLowerCase().includes(keyword) || icon.key.toLowerCase().includes(keyword)
    return matchesCategory && matchesSearch
  })
})
</script>

<style lang="less" scoped>
.icon-library-picker {
  width: 100%;
}

.icon-library-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.icon-library-title {
  color: #4e3623;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}

.icon-library-back,
.icon-library-category,
.icon-library-item {
  font-family: 'StardewValley', sans-serif;
}

.icon-library-back {
  flex: 0 0 auto;
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  background: #f7f1df;
  color: #4e3623;
  padding: 4px 10px;
}

.icon-library-categories {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.icon-library-category {
  flex: 0 0 auto;
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  background: #f7f1df;
  color: #7B312A;
  font-size: 13px;
  line-height: 18px;
  padding: 3px 8px;

  &.is-active {
    background: #CF802F;
    color: #ffffff;
  }
}

.icon-library-search {
  width: 100%;
  margin: 4px 0 8px;
  padding: 6px 8px;
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  background: #f7f1df;
  color: #4e3623;
  font-family: 'StardewValley', sans-serif;
  outline: none;
}

.icon-library-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
  overflow-y: auto;
  padding-right: 2px;
}

.icon-library-item {
  min-width: 0;
  height: 70px;
  border: 2px solid #CF802F;
  border-left-color: #8E5F40;
  border-bottom-color: #8E5F40;
  background: #f7f1df;
  color: #4e3623;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 4px;

  &.is-active {
    background: #FFE08A;
    border-color: #8ABD39;
  }
}

.icon-library-image {
  width: 34px;
  height: 34px;
  object-fit: contain;
  image-rendering: pixelated;
}

.icon-library-name {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  font-size: 11px;
  line-height: 13px;
}

.icon-library-empty {
  grid-column: 1 / -1;
  color: #7B312A;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.icon-library-picker-compact {
  .icon-library-title {
    color: #ffffff;
  }

  .icon-library-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .icon-library-item {
    height: 62px;
  }

  .icon-library-image {
    width: 30px;
    height: 30px;
  }
}
</style>
