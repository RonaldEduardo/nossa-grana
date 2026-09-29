import type { RecurrenceRepository } from '@/entities/recurrence/model/recurrence-repository'
import type { Recurrence, RecurrenceInput } from '@/entities/recurrence/model/recurrence'
import type { Transaction } from '@/entities/transaction/model/transaction'

export function createRecurrenceFeatures(
  recurrenceRepository: RecurrenceRepository,
  getTransactions: () => Promise<Transaction[]>,
  saveGeneratedTransactions: (transactions: Transaction[]) => Promise<void>,
) {
  async function getRecurrences() {
    return await recurrenceRepository.getAll()
  }

  async function createRecurrence(input: RecurrenceInput) {
    const recurrence: Recurrence = { ...input, id: crypto.randomUUID() }
    await recurrenceRepository.saveAll([...(await getRecurrences()), recurrence])
  }

  async function updateRecurrence(id: string, input: RecurrenceInput) {
    await recurrenceRepository.saveAll((await getRecurrences()).map((recurrence) => (
      recurrence.id === id ? { ...input, id } : recurrence
    )))
  }

  async function toggleRecurrence(id: string) {
    await recurrenceRepository.saveAll((await getRecurrences()).map((recurrence) => (
      recurrence.id === id ? { ...recurrence, active: !recurrence.active } : recurrence
    )))
  }

  async function deleteRecurrence(id: string) {
    await recurrenceRepository.saveAll((await getRecurrences()).filter((recurrence) => recurrence.id !== id))
  }

  async function ensureRecurrencesForMonth(competence: string): Promise<Transaction[]> {
    const transactions = await getTransactions()
    const created = (await getRecurrences())
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
    if (created.length) await saveGeneratedTransactions([...transactions, ...created])
    return created
  }

  return {
    getRecurrences,
    createRecurrence,
    updateRecurrence,
    toggleRecurrence,
    deleteRecurrence,
    ensureRecurrencesForMonth,
  }
}
