import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category } from '@/entities/category/model/category'
import type { RecurrenceInput } from '@/entities/recurrence/model/recurrence'
import type { Transaction, TransactionInput } from '@/entities/transaction/model/transaction'
import { categoryFeatures, recurrenceFeatures } from '@/app/composition/features'
import { goalFeatures, transactionFeatures } from '@/app/composition/features'

const { deleteCategory, deleteSubcategory, getCategories } = categoryFeatures
const { createRecurrence, ensureRecurrencesForMonth } = recurrenceFeatures
const { createGoal, createGoalMovement, deleteGoal, deleteGoalMovement, getGoalMovements, getGoals } = goalFeatures
const { createTransaction, deleteTransaction, getTransactions, toggleTransactionPaid } = transactionFeatures

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length() { return this.values.size }

  clear() { this.values.clear() }

  getItem(key: string) { return this.values.get(key) ?? null }

  key(index: number) { return [...this.values.keys()][index] ?? null }

  removeItem(key: string) { this.values.delete(key) }

  setItem(key: string, value: string) { this.values.set(key, value) }
}

const transactionInput: TransactionInput = {
  type: 'SAIDA',
  description: 'Conta',
  amountCents: 1234,
  date: '2026-09-15',
  responsible: 'CASA',
  paymentMethod: 'PIX',
  notes: '',
  categoryId: 'moradia',
  subcategoryId: null,
  behavior: 'FIXO',
  necessity: 'ESSENCIAL',
}

const recurrenceInput: RecurrenceInput = {
  description: 'Assinatura',
  type: 'SAIDA',
  categoryId: 'assinaturas',
  subcategoryId: null,
  responsible: 'CASA',
  paymentMethod: 'PIX',
  behavior: 'FIXO',
  necessity: 'NECESSARIO',
  dueDay: 10,
  recurrenceValueType: 'FIXED',
  defaultAmountCents: 4990,
  active: true,
  startMonth: '2026-01',
}

function savedCategories(categories: Category[]) {
  localStorage.setItem('finance.categories', JSON.stringify(categories))
}

describe('caracterizacao dos services do MVP', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage())
  })

  it('cria lancamento pendente, preenche paidAt ao pagar e o limpa ao desfazer', async () => {
    const created = await createTransaction(transactionInput)
    expect(created.status).toBe('PENDENTE')
    expect(created.paidAt).toBeNull()

    const paid = await toggleTransactionPaid(created.id)
    expect(paid.status).toBe('PAGO')
    expect(paid.paidAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    const pending = await toggleTransactionPaid(created.id)
    expect(pending.status).toBe('PENDENTE')
    expect(pending.paidAt).toBeNull()
  })

  it('migra amount legado, corrige competencia e preserva IDs e vinculos', async () => {
    const legacy = {
      id: 'legacy-transaction',
      type: 'SAIDA',
      description: 'Legado',
      amount: 19.9,
      date: '2026-12-20',
      responsible: 'CASA',
      paymentMethod: 'CREDITO',
      status: 'PENDENTE',
      paidAt: null,
      notes: '',
      categoryId: 'reserva',
      subcategoryId: 'sub-1',
      behavior: 'VARIAVEL',
      necessity: 'NECESSARIO',
      recurrenceId: 'recurrence-1',
      goalMovementId: 'movement-1',
      installmentGroupId: 'installment-group-1',
      createdAt: '2026-12-20T10:00:00.000Z',
      updatedAt: '2026-12-20T10:00:00.000Z',
    }
    localStorage.setItem('finance.transactions', JSON.stringify([legacy]))

    const [migrated] = await getTransactions()
    expect(migrated).toMatchObject({
      id: 'legacy-transaction',
      amountCents: 1990,
      competence: '2027-01',
      recurrenceId: 'recurrence-1',
      goalMovementId: 'movement-1',
      installmentGroupId: 'installment-group-1',
    })

    const [persisted] = JSON.parse(localStorage.getItem('finance.transactions') ?? '[]') as Transaction[]
    expect(persisted).toMatchObject(migrated)
    expect(persisted).not.toHaveProperty('amount')
  })

  it('semeia categorias apenas quando a chave ainda nao existe', async () => {
    expect(await getCategories()).toHaveLength(9)
    expect(JSON.parse(localStorage.getItem('finance.categories') ?? '[]')).toHaveLength(9)

    localStorage.clear()
    localStorage.setItem('finance.categories', '[]')
    expect(await getCategories()).toEqual([])
  })

  it('bloqueia excluir categoria e subcategoria usadas por Transaction', async () => {
    savedCategories([{ id: 'category-1', name: 'Categoria', subcategories: [{ id: 'subcategory-1', name: 'Sub' }] }])
    await createTransaction({ ...transactionInput, categoryId: 'category-1', subcategoryId: 'subcategory-1' })

    await expect(deleteCategory('category-1')).rejects.toThrow('Esta categoria possui lancamentos vinculados')
    await expect(deleteSubcategory('category-1', 'subcategory-1')).rejects.toThrow('Esta subcategoria possui lancamentos vinculados')
  })

  it('bloqueia excluir categoria e subcategoria usadas por Recurrence', async () => {
    savedCategories([{ id: 'category-1', name: 'Categoria', subcategories: [{ id: 'subcategory-1', name: 'Sub' }] }])
    await createRecurrence({ ...recurrenceInput, categoryId: 'category-1', subcategoryId: 'subcategory-1' })

    await expect(deleteCategory('category-1')).rejects.toThrow('Esta categoria possui lancamentos vinculados')
    await expect(deleteSubcategory('category-1', 'subcategory-1')).rejects.toThrow('Esta subcategoria possui lancamentos vinculados')
  })

  it('gera recorrencia FIXED uma vez por recurrenceId e competencia', async () => {
    await createRecurrence(recurrenceInput)

    const first = await ensureRecurrencesForMonth('2026-09')
    const second = await ensureRecurrencesForMonth('2026-09')
    expect(first).toHaveLength(1)
    expect(first[0]).toMatchObject({ amountCents: 4990, needsValue: false, competence: '2026-09' })
    expect(second).toEqual([])
    expect(await getTransactions()).toHaveLength(1)
  })

  it('gera recorrencia VARIABLE com valor zero e needsValue', async () => {
    await createRecurrence({ ...recurrenceInput, recurrenceValueType: 'VARIABLE', defaultAmountCents: 0 })

    const [generated] = await ensureRecurrencesForMonth('2026-09')
    expect(generated).toMatchObject({ amountCents: 0, needsValue: true })
  })

  it('nao gera recorrencia inativa', async () => {
    await createRecurrence({ ...recurrenceInput, active: false })

    expect(await ensureRecurrencesForMonth('2026-09')).toEqual([])
    expect(await getTransactions()).toEqual([])
  })

  it('cria movimentos de meta com espelho financeiro e os remove pelo movimento', async () => {
    await createGoal('Reserva', 100000, '2026-12')
    const goal = (await getGoals())[0]

    await createGoalMovement(goal.id, 'CONTRIBUTION', 25000, '2026-09-10', 'Aporte')
    const contribution = (await getGoalMovements(goal.id))[0]
    const contributionTransaction = (await getTransactions()).find((transaction) => transaction.goalMovementId === contribution.id)
    expect(contributionTransaction).toMatchObject({ type: 'SAIDA', amountCents: 25000, goalMovementId: contribution.id })

    await deleteGoalMovement(contribution.id)
    expect(await getGoalMovements(goal.id)).toEqual([])
    expect(await getTransactions()).toEqual([])
  })

  it('cria retirada como ENTRADA e remove espelhos ao excluir a meta', async () => {
    await createGoal('Reserva', 100000, '2026-12')
    const goal = (await getGoals())[0]
    await createGoalMovement(goal.id, 'WITHDRAWAL', 12500, '2026-09-10', '')
    const movement = (await getGoalMovements(goal.id))[0]

    expect((await getTransactions()).find((transaction) => transaction.goalMovementId === movement.id)).toMatchObject({ type: 'ENTRADA' })
    await deleteGoal(goal.id)
    expect(await getGoals()).toEqual([])
    expect(await getGoalMovements()).toEqual([])
    expect(await getTransactions()).toEqual([])
  })

  it('bloqueia exclusao comum de Transaction vinculada a GoalMovement e a remove pelo movimento', async () => {
    await createGoal('Reserva', 100000, '2026-12')
    const goal = (await getGoals())[0]
    await createGoalMovement(goal.id, 'CONTRIBUTION', 25000, '2026-09-10', '')
    const movement = (await getGoalMovements(goal.id))[0]
    const transaction = (await getTransactions()).find((item) => item.goalMovementId === movement.id)

    expect(transaction).toBeDefined()
    await expect(deleteTransaction(transaction!.id)).rejects.toThrow('Este lancamento e vinculado a uma meta')
    expect(await getTransactions()).toHaveLength(1)
    expect(await getGoalMovements(goal.id)).toHaveLength(1)

    await deleteGoalMovement(movement.id)
    expect(await getTransactions()).toEqual([])
    expect(await getGoalMovements(goal.id)).toEqual([])
  })
})
