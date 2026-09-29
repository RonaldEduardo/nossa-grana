import type { Category } from '@/models/category'
import type { CategoryRepository } from '@/models/category-repository'

const storageKey = 'finance.categories'

export const localStorageCategoryRepository: CategoryRepository = {
  hasSavedData() {
    return localStorage.getItem(storageKey) !== null
  },
  getAll() {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return []
    try {
      return JSON.parse(stored) as Category[]
    } catch {
      return []
    }
  },
  saveAll(categories) {
    localStorage.setItem(storageKey, JSON.stringify(categories))
  },
}
