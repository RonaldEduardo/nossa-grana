import type { Recurrence, RecurrenceCancellation } from '@/entities/recurrence/model/recurrence'

export interface RecurrenceRepository {
  getAll(): Promise<Recurrence[]>
  saveAll(recurrences: Recurrence[]): Promise<void>
  getCancellations(): Promise<RecurrenceCancellation[]>
  saveCancellations(cancellations: RecurrenceCancellation[]): Promise<void>
}
