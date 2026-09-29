import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCategoryFeatures } from '@/features/categories/model/category-features'
import type { CategoryRepository } from '@/entities/category/model/category-repository'
import type { Category } from '@/entities/category/model/category'
import type { Recurrence } from '@/entities/recurrence/model/recurrence'
import type { Transaction } from '@/entities/transaction/model/transaction'

function createRepository(initialCategories: Category[] = [], saved = false) {
  let categories = initialCategories
  let hasSavedData = saved
  const repository: CategoryRepository = {
    hasSavedData: async () => hasSavedData,
    getAll: async () => categories,
    saveAll: async (nextCategories) => { categories = nextCategories; hasSavedData = true },
  }
  return { repository, getStored: () => categories }
}

describe('category features', () => {
  beforeEach(() => {
    let id = 0
    vi.stubGlobal('crypto', { randomUUID: () => `id-${++id}` })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('semeia apenas quando a chave ainda nao existe e preserva colecao vazia salva', async () => {
    const missing = createRepository()
    const missingFeatures = createCategoryFeatures(missing.repository, async () => [], async () => [])
    expect(await missingFeatures.getCategories()).toHaveLength(9)
    expect(missing.getStored()[7]).toMatchObject({ id: 'reserva', name: 'Reserva' })

    const empty = createRepository([], true)
    const emptyFeatures = createCategoryFeatures(empty.repository, async () => [], async () => [])
    expect(await emptyFeatures.getCategories()).toEqual([])
  })

  it('cria, edita e exclui categorias e subcategorias', async () => {
    const fake = createRepository([], true)
    const features = createCategoryFeatures(fake.repository, async () => [], async () => [])

    await features.createCategory(' Casa ')
    const [category] = fake.getStored()
    expect(category).toEqual({ id: 'id-1', name: 'Casa', subcategories: [] })

    await features.updateCategory(category.id, 'Moradia')
    await features.createSubcategory(category.id, ' Aluguel ')
    const [updated] = fake.getStored()
    expect(updated).toEqual({ id: 'id-1', name: 'Moradia', subcategories: [{ id: 'id-2', name: 'Aluguel' }] })

    await features.updateSubcategory(category.id, 'id-2', 'Aluguel mensal')
    await features.deleteSubcategory(category.id, 'id-2')
    await features.deleteCategory(category.id)
    expect(fake.getStored()).toEqual([])
  })

  it('bloqueia referencias em Transaction ou Recurrence e permite excluir somente IDs sem referencia', async () => {
    const categories = [{ id: 'category-1', name: 'Categoria', subcategories: [{ id: 'subcategory-1', name: 'Sub' }] }]
    let transactions: Transaction[] = [{ categoryId: 'category-1', subcategoryId: 'subcategory-1' } as unknown as Transaction]
    let recurrences: Recurrence[] = []
    const fake = createRepository(categories, true)
    const features = createCategoryFeatures(fake.repository, async () => transactions, async () => recurrences)

    await expect(features.deleteCategory('category-1')).rejects.toThrow('Esta categoria possui lancamentos vinculados')
    await expect(features.deleteSubcategory('category-1', 'subcategory-1')).rejects.toThrow('Esta subcategoria possui lancamentos vinculados')

    transactions = []
    recurrences = [{ categoryId: 'category-1', subcategoryId: null } as unknown as Recurrence]
    await expect(features.deleteCategory('category-1')).rejects.toThrow('Esta categoria possui lancamentos vinculados')

    recurrences = [{ categoryId: 'other-category', subcategoryId: 'subcategory-1' } as unknown as Recurrence]
    await expect(features.deleteSubcategory('category-1', 'subcategory-1')).rejects.toThrow('Esta subcategoria possui lancamentos vinculados')

    recurrences = [{ categoryId: 'other-category', subcategoryId: 'other-subcategory' } as unknown as Recurrence]
    await features.deleteSubcategory('category-1', 'subcategory-1')
    await features.deleteCategory('category-1')
    expect(fake.getStored()).toEqual([])
  })
})
