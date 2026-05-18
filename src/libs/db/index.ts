const DB_NAME = 'stardew-tab'
const DB_VERSION = 1
const KEY_VALUE_STORE = 'keyValue'
export const ICON_STORE = 'icons'

interface KeyValueRecord<T = unknown> {
  key: string;
  value: T;
  updatedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null

export const isIndexedDbSupported = (): boolean => {
  return typeof indexedDB !== 'undefined'
}

export const openDb = (): Promise<IDBDatabase> => {
  if (!isIndexedDbSupported()) {
    return Promise.reject(new Error('IndexedDB is not supported'))
  }
  if (dbPromise) {
    return dbPromise
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(KEY_VALUE_STORE)) {
        db.createObjectStore(KEY_VALUE_STORE, {keyPath: 'key'})
      }
      if (!db.objectStoreNames.contains(ICON_STORE)) {
        db.createObjectStore(ICON_STORE, {keyPath: 'id'})
      }
    }

    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => {
        db.close()
        dbPromise = null
      }
      resolve(db)
    }
    request.onerror = () => {
      dbPromise = null
      reject(request.error)
    }
    request.onblocked = () => {
      dbPromise = null
      reject(new Error('IndexedDB open request was blocked'))
    }
  })

  return dbPromise
}

export const getDbValue = async <T>(key: string): Promise<T | undefined> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(KEY_VALUE_STORE, 'readonly')
    const request = transaction.objectStore(KEY_VALUE_STORE).get(key)

    request.onsuccess = () => {
      const record = request.result as KeyValueRecord<T> | undefined
      resolve(record?.value)
    }
    request.onerror = () => reject(request.error)
  })
}

export const setDbValue = async <T>(key: string, value: T): Promise<void> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(KEY_VALUE_STORE, 'readwrite')
    transaction.objectStore(KEY_VALUE_STORE).put({
      key,
      value,
      updatedAt: Date.now()
    } satisfies KeyValueRecord<T>)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export const deleteDbValue = async (key: string): Promise<void> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(KEY_VALUE_STORE, 'readwrite')
    transaction.objectStore(KEY_VALUE_STORE).delete(key)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}
