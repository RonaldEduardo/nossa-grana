import type { Recurrence } from '@/models/recurrence'

export interface RecurrenceRepository {
  getAll(): Recurrence[]
  saveAll(recurrences: Recurrence[]): void
}
