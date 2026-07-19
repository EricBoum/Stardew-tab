import { ref, computed } from 'vue'
import type { SearchEngine } from '@/libs/const/type'
import {
  getSearchEngines,
  saveSearchEngines,
  getSelectedEngineId,
  setSelectedEngineId
} from '@/libs/searchEngines'

// 全局共享的响应式引擎列表与选中态（同 useSystemSettings 的单例模式）
const engines = ref<SearchEngine[]>([])
const selectedId = ref<string>('')

let isInitialized = false

export function useSearchEngines() {
  const selectedEngine = computed<SearchEngine | undefined>(() => {
    return engines.value.find(item => item.id === selectedId.value) ?? engines.value[0]
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
    engines.value = list
    await saveSearchEngines(list)
    // 选中项可能被删除，重新校正
    if (!list.some(item => item.id === selectedId.value)) {
      selectedId.value = list[0]?.id ?? ''
      await setSelectedEngineId(selectedId.value)
    }
  }

  const setSelected = async (id: string) => {
    selectedId.value = id
    await setSelectedEngineId(id)
  }

  return {
    engines,
    selectedId,
    selectedEngine,
    init,
    save,
    setSelected
  }
}
