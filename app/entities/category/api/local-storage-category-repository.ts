import type { Category } from '@/entities/category/model/category'
import type { CategoryRepository } from '@/entities/category/model/category-repository'
import { hasLocalStorageValue, readLocalStorageCollection, writeLocalStorageCollection } from '@/entities/shared/local-storage'

const storageKey = 'finance.categories'

export const localStorageCategoryRepository: CategoryRepository = {
  async hasSavedData() {
    return hasLocalStorageValue(storageKey)
  },
  async getAll() {
    return readLocalStorageCollection<Category>(storageKey)
  },
  async saveAll(categories) {
    writeLocalStorageCollection(storageKey, categories)
  },
}
