import type { Recurrence, RecurrenceCancellation } from '@/entities/recurrence/model/recurrence'
import type { RecurrenceRepository } from '@/entities/recurrence/model/recurrence-repository'
import { readLocalStorageCollection, writeLocalStorageCollection } from '@/entities/shared/local-storage'

const storageKey = 'finance.recurrences'
const cancellationsKey = 'finance.recurrenceCancellations'

export const localStorageRecurrenceRepository: RecurrenceRepository = {
  async getAll() {
    return readLocalStorageCollection<Recurrence>(storageKey)
  },
  async saveAll(recurrences) {
    writeLocalStorageCollection(storageKey, recurrences)
  },
  async getCancellations() {
    return readLocalStorageCollection<RecurrenceCancellation>(cancellationsKey)
  },
  async saveCancellations(cancellations) {
    writeLocalStorageCollection(cancellationsKey, cancellations)
  },
}
