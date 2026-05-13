import { useStorage } from '@/libs/storage'
import { getDbValue, setDbValue } from './index'
import { ensureStorageMigrated } from './migration'

const {getStorage, setStorage} = useStorage()
const LINK_STORAGE_FALLBACK_KEY = 'LINK_STORAGE_FALLBACK'
let useLegacyStorage = false

const cloneData = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data)) as T
}

const hasStoredValue = (value: unknown): boolean => {
  return value !== undefined && value !== null
}

export const readLinkStorageValue = async <T>(key: string, defaultValue: T): Promise<T> => {
  const migrated = await ensureStorageMigrated()
  useLegacyStorage = useLegacyStorage || Boolean(await getStorage<boolean>(LINK_STORAGE_FALLBACK_KEY))

  if (useLegacyStorage) {
    const legacyData = await getStorage<T>(key)
    if (hasStoredValue(legacyData)) {
      return cloneData(legacyData as T)
    }
  }

  if (migrated) {
    try {
      const dbData = await getDbValue<T>(key)
      if (hasStoredValue(dbData)) {
        return cloneData(dbData as T)
      }
    } catch (error) {
      console.warn(`Failed to read ${ key } from IndexedDB`, error)
    }
  }

  const legacyData = await getStorage<T>(key)
  if (hasStoredValue(legacyData)) {
    return cloneData(legacyData as T)
  }

  return cloneData(defaultValue)
}

export const writeLinkStorageValue = async <T>(key: string, value: T): Promise<boolean> => {
  const data = cloneData(value)
  const migrated = await ensureStorageMigrated()

  if (migrated && !useLegacyStorage) {
    try {
      await setDbValue(key, data)
      // Keep a lightweight mirror for fallback and short-term downgrade safety.
      await setStorage(key, data)
      await setStorage(LINK_STORAGE_FALLBACK_KEY, false)
      return true
    } catch (error) {
      console.warn(`Failed to write ${ key } to IndexedDB`, error)
    }
  }

  useLegacyStorage = true
  await setStorage(LINK_STORAGE_FALLBACK_KEY, true)
  await setStorage(key, data)
  return true
}
