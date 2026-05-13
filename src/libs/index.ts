import DEFAULT_LINK_LIST from '@/assets/json/link.json'
import COMMON_LINK_LIST from '@/assets/json/commonly.json'
import { COMMON_LINK_LIST_KEY, LINK_LIST_KEY } from '@/libs/const/index.ts'
import { readLinkStorageValue, writeLinkStorageValue } from '@/libs/db/linkRepository'
import type { LINK_ITEM_TYPE, TAB_ITEM } from '@/libs/const/type'

// 防抖
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
export const getCommonLinkData = async (): Promise<LINK_ITEM_TYPE[]> => {
  return readLinkStorageValue<LINK_ITEM_TYPE[]>(COMMON_LINK_LIST_KEY, COMMON_LINK_LIST as LINK_ITEM_TYPE[])
}
// 批量替换常用快捷链接数据
export const replaceCommonLinkListData = async (data: LINK_ITEM_TYPE[]) => {
  return writeLinkStorageValue(COMMON_LINK_LIST_KEY, data)
}
// 修改常用link数据
export const setCommonLinkData = async (data: any) => {
  const {id} = data
  const LIST = await getCommonLinkData()
  let index = LIST.findIndex((item: any) => item.id === id)
  if (index === -1) {
    LIST.push(data)
  } else {
    LIST[index] = {...LIST[index], ...data}
  }
  return replaceCommonLinkListData(LIST)
}
// 删除常用link数据
export const deleteCommonLinkData = async (data: any) => {
  const {id} = data
  const LIST = await getCommonLinkData()
  let index = LIST.findIndex((item: any) => item.id === id)
  if (index === -1) {
    return false
  }
  LIST.splice(index, 1)
  return replaceCommonLinkListData(LIST)
}

// 获取全量快捷链接数据
export const getLinkData = async (): Promise<TAB_ITEM[]> => {
  return readLinkStorageValue<TAB_ITEM[]>(LINK_LIST_KEY, DEFAULT_LINK_LIST as TAB_ITEM[])
}
// 批量替换全量快捷链接数据
export const replaceLinkListData = async (data: TAB_ITEM[]) => {
  return writeLinkStorageValue(LINK_LIST_KEY, data)
}
// 修改link数据
export const setLinkData = async (data: any) => {
  const {id, parentId} = data
  const LIST = await getLinkData()

  if (parentId) {
    // 子级更新
    let parentIndex = LIST.findIndex((item: any) => item.id === parentId)
    if (parentIndex === -1) {
      return false
    }
    const parent = LIST[parentIndex]
    if (!parent) {
      return false
    }
    parent.list = parent.list || []
    let current = parent.list.findIndex((item: any) => item.id === id)
    if (current === -1) {
      parent.list.push(data)
    } else {
      parent.list[current] = {...parent.list[current], ...data}
    }
  } else {
    // tab更新
    let index = LIST.findIndex((item: any) => item.id === id)
    if (index === -1) {
      LIST.push(data)
    } else {
      const current = LIST[index]
      if (!current) {
        return false
      }
      LIST[index] = {...current, ...data}
    }
  }
  return replaceLinkListData(LIST)
}
// 删除link数据
export const deleteLink = async (data: any) => {
  const {id, parentId} = data
  const LIST = await getLinkData()
  if (parentId) {
    // 子级更新
    let parentIndex = LIST.findIndex((item: any) => item.id === parentId)
    if (parentIndex === -1) {
      return false
    }
    const parent = LIST[parentIndex]
    if (!parent?.list) {
      return false
    }
    let current = parent.list.findIndex((item: any) => item.id === id)
    if (current === -1) {
      return false
    }
    parent.list.splice(current, 1)
  } else {
    // tab更新
    let index = LIST.findIndex((item: any) => item.id === id)
    if (index === -1) {
      return false
    }
    LIST.splice(index, 1)
  }
  return replaceLinkListData(LIST)
}

// 更新当前选中tab的链接列表
export const updateCurrentTabLinkList = async (data: any) => {
  const {id, linkList} = data
  let LIST = await getLinkData()
  let index = LIST.findIndex((item: any) => item.id === id)
  if (index === -1) {
    return false
  }
  LIST[index].list = linkList
  return replaceLinkListData(LIST)
}
