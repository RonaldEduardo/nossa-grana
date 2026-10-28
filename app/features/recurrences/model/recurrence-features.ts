import type { RecurrenceRepository } from '@/entities/recurrence/model/recurrence-repository'
import type { Recurrence, RecurrenceInput } from '@/entities/recurrence/model/recurrence'
import type { Transaction } from '@/entities/transaction/model/transaction'
import { calculateCompetence } from '@/entities/transaction/model/competence'

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

  async function cancelRecurrenceOccurrence(transaction: Transaction) {
    if (!transaction.recurrenceId) throw new Error('Lancamento nao pertence a uma recorrencia.')
    const sourceCompetence = transaction.recurrenceSourceCompetence ?? transaction.competence
    const cancellations = await recurrenceRepository.getCancellations()
    if (cancellations.some((cancellation) => (
      cancellation.recurrenceId === transaction.recurrenceId
      && cancellation.sourceCompetence === sourceCompetence
    ))) return
    await recurrenceRepository.saveCancellations([
      ...cancellations,
      { recurrenceId: transaction.recurrenceId, sourceCompetence },
    ])
  }

  async function ensureRecurrencesForMonth(competence: string): Promise<Transaction[]> {
    const transactions = await getTransactions()
    const cancellations = await recurrenceRepository.getCancellations()
    const created = (await getRecurrences())
      .filter((recurrence) => recurrence.active && recurrence.startMonth <= competence)
      .filter((recurrence) => !cancellations.some((cancellation) => (
        cancellation.recurrenceId === recurrence.id && cancellation.sourceCompetence === competence
      )))
      .filter((recurrence) => !transactions.some((transaction) => (
        transaction.recurrenceId === recurrence.id
        && (transaction.recurrenceSourceCompetence ?? transaction.competence) === competence
      )))
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
          competence: calculateCompetence(date, recurrence.paymentMethod),
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
          recurrenceSourceCompetence: competence,
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
    cancelRecurrenceOccurrence,
    ensureRecurrencesForMonth,
  }
}
