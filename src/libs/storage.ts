/// <reference types="chrome" />
type StorageArea = typeof chrome.storage.local
declare var browser: typeof chrome

const storage: StorageArea = ( () => {
  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage?.local
    ) {
      return chrome.storage.local
    } else if (typeof browser !== 'undefined' && browser.storage?.local) {
      return browser.storage.local
    }
  } catch (_) {
  }

  // fallback: use localStorage when chrome.storage is unavailable (e.g. dev mode)
  return {
    get: (keys: string[], callback: (items: Record<string, any>) => void) => {
      const result: Record<string, any> = {}
      keys.forEach((key: string) => {
        try {
          const item = localStorage.getItem(key)
          result[key] = item !== null ? JSON.parse(item) : null
        } catch {
          result[key] = null
        }
      })
      callback(result)
    },
    set: (
      items: Record<string, any>,
      callback?: () => void
    ) => {
      Object.entries(items).forEach(([ key, value ]) => {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch {
          console.warn(`Failed to store ${ key } in localStorage`)
        }
      })
      callback?.()
    }
  } as StorageArea
} )()

export const useStorage = () => {
  const getStorage = <T = any>(key: string): Promise<T | undefined> => {
    return new Promise((resolve) => {
      storage.get([ key ], (result) => {
        resolve(result[key] as T)
      })
    })
  }

  const setStorage = <T = any>(key: string, value: T): Promise<void> => {
    return new Promise((resolve) => {
      storage.set({[key]: value}, () => resolve())
    })
  }

  return {getStorage, setStorage}
}
