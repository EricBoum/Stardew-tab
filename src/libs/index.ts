import { useStorage } from '@/libs/storage.ts'
import { LINK_TAB_KEY } from '@/libs/const/index.ts'
import DEFAULT_TAB_LIST from '@/assets/json/link.json'

// 防抖
export const debounce = (fn: Function, delay: number = 300) => {
  let timer: number | null = null
  return function (this: any) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments)
    }, delay)
  }
}

// 获取tab数据
export const getTabData = async () => {
  let TAB_LIST = JSON.parse(JSON.stringify(DEFAULT_TAB_LIST))
  const {getStorage} = useStorage()
  const storageData = await getStorage(LINK_TAB_KEY)
  if (storageData) {
    TAB_LIST = storageData
  }
  return TAB_LIST
}
