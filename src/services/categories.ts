import type { Category } from '@/models/category'
import { localStorageCategoryRepository } from '@/infrastructure/local-storage-category-repository'
import { getTransactions } from '@/services/transactions'

const initialCategories: Category[] = [
  'Moradia', 'Alimentacao', 'Transporte', 'Saude', 'Pets', 'Lazer', 'Assinaturas', 'Reserva', 'Outros',
].map((name) => ({ id: name.toLowerCase(), name, subcategories: [] }))

function readCategories(): Category[] {
  const categories = localStorageCategoryRepository.getAll()
  if (categories.length === 0 && !localStorageCategoryRepository.hasSavedData()) {
    localStorageCategoryRepository.saveAll(initialCategories)
    return initialCategories
  }
  return categories
}

function saveCategories(categories: Category[]) {
  localStorageCategoryRepository.saveAll(categories)
}

export function getCategories() {
  return readCategories()
}

export function createCategory(name: string) {
  const category: Category = { id: crypto.randomUUID(), name: name.trim(), subcategories: [] }
  saveCategories([...readCategories(), category])
}

export function updateCategory(id: string, name: string) {
  saveCategories(readCategories().map((category) => (category.id === id ? { ...category, name: name.trim() } : category)))
}

export function deleteCategory(id: string) {
  if (getTransactions().some((transaction) => transaction.categoryId === id)) {
    throw new Error('Esta categoria possui lancamentos vinculados e nao pode ser excluida.')
  }
  saveCategories(readCategories().filter((category) => category.id !== id))
}

export function createSubcategory(categoryId: string, name: string) {
  saveCategories(readCategories().map((category) => (
    category.id === categoryId
      ? { ...category, subcategories: [...category.subcategories, { id: crypto.randomUUID(), name: name.trim() }] }
      : category
  )))
}

export function updateSubcategory(categoryId: string, subcategoryId: string, name: string) {
  saveCategories(readCategories().map((category) => (
    category.id === categoryId
      ? { ...category, subcategories: category.subcategories.map((subcategory) => (
        subcategory.id === subcategoryId ? { ...subcategory, name: name.trim() } : subcategory
      )) }
      : category
  )))
}

export function deleteSubcategory(categoryId: string, subcategoryId: string) {
  if (getTransactions().some((transaction) => transaction.subcategoryId === subcategoryId)) {
    throw new Error('Esta subcategoria possui lancamentos vinculados e nao pode ser excluida.')
  }
  saveCategories(readCategories().map((category) => (
    category.id === categoryId
      ? { ...category, subcategories: category.subcategories.filter((subcategory) => subcategory.id !== subcategoryId) }
      : category
  )))
}
