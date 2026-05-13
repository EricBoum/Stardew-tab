import { ICON_STORE, openDb } from './index'

export interface IconRecord {
  id: string;
  blob: Blob;
  mimeType: string;
  createdAt: number;
  updatedAt: number;
}

export const createIconId = (): string => {
  return `icon_${ Date.now() }_${ Math.random().toString(36).slice(2, 8) }`
}

export const saveIconBlob = async (blob: Blob, id: string = createIconId()): Promise<string> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ICON_STORE, 'readwrite')
    const now = Date.now()
    transaction.objectStore(ICON_STORE).put({
      id,
      blob,
      mimeType: blob.type || 'image/png',
      createdAt: now,
      updatedAt: now
    } satisfies IconRecord)

    transaction.oncomplete = () => resolve(id)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export const getIconBlob = async (id: string): Promise<Blob | undefined> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ICON_STORE, 'readonly')
    const request = transaction.objectStore(ICON_STORE).get(id)

    request.onsuccess = () => {
      const record = request.result as IconRecord | undefined
      resolve(record?.blob)
    }
    request.onerror = () => reject(request.error)
  })
}

export const getIconObjectUrl = async (id?: string): Promise<string> => {
  if (!id) {
    return ''
  }
  const blob = await getIconBlob(id)
  return blob ? URL.createObjectURL(blob) : ''
}

export const deleteIconBlob = async (id?: string): Promise<void> => {
  if (!id) {
    return
  }
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ICON_STORE, 'readwrite')
    transaction.objectStore(ICON_STORE).delete(id)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}
