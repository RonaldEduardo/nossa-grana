export function readLocalStorageCollection<T>(key: string): T[] {
  let stored: string | null
  try {
    stored = localStorage.getItem(key)
  } catch (error) {
    throw storageError('ler', key, error)
  }
  if (stored === null) return []

  try {
    return JSON.parse(stored) as T[]
  } catch {
    throw new Error(`Dados locais invalidos na chave ${key}.`)
  }
}

export function hasLocalStorageValue(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null
  } catch (error) {
    throw storageError('ler', key, error)
  }
}

export function writeLocalStorageCollection<T>(key: string, collection: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(collection))
  } catch (error) {
    throw storageError('gravar', key, error)
  }
}

function storageError(operation: 'ler' | 'gravar', key: string, error: unknown): Error {
  const detail = error instanceof Error ? `: ${error.message}` : ''
  return new Error(`Falha ao ${operation} dados locais na chave ${key}${detail}`, { cause: error })
}
