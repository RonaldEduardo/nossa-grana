import { calculateCompetence } from '@/domain/competence'
import { localStorageRecurrenceRepository } from '@/infrastructure/local-storage-recurrence-repository'
import type { Recurrence, RecurrenceInput } from '@/models/recurrence'
import type { Transaction } from '@/models/transaction'
import { getTransactions, saveGeneratedTransactions } from '@/services/transactions'

export function getRecurrences() {
  return localStorageRecurrenceRepository.getAll()
}

export function createRecurrence(input: RecurrenceInput) {
  const recurrence: Recurrence = { ...input, id: crypto.randomUUID() }
  localStorageRecurrenceRepository.saveAll([...getRecurrences(), recurrence])
}

export function updateRecurrence(id: string, input: RecurrenceInput) {
  localStorageRecurrenceRepository.saveAll(getRecurrences().map((recurrence) => (
    recurrence.id === id ? { ...input, id } : recurrence
  )))
}

export function toggleRecurrence(id: string) {
  localStorageRecurrenceRepository.saveAll(getRecurrences().map((recurrence) => (
    recurrence.id === id ? { ...recurrence, active: !recurrence.active } : recurrence
  )))
}

export function deleteRecurrence(id: string) {
  localStorageRecurrenceRepository.saveAll(getRecurrences().filter((recurrence) => recurrence.id !== id))
}

export function ensureRecurrencesForMonth(competence: string): Transaction[] {
  const transactions = getTransactions()
  const created = getRecurrences()
    .filter((recurrence) => recurrence.active && recurrence.startMonth <= competence)
    .filter((recurrence) => !transactions.some((transaction) => transaction.recurrenceId === recurrence.id && transaction.competence === competence))
    .map((recurrence): Transaction => {
      const dueDay = Math.min(Math.max(recurrence.dueDay ?? 1, 1), 28)
      const date = `${competence}-${String(dueDay).padStart(2, '0')}`
      const now = new Date().toISOString()
      return {
        id: crypto.randomUUID(),
        type: recurrence.type,
        description: recurrence.description,
        amountCents: recurrence.recurrenceValueType === 'FIXED' ? recurrence.defaultAmountCents : 0,
        date,
        competence,
        responsible: recurrence.responsible,
        paymentMethod: recurrence.paymentMethod,
        status: 'PENDENTE',
        paidAt: null,
        notes: '',
        categoryId: recurrence.categoryId,
        subcategoryId: recurrence.subcategoryId,
        behavior: recurrence.behavior,
        necessity: recurrence.necessity,
        recurrenceId: recurrence.id,
        needsValue: recurrence.recurrenceValueType === 'VARIABLE',
        createdAt: now,
        updatedAt: now,
      }
    })
  if (created.length) saveGeneratedTransactions([...transactions, ...created])
  return created
}
