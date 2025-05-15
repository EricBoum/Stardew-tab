/// <reference types="chrome" />
type StorageArea = typeof chrome.storage.local

const storage: StorageArea =
  typeof browser !== 'undefined' && browser.storage
    ? (browser.storage.local as StorageArea)
    : chrome.storage.local

export const useStorage = () => {
  const getStorage = <T = any>(key: string): Promise<T | undefined> => {
    return new Promise((resolve) => {
      storage.get([key], (result) => {
        resolve(result[key] as T)
      })
    })
  }

  const setStorage = <T = any>(key: string, value: T): Promise<void> => {
    return new Promise((resolve) => {
      storage.set({ [key]: value }, () => resolve())
    })
  }

  return { getStorage, setStorage }
}
