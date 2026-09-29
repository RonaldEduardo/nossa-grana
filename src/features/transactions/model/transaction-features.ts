import { addMonthsToCompetence, calculateCompetence } from '@/entities/transaction/model/competence'
import { calculateInstallments } from '@/entities/transaction/model/installments'
import type { TransactionRepository } from '@/entities/transaction/model/transaction-repository'
import type { Transaction, TransactionInput } from '@/entities/transaction/model/transaction'

export function createTransactionFeatures(transactionRepository: TransactionRepository) {
  async function readTransactions(): Promise<Transaction[]> {
    const transactions = await transactionRepository.getAll()
    try {
      let changed = false
      const migrated = transactions.map((transaction) => {
        const legacy = transaction as Transaction & { amount?: number }
        const competence = transaction.competence ?? calculateCompetence(transaction.date, transaction.paymentMethod)
        const amountCents = Number.isInteger(transaction.amountCents)
          ? transaction.amountCents
          : Math.round((legacy.amount ?? 0) * 100)
        const { amount: _amount, ...withoutLegacyAmount } = legacy
        const adapted: Transaction = {
          ...withoutLegacyAmount,
          competence,
          amountCents,
          categoryId: transaction.categoryId ?? null,
          subcategoryId: transaction.subcategoryId ?? null,
          behavior: transaction.behavior ?? null,
          necessity: transaction.necessity ?? null,
        }
        if (!transaction.competence || !Number.isInteger(transaction.amountCents) || !transaction.categoryId || !transaction.behavior || !transaction.necessity) changed = true
        return adapted
      })
      if (changed) await transactionRepository.saveAll(migrated)
      return migrated
    } catch {
      return []
    }
  }

  async function saveTransactions(transactions: Transaction[]) {
    await transactionRepository.saveAll(transactions)
  }

  function createId() {
    return crypto.randomUUID()
  }

  async function saveGeneratedTransactions(transactions: Transaction[]) {
    await saveTransactions(transactions)
  }

  async function getTransactions() {
    return await readTransactions()
  }

  async function getTransaction(id: string) {
    return (await readTransactions()).find((transaction) => transaction.id === id)
  }

  async function createTransaction(input: TransactionInput) {
    const now = new Date().toISOString()
    const transaction: Transaction = {
      ...input,
      id: createId(),
      competence: calculateCompetence(input.date, input.paymentMethod),
      status: 'PENDENTE',
      paidAt: null,
      createdAt: now,
      updatedAt: now,
    }
    await saveTransactions([...(await readTransactions()), transaction])
    return transaction
  }

  async function createCreditPurchase(input: TransactionInput, installmentCount: number) {
    if (input.paymentMethod !== 'CREDITO') throw new Error('Parcelamento esta disponivel somente no credito.')
    const amounts = calculateInstallments(input.amountCents, installmentCount)
    const now = new Date().toISOString()
    const installmentGroupId = createId()
    const firstCompetence = calculateCompetence(input.date, input.paymentMethod)
    const installments = amounts.map((amountCents, index): Transaction => ({
      ...input,
      id: createId(),
      amountCents,
      competence: addMonthsToCompetence(firstCompetence, index),
      status: 'PENDENTE',
      paidAt: null,
      installmentGroupId,
      installmentNumber: index + 1,
      installmentCount,
      originalTotalAmountCents: input.amountCents,
      createdAt: now,
      updatedAt: now,
    }))
    await saveTransactions([...(await readTransactions()), ...installments])
    return installments
  }

  async function updateTransaction(id: string, input: TransactionInput) {
    const transactions = await readTransactions()
    const transaction = transactions.find((item) => item.id === id)
    if (!transaction) throw new Error('Lancamento nao encontrado.')

    const updated: Transaction = {
      ...transaction,
      ...input,
      competence: calculateCompetence(input.date, input.paymentMethod),
      needsValue: transaction.needsValue && input.amountCents === 0,
      updatedAt: new Date().toISOString(),
    }
    await saveTransactions(transactions.map((item) => (item.id === id ? updated : item)))
    return updated
  }

  async function updateTransactionAmount(id: string, amountCents: number) {
    const transactions = await readTransactions()
    const transaction = transactions.find((item) => item.id === id)
    if (!transaction) throw new Error('Lancamento nao encontrado.')
    const updated = { ...transaction, amountCents, needsValue: false, updatedAt: new Date().toISOString() }
    await saveTransactions(transactions.map((item) => item.id === id ? updated : item))
  }

  async function deleteTransactionsByGoalMovement(goalMovementId: string) {
    await saveTransactions((await readTransactions()).filter((transaction) => transaction.goalMovementId !== goalMovementId))
  }

  async function createGoalMovementTransaction(movementId: string, input: TransactionInput) {
    const transaction = await createTransaction(input)
    const transactions = (await readTransactions()).map((item) => (
      item.id === transaction.id ? { ...item, goalMovementId: movementId } : item
    ))
    await saveTransactions(transactions)
  }

  async function deleteTransaction(id: string, deleteGroup = false) {
    const transactions = await readTransactions()
    const transaction = transactions.find((item) => item.id === id)
    if (!transaction) return
    if (transaction.goalMovementId) throw new Error('Este lancamento e vinculado a uma meta e deve ser removido pela meta.')
    await saveTransactions(transactions.filter((item) => (
      deleteGroup && transaction.installmentGroupId
        ? item.installmentGroupId !== transaction.installmentGroupId
        : item.id !== id
    )))
  }

  async function toggleTransactionPaid(id: string) {
    const transactions = await readTransactions()
    const transaction = transactions.find((item) => item.id === id)
    if (!transaction) throw new Error('Lancamento nao encontrado.')

    const isPaid = transaction.status === 'PAGO'
    const updated: Transaction = {
      ...transaction,
      status: isPaid ? 'PENDENTE' : 'PAGO',
      paidAt: isPaid ? null : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await saveTransactions(transactions.map((item) => item.id === id ? updated : item))
    return updated
  }

  return {
    saveGeneratedTransactions,
    getTransactions,
    getTransaction,
    createTransaction,
    createCreditPurchase,
    updateTransaction,
    updateTransactionAmount,
    deleteTransactionsByGoalMovement,
    createGoalMovementTransaction,
    deleteTransaction,
    toggleTransactionPaid,
  }
}
