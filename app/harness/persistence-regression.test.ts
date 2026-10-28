import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { localStorageGoalRepository } from '@/entities/goal/api/local-storage-goal-repository'
import { localStorageCategoryRepository } from '@/entities/category/api/local-storage-category-repository'
import { localStorageRecurrenceRepository } from '@/entities/recurrence/api/local-storage-recurrence-repository'
import { localStorageTransactionRepository } from '@/entities/transaction/api/local-storage-transaction-repository'
import { createTransactionFeatures } from '@/features/transactions/model/transaction-features'
import type { Transaction, TransactionInput } from '@/entities/transaction/model/transaction'
import { MemoryStorage } from '@/harness/helpers/in-memory-repositories'

const input: TransactionInput = {
  type: 'SAIDA', description: 'Fixture sintetica', amountCents: 1990, date: '2026-12-20',
  responsible: 'CASA', paymentMethod: 'CREDITO', notes: '', categoryId: 'reserva',
  subcategoryId: null, behavior: 'VARIAVEL', necessity: 'NECESSARIO',
}

describe('harness de persistencia e integridade', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage())
    vi.stubGlobal('crypto', { randomUUID: () => 'harness-id' })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('NG-STO-001 interpreta base genuinamente vazia como vazia', async () => {
    expect(await localStorageTransactionRepository.getAll()).toEqual([])
    expect(await localStorageGoalRepository.getGoals()).toEqual([])
  })

  it('NG-STO-002 recusa JSON invalido e impede sobrescrita da colecao corrompida', async () => {
    localStorage.setItem('finance.transactions', '{')
    await expect(createTransactionFeatures(localStorageTransactionRepository).createTransaction(input)).rejects.toThrow('finance.transactions')
    expect(localStorage.getItem('finance.transactions')).toBe('{')
  })

  it('NG-STO-003 propaga com contexto falhas de leitura e gravacao em todas as colecoes', async () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('acesso indisponivel') } })
    await expect(localStorageTransactionRepository.getAll()).rejects.toThrow('Falha ao ler dados locais na chave finance.transactions')
    await expect(localStorageCategoryRepository.hasSavedData()).rejects.toThrow('Falha ao ler dados locais na chave finance.categories')
    await expect(localStorageCategoryRepository.getAll()).rejects.toThrow('Falha ao ler dados locais na chave finance.categories')
    await expect(localStorageRecurrenceRepository.getAll()).rejects.toThrow('Falha ao ler dados locais na chave finance.recurrences')
    await expect(localStorageRecurrenceRepository.getCancellations()).rejects.toThrow('Falha ao ler dados locais na chave finance.recurrenceCancellations')
    await expect(localStorageGoalRepository.getGoals()).rejects.toThrow('Falha ao ler dados locais na chave finance.goals')
    await expect(localStorageGoalRepository.getMovements()).rejects.toThrow('Falha ao ler dados locais na chave finance.goalMovements')

    vi.stubGlobal('localStorage', { setItem: () => { throw new Error('armazenamento indisponivel') } })
    await expect(localStorageTransactionRepository.saveAll([])).rejects.toThrow('Falha ao gravar dados locais na chave finance.transactions')
    await expect(localStorageCategoryRepository.saveAll([])).rejects.toThrow('Falha ao gravar dados locais na chave finance.categories')
    await expect(localStorageRecurrenceRepository.saveAll([])).rejects.toThrow('Falha ao gravar dados locais na chave finance.recurrences')
    await expect(localStorageRecurrenceRepository.saveCancellations([])).rejects.toThrow('Falha ao gravar dados locais na chave finance.recurrenceCancellations')
    await expect(localStorageGoalRepository.saveGoals([])).rejects.toThrow('Falha ao gravar dados locais na chave finance.goals')
    await expect(localStorageGoalRepository.saveMovements([])).rejects.toThrow('Falha ao gravar dados locais na chave finance.goalMovements')
  })

  it('NG-STO-004 migra o formato legado preservando ID, vinculos e centavos', async () => {
    const legacy = { ...input, id: 'legacy-id', amount: 19.9, amountCents: undefined, status: 'PENDENTE', paidAt: null, recurrenceId: 'recurrence-1', createdAt: '', updatedAt: '' }
    localStorage.setItem('finance.transactions', JSON.stringify([legacy]))
    const [migrated] = await createTransactionFeatures(localStorageTransactionRepository).getTransactions()
    expect(migrated).toMatchObject({ id: 'legacy-id', amountCents: 1990, competence: '2027-01', recurrenceId: 'recurrence-1' })
    expect(JSON.parse(localStorage.getItem('finance.transactions') ?? '[]') as Transaction[]).toEqual([migrated])
  })

  it('NG-STO-005 usa armazenamento sintetico isolado por teste', async () => {
    await localStorageTransactionRepository.saveAll([])
    expect(localStorage.getItem('finance.transactions')).toBe('[]')
  })
})
