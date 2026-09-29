import type { Recurrence } from '@/models/recurrence'
import type { RecurrenceRepository } from '@/models/recurrence-repository'

const storageKey = 'finance.recurrences'

export const localStorageRecurrenceRepository: RecurrenceRepository = {
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Recurrence[]
    } catch {
      return []
    }
  },
  saveAll(recurrences) {
    localStorage.setItem(storageKey, JSON.stringify(recurrences))
  },
}
