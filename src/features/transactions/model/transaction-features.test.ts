import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTransactionFeatures } from '@/features/transactions/model/transaction-features'
import type { TransactionRepository } from '@/entities/transaction/model/transaction-repository'
import type { Transaction, TransactionInput } from '@/entities/transaction/model/transaction'

function createRepository(initialTransactions: Transaction[] = []) {
  let transactions = initialTransactions
  const repository: TransactionRepository = {
    getAll: async () => transactions,
    saveAll: async (nextTransactions) => { transactions = nextTransactions },
  }
  return { repository, getStored: () => transactions }
}

const input: TransactionInput = {
  type: 'SAIDA',
  description: 'Compra',
  amountCents: 10000,
  date: '2026-09-15',
  responsible: 'CASA',
  paymentMethod: 'PIX',
  notes: 'Teste',
  categoryId: 'category-1',
  subcategoryId: 'subcategory-1',
  behavior: 'VARIAVEL',
  necessity: 'NECESSARIO',
}

describe('transaction features', () => {
  beforeEach(() => {
    let id = 0
    vi.stubGlobal('crypto', { randomUUID: () => `id-${++id}` })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('cria transacao usando somente o repository injetado e preserva o payload', async () => {
    const { repository, getStored } = createRepository()
    const features = createTransactionFeatures(repository)

    const created = await features.createTransaction(input)

    expect(created).toMatchObject({
      ...input,
      id: 'id-1',
      competence: '2026-09',
      status: 'PENDENTE',
      paidAt: null,
    })
    expect(getStored()).toEqual([created])
  })

  it('preserva dados de parcelamento ao criar compra no credito', async () => {
    const { repository, getStored } = createRepository()
    const features = createTransactionFeatures(repository)

    const installments = await features.createCreditPurchase({ ...input, paymentMethod: 'CREDITO' }, 3)

    expect(installments.map((transaction) => transaction.amountCents)).toEqual([3333, 3333, 3334])
    expect(installments.map((transaction) => transaction.competence)).toEqual(['2026-10', '2026-11', '2026-12'])
    expect(installments.map((transaction) => transaction.installmentGroupId)).toEqual(['id-1', 'id-1', 'id-1'])
    expect(getStored()).toEqual(installments)
  })

  it('mantem atualizacao, pagamento e exclusao equivalentes', async () => {
    const transaction: Transaction = {
      ...input,
      id: 'transaction-1',
      competence: '2026-09',
      status: 'PENDENTE',
      paidAt: null,
      recurrenceId: 'recurrence-1',
      installmentGroupId: 'group-1',
      installmentNumber: 1,
      installmentCount: 2,
      originalTotalAmountCents: 10000,
      createdAt: '2026-09-15T10:00:00.000Z',
      updatedAt: '2026-09-15T10:00:00.000Z',
    }
    const sibling = { ...transaction, id: 'transaction-2', installmentNumber: 2 }
    const { repository, getStored } = createRepository([transaction, sibling])
    const features = createTransactionFeatures(repository)

    const updated = await features.updateTransaction(transaction.id, { ...input, date: '2026-10-15', amountCents: 9000 })
    expect(updated).toMatchObject({ competence: '2026-10', recurrenceId: 'recurrence-1', installmentGroupId: 'group-1' })

    const paid = await features.toggleTransactionPaid(transaction.id)
    expect(paid.status).toBe('PAGO')
    expect(paid.paidAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    await features.deleteTransaction(transaction.id, true)
    expect(getStored()).toEqual([])
  })

  it('bloqueia a exclusao comum de espelho de meta e preserva a operacao especifica', async () => {
    const mirror: Transaction = {
      ...input,
      id: 'transaction-1',
      competence: '2026-09',
      status: 'PENDENTE',
      paidAt: null,
      goalMovementId: 'movement-1',
      createdAt: '2026-09-15T10:00:00.000Z',
      updatedAt: '2026-09-15T10:00:00.000Z',
    }
    const { repository, getStored } = createRepository([mirror])
    const features = createTransactionFeatures(repository)

    await expect(features.deleteTransaction(mirror.id)).rejects.toThrow('Este lancamento e vinculado a uma meta')
    expect(getStored()).toEqual([mirror])

    await features.deleteTransactionsByGoalMovement('movement-1')
    expect(getStored()).toEqual([])
  })

  it('migra payload legado, preserva IDs e vinculos e regrava somente a colecao adaptada', async () => {
    const legacy = {
      id: 'legacy-transaction',
      type: 'SAIDA' as const,
      description: 'Legado',
      amount: 19.9,
      date: '2026-12-20',
      responsible: 'CASA' as const,
      paymentMethod: 'CREDITO' as const,
      status: 'PENDENTE' as const,
      paidAt: null,
      notes: '',
      categoryId: 'reserva',
      subcategoryId: 'sub-1',
      behavior: 'VARIAVEL' as const,
      necessity: 'NECESSARIO' as const,
      recurrenceId: 'recurrence-1',
      goalMovementId: 'movement-1',
      installmentGroupId: 'installment-group-1',
      createdAt: '2026-12-20T10:00:00.000Z',
      updatedAt: '2026-12-20T10:00:00.000Z',
    }
    const { repository, getStored } = createRepository([legacy as unknown as Transaction])
    const features = createTransactionFeatures(repository)

    const [migrated] = await features.getTransactions()

    expect(migrated).toMatchObject({
      id: 'legacy-transaction',
      amountCents: 1990,
      competence: '2027-01',
      recurrenceId: 'recurrence-1',
      goalMovementId: 'movement-1',
      installmentGroupId: 'installment-group-1',
    })
    expect(getStored()[0]).toEqual(migrated)
    expect(getStored()[0]).not.toHaveProperty('amount')
  })
})
