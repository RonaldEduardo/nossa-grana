import type { Category } from '@/entities/category/model/category'

export interface CategoryRepository {
  hasSavedData(): Promise<boolean>
  getAll(): Promise<Category[]>
  saveAll(categories: Category[]): Promise<void>
}
