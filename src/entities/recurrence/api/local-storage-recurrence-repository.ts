import type { Recurrence } from '@/entities/recurrence/model/recurrence'
import type { RecurrenceRepository } from '@/entities/recurrence/model/recurrence-repository'

const storageKey = 'finance.recurrences'

export const localStorageRecurrenceRepository: RecurrenceRepository = {
  async getAll() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Recurrence[]
    } catch {
      return []
    }
  },
  async saveAll(recurrences) {
    localStorage.setItem(storageKey, JSON.stringify(recurrences))
  },
}
