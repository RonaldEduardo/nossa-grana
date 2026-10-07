import type { CategoryRepository } from '@/entities/category/model/category-repository'
import type { Category } from '@/entities/category/model/category'
import type { Recurrence } from '@/entities/recurrence/model/recurrence'
import type { Transaction } from '@/entities/transaction/model/transaction'

const initialCategories: Category[] = [
  'Moradia', 'Alimentacao', 'Transporte', 'Saude', 'Pets', 'Lazer', 'Assinaturas', 'Reserva', 'Outros',
].map((name) => ({ id: name.toLowerCase(), name, subcategories: [] }))

export function createCategoryFeatures(
  categoryRepository: CategoryRepository,
  getTransactions: () => Promise<Transaction[]>,
  getRecurrences: () => Promise<Recurrence[]>,
) {
  async function readCategories(): Promise<Category[]> {
    const categories = await categoryRepository.getAll()
    if (categories.length === 0 && !(await categoryRepository.hasSavedData())) {
      await categoryRepository.saveAll(initialCategories)
      return initialCategories
    }
    return categories
  }

  async function saveCategories(categories: Category[]) {
    await categoryRepository.saveAll(categories)
  }

  async function getCategories() {
    return await readCategories()
  }

  async function createCategory(name: string) {
    const category: Category = { id: crypto.randomUUID(), name: name.trim(), subcategories: [] }
    await saveCategories([...(await readCategories()), category])
  }

  async function updateCategory(id: string, name: string) {
    await saveCategories((await readCategories()).map((category) => (category.id === id ? { ...category, name: name.trim() } : category)))
  }

  async function deleteCategory(id: string) {
    if ((await getTransactions()).some((transaction) => transaction.categoryId === id) || (await getRecurrences()).some((recurrence) => recurrence.categoryId === id)) {
      throw new Error('Esta categoria possui lancamentos vinculados e nao pode ser excluida.')
    }
    await saveCategories((await readCategories()).filter((category) => category.id !== id))
  }

  async function createSubcategory(categoryId: string, name: string) {
    await saveCategories((await readCategories()).map((category) => (
      category.id === categoryId
        ? { ...category, subcategories: [...category.subcategories, { id: crypto.randomUUID(), name: name.trim() }] }
        : category
    )))
  }

  async function updateSubcategory(categoryId: string, subcategoryId: string, name: string) {
    await saveCategories((await readCategories()).map((category) => (
      category.id === categoryId
        ? { ...category, subcategories: category.subcategories.map((subcategory) => (
          subcategory.id === subcategoryId ? { ...subcategory, name: name.trim() } : subcategory
        )) }
        : category
    )))
  }

  async function deleteSubcategory(categoryId: string, subcategoryId: string) {
    if ((await getTransactions()).some((transaction) => transaction.subcategoryId === subcategoryId) || (await getRecurrences()).some((recurrence) => recurrence.subcategoryId === subcategoryId)) {
      throw new Error('Esta subcategoria possui lancamentos vinculados e nao pode ser excluida.')
    }
    await saveCategories((await readCategories()).map((category) => (
      category.id === categoryId
        ? { ...category, subcategories: category.subcategories.filter((subcategory) => subcategory.id !== subcategoryId) }
        : category
    )))
  }

  return {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  }
}
