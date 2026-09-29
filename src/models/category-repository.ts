import type { Category } from '@/models/category'

export interface CategoryRepository {
  hasSavedData(): boolean
  getAll(): Category[]
  saveAll(categories: Category[]): void
}
