import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRecurrenceFeatures } from '@/features/recurrences/model/recurrence-features'
import type { RecurrenceRepository } from '@/entities/recurrence/model/recurrence-repository'
import type { Recurrence, RecurrenceCancellation, RecurrenceInput } from '@/entities/recurrence/model/recurrence'
import type { Transaction } from '@/entities/transaction/model/transaction'

function createRepository(initialRecurrences: Recurrence[] = []) {
  let recurrences = initialRecurrences
  let cancellations: RecurrenceCancellation[] = []
  const repository: RecurrenceRepository = {
    getAll: async () => recurrences,
    saveAll: async (nextRecurrences) => { recurrences = nextRecurrences },
    getCancellations: async () => cancellations,
    saveCancellations: async (nextCancellations) => { cancellations = nextCancellations },
  }
  return { repository, getStored: () => recurrences, getCancellations: () => cancellations }
}

const input: RecurrenceInput = {
  description: 'Assinatura', type: 'SAIDA', categoryId: 'assinaturas', subcategoryId: null,
  responsible: 'CASA', paymentMethod: 'PIX', behavior: 'FIXO', necessity: 'NECESSARIO', dueDay: 10,
  recurrenceValueType: 'FIXED', defaultAmountCents: 4990, active: true, startMonth: '2026-01',
}

describe('recurrence features', () => {
  beforeEach(() => {
    let id = 0
    vi.stubGlobal('crypto', { randomUUID: () => `id-${++id}` })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('cria, edita, ativa, desativa e exclui recorrencias', async () => {
    const fake = createRepository()
    const features = createRecurrenceFeatures(fake.repository, async () => [], async () => {})

    await features.createRecurrence(input)
    const [created] = fake.getStored()
    expect(created).toMatchObject({ ...input, id: 'id-1' })

    await features.updateRecurrence(created.id, { ...input, description: 'Streaming', startMonth: '2026-03' })
    await features.toggleRecurrence(created.id)
    expect(fake.getStored()[0]).toMatchObject({ description: 'Streaming', startMonth: '2026-03', active: false })

    await features.deleteRecurrence(created.id)
    expect(fake.getStored()).toEqual([])
  })

  it('gera FIXED e VARIABLE uma unica vez por competencia, respeitando startMonth e inativa', async () => {
    const fixed: Recurrence = { ...input, id: 'fixed', dueDay: 31 }
    const variable: Recurrence = { ...input, id: 'variable', recurrenceValueType: 'VARIABLE', defaultAmountCents: 0 }
    const future: Recurrence = { ...input, id: 'future', startMonth: '2026-10' }
    const inactive: Recurrence = { ...input, id: 'inactive', active: false }
    const fake = createRepository([fixed, variable, future, inactive])
    let transactions: Transaction[] = []
    const features = createRecurrenceFeatures(
      fake.repository,
      async () => transactions,
      async (nextTransactions) => { transactions = nextTransactions },
    )

    const first = await features.ensureRecurrencesForMonth('2026-09')
    const second = await features.ensureRecurrencesForMonth('2026-09')

    expect(first).toHaveLength(2)
    expect(first.find((transaction) => transaction.recurrenceId === 'fixed')).toMatchObject({ amountCents: 4990, date: '2026-09-28', needsValue: false })
    expect(first.find((transaction) => transaction.recurrenceId === 'variable')).toMatchObject({ amountCents: 0, needsValue: true })
    expect(second).toEqual([])
    expect(transactions).toHaveLength(2)
  })

  it('cancela somente a competencia de origem e preserva o cancelamento apos reiniciar', async () => {
    const credit: Recurrence = { ...input, id: 'credit', paymentMethod: 'CREDITO' }
    const fake = createRepository([credit])
    let transactions: Transaction[] = []
    const features = createRecurrenceFeatures(fake.repository, async () => transactions, async (next) => { transactions = next })

    const [december] = await features.ensureRecurrencesForMonth('2026-12')
    expect(december).toMatchObject({ competence: '2027-01', recurrenceSourceCompetence: '2026-12' })
    await features.cancelRecurrenceOccurrence(december)
    await features.cancelRecurrenceOccurrence(december)
    transactions = []

    const restarted = createRecurrenceFeatures(fake.repository, async () => transactions, async (next) => { transactions = next })
    expect(await restarted.ensureRecurrencesForMonth('2026-12')).toEqual([])
    expect(fake.getCancellations()).toEqual([{ recurrenceId: 'credit', sourceCompetence: '2026-12' }])
    expect(await restarted.ensureRecurrencesForMonth('2027-01')).toMatchObject([
      { competence: '2027-02', recurrenceSourceCompetence: '2027-01' },
    ])
  })

  it('mantem registro antigo sem metadado como gerado na competencia persistida', async () => {
    const credit: Recurrence = { ...input, id: 'credit', paymentMethod: 'CREDITO' }
    const legacy: Transaction = {
      id: 'legacy', type: 'SAIDA', description: credit.description, amountCents: credit.defaultAmountCents,
      date: '2026-12-10', competence: '2026-12', responsible: 'CASA', paymentMethod: 'CREDITO',
      status: 'PENDENTE', paidAt: null, notes: '', categoryId: 'assinaturas', subcategoryId: null,
      behavior: 'FIXO', necessity: 'NECESSARIO', recurrenceId: 'credit', createdAt: '', updatedAt: '',
    }
    const fake = createRepository([credit])
    let transactions = [legacy]
    const features = createRecurrenceFeatures(fake.repository, async () => transactions, async (next) => { transactions = next })

    expect(await features.ensureRecurrencesForMonth('2026-12')).toEqual([])
    expect(transactions).toEqual([legacy])
  })
})
