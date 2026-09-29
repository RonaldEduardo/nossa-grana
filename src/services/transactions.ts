import { calculateCompetence } from '@/domain/competence'
import { addMonthsToCompetence } from '@/domain/competence'
import { calculateInstallments } from '@/domain/installments'
import type { Transaction, TransactionInput } from '@/models/transaction'
import { localStorageTransactionRepository } from '@/infrastructure/local-storage-transaction-repository'

function readTransactions(): Transaction[] {
  const transactions = localStorageTransactionRepository.getAll()
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
    if (changed) localStorageTransactionRepository.saveAll(migrated)
    return migrated
  } catch {
    return []
  }
}

function saveTransactions(transactions: Transaction[]) {
  localStorageTransactionRepository.saveAll(transactions)
}

export function saveGeneratedTransactions(transactions: Transaction[]) {
  saveTransactions(transactions)
}

function createId() {
  return crypto.randomUUID()
}

export function getTransactions() {
  return readTransactions()
}

export function getTransaction(id: string) {
  return readTransactions().find((transaction) => transaction.id === id)
}

export function createTransaction(input: TransactionInput) {
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
  saveTransactions([...readTransactions(), transaction])
  return transaction
}

export function createCreditPurchase(input: TransactionInput, installmentCount: number) {
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
  saveTransactions([...readTransactions(), ...installments])
  return installments
}

export function updateTransaction(id: string, input: TransactionInput) {
  const transactions = readTransactions()
  const transaction = transactions.find((item) => item.id === id)
  if (!transaction) throw new Error('Lancamento nao encontrado.')

  const updated: Transaction = {
    ...transaction,
    ...input,
    competence: calculateCompetence(input.date, input.paymentMethod),
    needsValue: transaction.needsValue && input.amountCents === 0,
    updatedAt: new Date().toISOString(),
  }
  saveTransactions(transactions.map((item) => (item.id === id ? updated : item)))
  return updated
}

export function updateTransactionAmount(id: string, amountCents: number) {
  const transactions = readTransactions()
  const transaction = transactions.find((item) => item.id === id)
  if (!transaction) throw new Error('Lancamento nao encontrado.')
  const updated = { ...transaction, amountCents, needsValue: false, updatedAt: new Date().toISOString() }
  saveTransactions(transactions.map((item) => item.id === id ? updated : item))
}

export function deleteTransactionsByGoalMovement(goalMovementId: string) {
  saveTransactions(readTransactions().filter((transaction) => transaction.goalMovementId !== goalMovementId))
}

export function createGoalMovementTransaction(movementId: string, input: TransactionInput) {
  const transaction = createTransaction(input)
  const transactions = readTransactions().map((item) => (
    item.id === transaction.id ? { ...item, goalMovementId: movementId } : item
  ))
  saveTransactions(transactions)
}

export function deleteTransaction(id: string, deleteGroup = false) {
  const transactions = readTransactions()
  const transaction = transactions.find((item) => item.id === id)
  if (!transaction) return
  saveTransactions(transactions.filter((item) => (
    deleteGroup && transaction.installmentGroupId
      ? item.installmentGroupId !== transaction.installmentGroupId
      : item.id !== id
  )))
}

export function toggleTransactionPaid(id: string) {
  const transactions = readTransactions()
  const transaction = transactions.find((item) => item.id === id)
  if (!transaction) throw new Error('Lancamento nao encontrado.')

  const isPaid = transaction.status === 'PAGO'
  const updated: Transaction = {
    ...transaction,
    status: isPaid ? 'PENDENTE' : 'PAGO',
    paidAt: isPaid ? null : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saveTransactions(transactions.map((item) => (item.id === id ? updated : item)))
  return updated
}
