import DEFAULT_LINK_LIST from '@/assets/json/link.json'
import COMMON_LINK_LIST from '@/assets/json/commonly.json'
import { useStorage } from '@/libs/storage.ts'
import { COMMON_LINK_LIST_KEY, LINK_LIST_KEY } from '@/libs/const/index.ts'

// 防抖
const {setStorage, getStorage} = useStorage()
export const debounce = (fn: Function, delay: number = 300) => {
  let timer: number | null = null
  const debounced = function (this: any) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments)
    }, delay)
  }
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
  return debounced
}

// 获取常用快捷链接
export const getCommonLinkData = async () => {
  let LIST = JSON.parse(JSON.stringify(COMMON_LINK_LIST))
  const storageData = await getStorage(COMMON_LINK_LIST_KEY)
  if (storageData) {
    LIST = storageData
  }
  return JSON.parse(JSON.stringify(LIST))
}
// 修改常用link数据
export const setCommonLinkData = async (data: any) => {
  const {id} = data
  const LIST = await getCommonLinkData()
  let index = LIST.findIndex((item: any) => item.id === id)
  LIST[index] = {...LIST[index], ...data}
  await setStorage(COMMON_LINK_LIST_KEY, LIST)
  return true
}
// 删除常用link数据
export const deleteCommonLinkData = async (data: any) => {
  const {id} = data
  const LIST = await getCommonLinkData()
  let index = LIST.findIndex((item: any) => item.id === id)
  LIST.splice(index, 1)
  await setStorage(COMMON_LINK_LIST_KEY, LIST)
  return true
}

// 获取全量快捷链接数据
export const getLinkData = async () => {
  let LIST = JSON.parse(JSON.stringify(DEFAULT_LINK_LIST))
  const storageData = await getStorage(LINK_LIST_KEY)
  if (storageData) {
    LIST = storageData
  }
  return JSON.parse(JSON.stringify(LIST))
}
// 修改link数据
export const setLinkData = async (data: any) => {
  const {id, parentId} = data
  const LIST = await getLinkData()

  if (parentId) {
    // 子级更新
    let parentIndex = LIST.findIndex((item: any) => item.id === parentId)
    let current = LIST[parentIndex].list.findIndex((item: any) => item.id === id)
    if (current === -1) {
      LIST[parentIndex].list.push(data)
    } else {
      LIST[parentIndex].list[current] = {...LIST[parentIndex].list[current], ...data}
    }
  } else {
    // tab更新
    let index = LIST.findIndex((item: any) => item.id === id)
    if (index === -1) {
      LIST.push(data)
    } else {
      LIST[index] = {...LIST[index], ...data}
    }
  }
  await setStorage(LINK_LIST_KEY, JSON.parse(JSON.stringify(LIST)))
  return true
}
// 删除link数据
export const deleteLink = async (data: any) => {
  const {id, parentId} = data
  const LIST = await getLinkData()
  if (parentId) {
    // 子级更新
    let parentIndex = LIST.findIndex((item: any) => item.id === parentId)
    let current = LIST[parentIndex].list.findIndex((item: any) => item.id === id)
    LIST[parentIndex].list.splice(current, 1)
  } else {
    // tab更新
    let index = LIST.findIndex((item: any) => item.id === id)
    LIST.splice(index, 1)
  }
  await setStorage(LINK_LIST_KEY, JSON.parse(JSON.stringify(LIST)))
  return true
}

// 更新当前选中tab的链接列表
export const updateCurrentTabLinkList = async (data: any) => {
  const {id, linkList} = data
  let LIST = await getLinkData()
  let index = LIST.findIndex((item: any) => item.id === id)
  LIST[index].list = linkList
  await setStorage(LINK_LIST_KEY, JSON.parse(JSON.stringify(LIST)))
  return true
}
