import { COMMON_LINK_LIST_KEY, LINK_LIST_KEY } from '@/libs/const'
import { useStorage } from '@/libs/storage'
import { isIndexedDbSupported, setDbValue } from './index'

const STORAGE_SCHEMA_VERSION_KEY = 'STORAGE_SCHEMA_VERSION'
const CURRENT_STORAGE_SCHEMA_VERSION = 1

interface StorageSchemaMeta {
  schemaVersion: number;
  migratedAt: number;
}

let migrationPromise: Promise<boolean> | null = null

const hasStoredValue = (value: unknown): boolean => {
  return value !== undefined && value !== null
}

const runStorageMigration = async (): Promise<boolean> => {
  if (!isIndexedDbSupported()) {
    return false
  }

  const {getStorage, setStorage} = useStorage()
  const meta = await getStorage<StorageSchemaMeta>(STORAGE_SCHEMA_VERSION_KEY)

  if (meta?.schemaVersion && meta.schemaVersion >= CURRENT_STORAGE_SCHEMA_VERSION) {
    return true
  }

  const legacyLinkList = await getStorage(LINK_LIST_KEY)
  const legacyCommonLinkList = await getStorage(COMMON_LINK_LIST_KEY)

  if (hasStoredValue(legacyLinkList)) {
    await setDbValue(LINK_LIST_KEY, legacyLinkList)
  }
  if (hasStoredValue(legacyCommonLinkList)) {
    await setDbValue(COMMON_LINK_LIST_KEY, legacyCommonLinkList)
  }

  await setStorage<StorageSchemaMeta>(STORAGE_SCHEMA_VERSION_KEY, {
    schemaVersion: CURRENT_STORAGE_SCHEMA_VERSION,
    migratedAt: Date.now()
  })

  return true
}

export const ensureStorageMigrated = async (): Promise<boolean> => {
  if (!migrationPromise) {
    migrationPromise = runStorageMigration().catch((error) => {
      migrationPromise = null
      console.warn('Storage migration failed, falling back to chrome.storage/localStorage', error)
      return false
    })
  }
  return migrationPromise
}
