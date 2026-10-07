import type { Category } from '@/entities/category/model/category'
import type { CategoryRepository } from '@/entities/category/model/category-repository'

const storageKey = 'finance.categories'

export const localStorageCategoryRepository: CategoryRepository = {
  async hasSavedData() {
    return localStorage.getItem(storageKey) !== null
  },
  async getAll() {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return []
    try {
      return JSON.parse(stored) as Category[]
    } catch {
      return []
    }
  },
  async saveAll(categories) {
    localStorage.setItem(storageKey, JSON.stringify(categories))
  },
}
