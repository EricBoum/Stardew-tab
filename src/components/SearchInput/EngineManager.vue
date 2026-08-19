<template>
  <StardewDialog v-model="visible">
    <div class="engine-manager bg-[#EFBD73] p-6 w-[560px] max-w-[94vw] relative stardew-border stardew-font">
      <div class="close-box" @click="hide">
        <img src="@/assets/image/link/close.png" :alt="$t('common.close')">
      </div>

      <!-- 列表视图 -->
      <template v-if="mode === 'list'">
        <h3 class="text-xl text-[#4e3623] font-bold mb-3">
          {{ $t('engine.title') }}
        </h3>
        <VueDraggable
          v-model="engineList"
          class="flex flex-col gap-2 max-h-[52vh] overflow-y-auto pr-1"
          :animation="150"
          handle=".engine-drag-handle"
          ghost-class="engine-ghost"
          @end="persist"
        >
          <div
            v-for="item in engineList"
            :key="item.id"
            :class="['flex items-center gap-3 border-2 border-[#6f3a1c] bg-[#f8d18a] px-3 py-2 shadow-[inset_-2px_-2px_0_#c98b45]', item.hidden && 'engine-row-hidden']"
          >
            <span class="engine-drag-handle select-none text-[#7b312a] cursor-move leading-none">⠿</span>
            <div class="w-[34px] h-[34px] shrink-0">
              <LinkIcon class="engine-icon-preview" :detail="toIconDetail(item)" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-[#4e3623]">{{ item.name }}</div>
              <div class="truncate text-xs text-[#7b312a]">{{ item.searchUrl || $t('engine.browserDefault') }}</div>
            </div>
            <button type="button" class="engine-mini-btn" @click="openEdit(item)">
              {{ $t('common.edit') }}
            </button>
            <button
              type="button"
              class="engine-mini-btn"
              :class="item.hidden ? '' : 'engine-mini-btn--danger'"
              :disabled="item.hidden ? visibleEngineCount >= MAX_VISIBLE_SEARCH_ENGINE_NUM : visibleEngineCount <= 1"
              @click="toggleHidden(item)"
            >
              {{ item.hidden ? $t('engine.show') : $t('engine.hide') }}
            </button>
          </div>
        </VueDraggable>
        <button
          type="button"
          class="stardew-button w-full mt-3 disabled:opacity-55"
          :disabled="visibleEngineCount >= MAX_VISIBLE_SEARCH_ENGINE_NUM"
          @click="openAdd"
        >
          {{ visibleEngineCount >= MAX_VISIBLE_SEARCH_ENGINE_NUM ? $t('engine.reachLimit') : $t('engine.add') }}
        </button>
      </template>

      <!-- 增改表单视图 -->
      <template v-else>
        <h3 class="text-xl text-[#4e3623] font-bold mb-3">
          {{ editingId ? $t('engine.edit') : $t('engine.add') }}
        </h3>
        <div class="space-y-3 max-h-[56vh] overflow-y-auto pr-1">
          <div>
            <label class="engine-label">{{ $t('form.name') }}</label>
            <StardewInput v-model="form.name" :placeholder="$t('engine.placeholderName')" />
          </div>
          <div v-if="form.kind !== 'chromeSearch'">
            <label class="engine-label">{{ $t('engine.searchUrl') }}</label>
            <StardewInput v-model="form.searchUrl" :placeholder="$t('engine.placeholderUrl')" @blur="autoFetchFavicon" />
            <p class="mt-1 text-xs text-[#7b312a]">{{ $t('engine.urlHint') }}</p>
          </div>
          <div>
            <label class="engine-label">{{ $t('engine.suggestionProvider') }}</label>
            <StardewSelect v-model="form.suggestionProvider" :options="providerOptions" class="w-full" />
          </div>
          <div v-if="form.kind !== 'chromeSearch'">
            <label class="engine-label">{{ $t('engine.icon') }}</label>
            <div class="flex items-center gap-3 bg-[#f7f1df] p-2 border-2 border-[#CF802F] border-l-[#8E5F40] border-b-[#8E5F40]">
              <div class="w-[48px] h-[48px] shrink-0 flex items-center justify-center">
                <LinkIcon class="engine-icon-preview" :detail="toIconDetail(form)" />
              </div>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="engine-mini-btn" :disabled="isFetchingIcon || !isValidUrl(form.searchUrl)" @click="fetchFavicon">
                  {{ isFetchingIcon ? $t('pixelIcon.fetchingIcon') : $t('dialog.getIcon') }}
                </button>
                <button type="button" class="engine-mini-btn" @click="triggerUpload">
                  {{ $t('common.upload') }}
                </button>
                <button type="button" class="engine-mini-btn engine-mini-btn--danger" @click="clearIcon">
                  {{ $t('common.clear') }}
                </button>
              </div>
              <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileChange">
            </div>
          </div>
        </div>
        <p v-if="formError" class="mt-2 px-2 py-1 border-2 border-[#8f3d27] bg-[#f8d18a] text-[#7b312a] text-xs">
          {{ formError }}
        </p>
        <div class="flex gap-3 mt-4">
          <button type="button" class="stardew-button flex-1" @click="backToList">{{ $t('engine.back') }}</button>
          <button type="button" class="stardew-button flex-1" @click="saveForm">{{ $t('common.save') }}</button>
        </div>
      </template>
    </div>
  </StardewDialog>
</template>

<script setup lang="ts">
import StardewDialog from '@/components/_components/StardewDialog/index.vue'
import StardewInput from '@/components/_components/StardewInput/index.vue'
import StardewSelect from '@/components/_components/StardewSelect/index.vue'
import LinkIcon from '@/components/_common/LinkIcon/index.vue'
import { ref, computed, useTemplateRef } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useI18n } from 'vue-i18n'
import type { SearchEngine, SuggestionProvider, LINK_ITEM_TYPE } from '@/libs/const/type'
import { MAX_VISIBLE_SEARCH_ENGINE_NUM } from '@/libs/const'
import { resolveEngineLogo, createEngineId } from '@/libs/searchEngines'
import { hasConfiguredSearchEngineIcon } from '@/libs/searchEngineRules'
import { useSearchEngines } from '@/hooks/useSearchEngines'
import { resolveFavicon } from '@/libs/favicon'
import { saveIconBlob } from '@/libs/db/iconRepository'

const { t: $t } = useI18n()
const { engines, init: initEngines, save: saveEngines } = useSearchEngines()

const visible = ref<boolean>(false)
const mode = ref<'list' | 'form'>('list')
const engineList = ref<SearchEngine[]>([])
const editingId = ref<string>('')
const formError = ref<string>('')
const isFetchingIcon = ref<boolean>(false)
const fileInputRef = useTemplateRef<HTMLInputElement>('fileInputRef')
let faviconRequestId = 0

const createEmptyForm = (): SearchEngine => ({
  id: '',
  name: '',
  searchUrl: '',
  suggestionProvider: 'auto',
  iconSource: 'favicon',
  logo: '',
  iconId: ''
})
const form = ref<SearchEngine>(createEmptyForm())
const visibleEngineCount = computed(() => engineList.value.filter(item => !item.hidden).length)

const providerOptions = computed(() => [
  {name: $t('engine.providerAuto'), id: 'auto'},
  {name: $t('engine.providerBaidu'), id: 'baidu'},
  {name: $t('engine.providerGoogle'), id: 'google'},
  {name: $t('engine.providerNone'), id: 'none'}
] as Array<{ name: string; id: SuggestionProvider }>)

const toIconDetail = (engine: SearchEngine): LINK_ITEM_TYPE => ({
  name: engine.name || '?',
  url: engine.searchUrl,
  type: 'img',
  logo: resolveEngineLogo(engine),
  iconId: engine.iconSource === 'builtin' ? undefined : engine.iconId
})

const isValidUrl = (url: string): boolean => {
  try {
    const u = new URL(url.replace('%s', 'test'))
    return [ 'http:', 'https:' ].includes(u.protocol)
  } catch {
    return false
  }
}

const show = async () => {
  await initEngines()
  // 用工作副本编辑，拖拽/增删改在 persist 时才落库并同步全局
  engineList.value = JSON.parse(JSON.stringify(engines.value))
  mode.value = 'list'
  visible.value = true
}
const hide = () => {
  visible.value = false
}

const persist = async () => {
  await saveEngines(JSON.parse(JSON.stringify(engineList.value)))
}

const openAdd = () => {
  if (visibleEngineCount.value >= MAX_VISIBLE_SEARCH_ENGINE_NUM) {
    return
  }
  editingId.value = ''
  form.value = createEmptyForm()
  formError.value = ''
  mode.value = 'form'
}
const openEdit = (item: SearchEngine) => {
  editingId.value = item.id
  form.value = JSON.parse(JSON.stringify(item))
  formError.value = ''
  mode.value = 'form'
}
const backToList = () => {
  faviconRequestId += 1
  isFetchingIcon.value = false
  mode.value = 'list'
}

const toggleHidden = async (item: SearchEngine) => {
  if (!item.hidden && visibleEngineCount.value <= 1) {
    return
  }
  if (item.hidden && visibleEngineCount.value >= MAX_VISIBLE_SEARCH_ENGINE_NUM) {
    return
  }
  item.hidden = !item.hidden
  await persist()
}

// 自动抓取 favicon（URL 失焦时，仅在当前无图标时触发）
const autoFetchFavicon = async () => {
  if (hasConfiguredSearchEngineIcon(form.value)) {
    return
  }
  await fetchFavicon()
}
const fetchFavicon = async () => {
  if (form.value.kind === 'chromeSearch' || !isValidUrl(form.value.searchUrl)) {
    return
  }
  const requestId = ++faviconRequestId
  isFetchingIcon.value = true
  try {
    const siteUrl = form.value.searchUrl.replace('%s', '')
    const favicon = await resolveFavicon(siteUrl, {forceRefresh: false})
    if (requestId !== faviconRequestId) {
      return
    }
    form.value.iconSource = 'favicon'
    form.value.logo = favicon.logo
    form.value.iconId = favicon.iconId || ''
    form.value.builtinLogoKey = undefined
  } catch (error) {
    console.warn('Failed to fetch engine favicon', error)
  } finally {
    if (requestId === faviconRequestId) {
      isFetchingIcon.value = false
    }
  }
}

const triggerUpload = () => {
  fileInputRef.value?.click()
}
const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file) {
    return
  }
  const iconId = await saveIconBlob(file)
  form.value.iconSource = 'upload'
  form.value.iconId = iconId
  form.value.logo = ''
  form.value.builtinLogoKey = undefined
}
const clearIcon = () => {
  form.value.logo = ''
  form.value.iconId = ''
  form.value.builtinLogoKey = undefined
  form.value.iconSource = 'favicon'
}

const saveForm = async () => {
  const name = form.value.name.trim()
  if (!name) {
    formError.value = $t('engine.errorName')
    return
  }
  if (form.value.kind !== 'chromeSearch') {
    if (!form.value.searchUrl.trim() || !isValidUrl(form.value.searchUrl)) {
      formError.value = $t('engine.errorUrl')
      return
    }
  }
  formError.value = ''
  const payload: SearchEngine = {...form.value, name}

  if (editingId.value) {
    const index = engineList.value.findIndex(item => item.id === editingId.value)
    if (index !== -1) {
      engineList.value[index] = payload
    }
  } else {
    if (visibleEngineCount.value >= MAX_VISIBLE_SEARCH_ENGINE_NUM) {
      mode.value = 'list'
      return
    }
    payload.id = createEngineId()
    engineList.value.push(payload)
  }
  await persist()
  mode.value = 'list'
}

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
.engine-label {
  display: block;
  color: #4e3623;
  font-size: 14px;
  margin-bottom: 4px;
}
.engine-mini-btn {
  font-family: 'StardewValley', sans-serif;
  padding: 2px 10px;
  font-size: 13px;
  color: #4e3623;
  background: #f6d26f;
  border: 2px solid #6f3a1c;
  box-shadow: inset -2px -2px 0 #c98b45;
  cursor: pointer;
  &:hover { background: #ffe0a3; }
  &:active { transform: translateY(1px); box-shadow: inset 2px 2px 0 #c98b45; }
  &:disabled { opacity: 0.55; cursor: default; }
  &--danger {
    color: #ffffff;
    background: #b86646;
    box-shadow: inset -2px -2px 0 #8f3d27;
    &:hover { background: #c87656; }
  }
}
.engine-ghost {
  opacity: 0.5;
}
.engine-row-hidden {
  opacity: 0.55;
}
.engine-icon-preview :deep(img) {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}
</style>
