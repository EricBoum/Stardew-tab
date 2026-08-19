import { ref, computed } from 'vue'
import type { SearchEngine } from '@/libs/const/type'
import {
  getSearchEngines,
  saveSearchEngines,
  getSelectedEngineId,
  setSelectedEngineId,
  normalizeSearchEngineList
} from '@/libs/searchEngines'
import {
  getVisibleSearchEngines,
  resolveSelectedSearchEngineId
} from '@/libs/searchEngineRules'

// 全局共享的响应式引擎列表与选中态（同 useSystemSettings 的单例模式）
const engines = ref<SearchEngine[]>([])
const selectedId = ref<string>('')

let isInitialized = false

export function useSearchEngines() {
  const visibleEngines = computed<SearchEngine[]>(() => {
    return getVisibleSearchEngines(engines.value)
  })

  const selectedEngine = computed<SearchEngine | undefined>(() => {
    return visibleEngines.value.find(item => item.id === selectedId.value)
      ?? visibleEngines.value[0]
  })

  const init = async () => {
    if (isInitialized) {
      return
    }
    engines.value = await getSearchEngines()
    selectedId.value = await getSelectedEngineId(engines.value)
    isInitialized = true
  }

  // 保存整份列表（增删改/排序后调用）
  const save = async (list: SearchEngine[]) => {
    const normalizedList = normalizeSearchEngineList(list)
    engines.value = normalizedList
    await saveSearchEngines(normalizedList)
    // 选中项可能被删除或隐藏，重新校正到可见引擎
    const nextSelectedId = resolveSelectedSearchEngineId(normalizedList, selectedId.value)
    if (nextSelectedId !== selectedId.value) {
      selectedId.value = nextSelectedId
      await setSelectedEngineId(selectedId.value)
    }
  }

  const setSelected = async (id: string) => {
    const nextSelectedId = resolveSelectedSearchEngineId(engines.value, id)
    selectedId.value = nextSelectedId
    await setSelectedEngineId(nextSelectedId)
  }

  return {
    engines,
    visibleEngines,
    selectedId,
    selectedEngine,
    init,
    save,
    setSelected
  }
}
