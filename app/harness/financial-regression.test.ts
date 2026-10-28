import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createGoalFeatures } from '@/features/goals/model/goal-features'
import { createRecurrenceFeatures } from '@/features/recurrences/model/recurrence-features'
import { createTransactionFeatures } from '@/features/transactions/model/transaction-features'
import type { Goal } from '@/entities/goal/model/goal'
import type { Recurrence } from '@/entities/recurrence/model/recurrence'
import type { Transaction, TransactionInput } from '@/entities/transaction/model/transaction'
import { createGoalRepository, createRecurrenceRepository, createTransactionRepository } from '@/harness/helpers/in-memory-repositories'

const expense: TransactionInput = {
  type: 'SAIDA', description: 'Despesa sintetica', amountCents: 12345, date: '2026-09-15',
  responsible: 'CASA', paymentMethod: 'PIX', notes: 'fixture', categoryId: 'moradia',
  subcategoryId: null, behavior: 'FIXO', necessity: 'ESSENCIAL',
}

const recurrence: Recurrence = {
  id: 'recurrence-1', description: 'Assinatura sintetica', type: 'SAIDA', categoryId: 'assinaturas',
  subcategoryId: null, responsible: 'CASA', paymentMethod: 'PIX', behavior: 'FIXO',
  necessity: 'NECESSARIO', dueDay: 10, recurrenceValueType: 'FIXED', defaultAmountCents: 4990,
  active: true, startMonth: '2026-01',
}

describe('harness financeiro: lancamentos e parcelamentos', () => {
  beforeEach(() => {
    let id = 0
    vi.stubGlobal('crypto', { randomUUID: () => `harness-id-${++id}` })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('NG-TX-001 cria receita persistida em centavos', async () => {
    const store = createTransactionRepository()
    const created = await createTransactionFeatures(store.repository).createTransaction({ ...expense, type: 'ENTRADA', amountCents: 250050 })
    expect(store.get()).toEqual([created])
    expect(created).toMatchObject({ type: 'ENTRADA', amountCents: 250050, competence: '2026-09', status: 'PENDENTE', paidAt: null })
  })

  it('NG-TX-002 cria despesa preservando competencia e dados aplicaveis', async () => {
    const store = createTransactionRepository()
    const created = await createTransactionFeatures(store.repository).createTransaction(expense)
    expect(created).toMatchObject({ ...expense, competence: '2026-09', status: 'PENDENTE', paidAt: null })
    expect(store.get()).toEqual([created])
  })

  it('NG-TX-003 e NG-TX-004 isolam alteracao e exclusao de lancamentos independentes', async () => {
    const first: Transaction = { ...expense, id: 'first', competence: '2026-09', status: 'PENDENTE', paidAt: null, createdAt: '', updatedAt: '' }
    const second: Transaction = { ...first, id: 'second', description: 'Independente' }
    const store = createTransactionRepository([first, second])
    const features = createTransactionFeatures(store.repository)
    await features.updateTransaction('first', { ...expense, amountCents: 9999, date: '2026-10-15' })
    expect(store.get().find((item) => item.id === 'second')).toEqual(second)
    await features.deleteTransaction('first')
    expect(store.get()).toEqual([second])
  })

  it('NG-TX-005 alterna pagamento sem afetar lancamentos independentes', async () => {
    const first: Transaction = { ...expense, id: 'first', competence: '2026-09', status: 'PENDENTE', paidAt: null, createdAt: '', updatedAt: '' }
    const second: Transaction = { ...first, id: 'second' }
    const store = createTransactionRepository([first, second])
    const features = createTransactionFeatures(store.repository)
    expect(await features.toggleTransactionPaid('first')).toMatchObject({ status: 'PAGO', paidAt: expect.any(String) })
    expect(store.get().find((item) => item.id === 'second')).toEqual(second)
    expect(await features.toggleTransactionPaid('first')).toMatchObject({ status: 'PENDENTE', paidAt: null })
  })

  it('NG-PAR-001 cria seis parcelas de R$ 1.200,00 com grupo e competencias exatas', async () => {
    const store = createTransactionRepository()
    const installments = await createTransactionFeatures(store.repository).createCreditPurchase({ ...expense, paymentMethod: 'CREDITO', amountCents: 120000 }, 6)
    expect(installments).toHaveLength(6)
    expect(installments.map((item) => item.amountCents).reduce((sum, amount) => sum + amount, 0)).toBe(120000)
    expect(installments.map((item) => item.competence)).toEqual(['2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03'])
    expect(new Set(installments.map((item) => item.installmentGroupId)).size).toBe(1)
  })

  it('NG-PAR-002 distribui R$ 100,00 em tres parcelas sem perder centavos', async () => {
    const store = createTransactionRepository()
    const installments = await createTransactionFeatures(store.repository).createCreditPurchase({ ...expense, paymentMethod: 'CREDITO', amountCents: 10000 }, 3)
    expect(installments.map((item) => item.amountCents)).toEqual([3333, 3333, 3334])
    expect(installments.reduce((sum, item) => sum + item.amountCents, 0)).toBe(10000)
  })

  it('NG-PAR-003 caracteriza a edicao individual de uma parcela', async () => {
    const store = createTransactionRepository()
    const features = createTransactionFeatures(store.repository)
    const [first, ...siblings] = await features.createCreditPurchase({ ...expense, paymentMethod: 'CREDITO', amountCents: 9000 }, 3)
    await features.updateTransaction(first.id, { ...expense, paymentMethod: 'CREDITO', amountCents: 4000 })
    expect(store.get().find((item) => item.id === first.id)?.amountCents).toBe(4000)
    expect(store.get().filter((item) => siblings.some((sibling) => sibling.id === item.id)).map((item) => item.amountCents)).toEqual([3000, 3000])
  })

  it('NG-PAR-004 caracteriza exclusao individual e por grupo', async () => {
    const store = createTransactionRepository()
    const features = createTransactionFeatures(store.repository)
    const installments = await features.createCreditPurchase({ ...expense, paymentMethod: 'CREDITO', amountCents: 9000 }, 3)
    await features.deleteTransaction(installments[0].id)
    expect(store.get()).toHaveLength(2)
    await features.deleteTransaction(installments[1].id, true)
    expect(store.get()).toEqual([])
  })
})

describe('harness financeiro: recorrencias e metas', () => {
  beforeEach(() => {
    let id = 0
    vi.stubGlobal('crypto', { randomUUID: () => `harness-id-${++id}` })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('NG-REC-001 e NG-REC-002 geram mensalmente uma unica ocorrencia', async () => {
    const recurrences = createRecurrenceRepository([recurrence])
    let transactions: Transaction[] = []
    const features = createRecurrenceFeatures(recurrences.repository, async () => transactions, async (next) => { transactions = next })
    expect(await features.ensureRecurrencesForMonth('2026-09')).toMatchObject([{ recurrenceId: recurrence.id, competence: '2026-09', amountCents: 4990 }])
    expect(await features.ensureRecurrencesForMonth('2026-09')).toEqual([])
    expect(transactions).toHaveLength(1)
  })

  it('NG-REC-003 cancela uma ocorrencia por competencia de origem sem bloquear a proxima', async () => {
    const recurrences = createRecurrenceRepository([{ ...recurrence, paymentMethod: 'CREDITO' }])
    let transactions: Transaction[] = []
    const features = createRecurrenceFeatures(recurrences.repository, async () => transactions, async (next) => { transactions = next })
    const [generated] = await features.ensureRecurrencesForMonth('2026-12')
    await features.cancelRecurrenceOccurrence(generated)
    await features.cancelRecurrenceOccurrence(generated)
    transactions = []
    expect(await features.ensureRecurrencesForMonth('2026-12')).toEqual([])
    expect(await features.ensureRecurrencesForMonth('2027-01')).toMatchObject([
      { competence: '2027-02', recurrenceSourceCompetence: '2027-01' },
    ])
  })

  it('NG-REC-004 alinha credito recorrente ao manual sem duplicar registros antigos', async () => {
    const recurrences = createRecurrenceRepository([{ ...recurrence, paymentMethod: 'CREDITO' }])
    let transactions: Transaction[] = []
    const features = createRecurrenceFeatures(recurrences.repository, async () => transactions, async (next) => { transactions = next })
    const [generated] = await features.ensureRecurrencesForMonth('2026-09')
    const transactionStore = createTransactionRepository()
    const manual = await createTransactionFeatures(transactionStore.repository).createTransaction({ ...expense, paymentMethod: 'CREDITO' })
    expect(generated.competence).toBe('2026-10')
    expect(generated.recurrenceSourceCompetence).toBe('2026-09')
    expect(manual.competence).toBe('2026-10')
  })

  it('NG-GOAL-001 e NG-GOAL-002 criam espelhos de aporte e retirada', async () => {
    const goal: Goal = { id: 'goal-1', name: 'Reserva sintetica', targetAmountCents: 100000, targetDate: '2026-12', active: true, createdAt: '' }
    const goals = createGoalRepository([goal])
    const transactions = createTransactionRepository()
    const transactionFeatures = createTransactionFeatures(transactions.repository)
    const features = createGoalFeatures(goals.repository, transactionFeatures.createGoalMovementTransaction, transactionFeatures.deleteTransactionsByGoalMovement)
    await features.createGoalMovement(goal.id, 'CONTRIBUTION', 25000, '2026-09-10', 'aporte')
    await features.createGoalMovement(goal.id, 'WITHDRAWAL', 5000, '2026-09-11', 'retirada')
    expect(goals.movements().map((item) => item.type)).toEqual(['CONTRIBUTION', 'WITHDRAWAL'])
    expect(transactions.get().map((item) => item.type)).toEqual(['SAIDA', 'ENTRADA'])
  })

  it('NG-GOAL-003 compensa o movimento quando o espelho falha', async () => {
    const goal: Goal = { id: 'goal-1', name: 'Reserva sintetica', targetAmountCents: 100000, targetDate: '2026-12', active: true, createdAt: '' }
    const goals = createGoalRepository([goal])
    const features = createGoalFeatures(goals.repository, async () => { throw new Error('falha sintetica no espelho') }, async () => {})
    await expect(features.createGoalMovement(goal.id, 'CONTRIBUTION', 1000, '2026-09-10', '')).rejects.toThrow('falha sintetica no espelho')
    expect(goals.movements()).toEqual([])
  })
})
