import type { Recurrence } from '@/entities/recurrence/model/recurrence'

export interface RecurrenceRepository {
  getAll(): Promise<Recurrence[]>
  saveAll(recurrences: Recurrence[]): Promise<void>
}
