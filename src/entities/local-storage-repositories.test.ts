import { beforeEach, describe, expect, it, vi } from 'vitest'
import { localStorageCategoryRepository } from '@/entities/category/api/local-storage-category-repository'
import { localStorageGoalRepository } from '@/entities/goal/api/local-storage-goal-repository'
import { localStorageRecurrenceRepository } from '@/entities/recurrence/api/local-storage-recurrence-repository'
import { localStorageTransactionRepository } from '@/entities/transaction/api/local-storage-transaction-repository'
import type { Category } from '@/entities/category/model/category'
import type { Goal, GoalMovement } from '@/entities/goal/model/goal'
import type { Recurrence } from '@/entities/recurrence/model/recurrence'
import type { Transaction } from '@/entities/transaction/model/transaction'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length() { return this.values.size }

  clear() { this.values.clear() }

  getItem(key: string) { return this.values.get(key) ?? null }

  key(index: number) { return [...this.values.keys()][index] ?? null }

  removeItem(key: string) { this.values.delete(key) }

  setItem(key: string, value: string) { this.values.set(key, value) }
}

const transaction: Transaction = {
  id: 'transaction-1', type: 'SAIDA', description: 'Compra parcelada', amountCents: 10000,
  date: '2026-09-15', competence: '2026-10', responsible: 'CASA', paymentMethod: 'CREDITO',
  status: 'PENDENTE', paidAt: null, notes: 'Teste', categoryId: 'reserva', subcategoryId: 'sub-1',
  behavior: 'VARIAVEL', necessity: 'NECESSARIO', installmentGroupId: 'group-1', installmentNumber: 1,
  installmentCount: 3, originalTotalAmountCents: 10000, recurrenceId: 'recurrence-1', needsValue: false,
  goalMovementId: 'movement-1', createdAt: '2026-09-15T10:00:00.000Z', updatedAt: '2026-09-15T10:00:00.000Z',
}

const category: Category = { id: 'reserva', name: 'Reserva', subcategories: [{ id: 'sub-1', name: 'Objetivo' }] }

const recurrence: Recurrence = {
  id: 'recurrence-1', description: 'Assinatura', type: 'SAIDA', categoryId: 'assinaturas', subcategoryId: null,
  responsible: 'CASA', paymentMethod: 'PIX', behavior: 'FIXO', necessity: 'NECESSARIO', dueDay: 10,
  recurrenceValueType: 'FIXED', defaultAmountCents: 4990, active: true, startMonth: '2026-01',
}

const goal: Goal = { id: 'goal-1', name: 'Reserva', targetAmountCents: 100000, targetDate: '2026-12', active: true, createdAt: '2026-01-01T00:00:00.000Z' }
const movement: GoalMovement = { id: 'movement-1', goalId: 'goal-1', type: 'CONTRIBUTION', amountCents: 25000, date: '2026-09-10', note: 'Aporte' }

describe('adapters LocalStorage async', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage())
  })

  it('le e grava transactions na chave atual preservando campos opcionais e vinculos', async () => {
    localStorage.setItem('finance.transactions', JSON.stringify([transaction]))
    expect(localStorageTransactionRepository.getAll()).toBeInstanceOf(Promise)
    expect(await localStorageTransactionRepository.getAll()).toEqual([transaction])

    await localStorageTransactionRepository.saveAll([transaction])
    expect(JSON.parse(localStorage.getItem('finance.transactions') ?? '[]')).toEqual([transaction])
    expect(await localStorageTransactionRepository.getAll()).toEqual([transaction])
  })

  it('distingue chave de categorias inexistente de colecao vazia salva e preserva categorias', async () => {
    expect(localStorageCategoryRepository.hasSavedData()).toBeInstanceOf(Promise)
    expect(await localStorageCategoryRepository.hasSavedData()).toBe(false)
    expect(await localStorageCategoryRepository.getAll()).toEqual([])

    localStorage.setItem('finance.categories', '[]')
    expect(await localStorageCategoryRepository.hasSavedData()).toBe(true)
    expect(await localStorageCategoryRepository.getAll()).toEqual([])

    await localStorageCategoryRepository.saveAll([category])
    expect(JSON.parse(localStorage.getItem('finance.categories') ?? '[]')).toEqual([category])
    expect(await localStorageCategoryRepository.getAll()).toEqual([category])
  })

  it('le e grava recorrencias na chave atual preservando o payload', async () => {
    localStorage.setItem('finance.recurrences', JSON.stringify([recurrence]))
    expect(localStorageRecurrenceRepository.getAll()).toBeInstanceOf(Promise)
    expect(await localStorageRecurrenceRepository.getAll()).toEqual([recurrence])

    await localStorageRecurrenceRepository.saveAll([recurrence])
    expect(JSON.parse(localStorage.getItem('finance.recurrences') ?? '[]')).toEqual([recurrence])
  })

  it('mantem goals e goalMovements em chaves separadas e preserva ambos', async () => {
    localStorage.setItem('finance.goals', JSON.stringify([goal]))
    localStorage.setItem('finance.goalMovements', JSON.stringify([movement]))
    expect(localStorageGoalRepository.getGoals()).toBeInstanceOf(Promise)
    expect(localStorageGoalRepository.getMovements()).toBeInstanceOf(Promise)
    expect(await localStorageGoalRepository.getGoals()).toEqual([goal])
    expect(await localStorageGoalRepository.getMovements()).toEqual([movement])

    await localStorageGoalRepository.saveGoals([goal])
    await localStorageGoalRepository.saveMovements([movement])
    expect(JSON.parse(localStorage.getItem('finance.goals') ?? '[]')).toEqual([goal])
    expect(JSON.parse(localStorage.getItem('finance.goalMovements') ?? '[]')).toEqual([movement])
  })

  it('mantem parse defensivo para as cinco chaves', async () => {
    localStorage.setItem('finance.transactions', '{')
    localStorage.setItem('finance.categories', '{')
    localStorage.setItem('finance.recurrences', '{')
    localStorage.setItem('finance.goals', '{')
    localStorage.setItem('finance.goalMovements', '{')

    expect(await localStorageTransactionRepository.getAll()).toEqual([])
    expect(await localStorageCategoryRepository.getAll()).toEqual([])
    expect(await localStorageRecurrenceRepository.getAll()).toEqual([])
    expect(await localStorageGoalRepository.getGoals()).toEqual([])
    expect(await localStorageGoalRepository.getMovements()).toEqual([])
  })
})
