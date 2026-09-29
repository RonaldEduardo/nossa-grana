import type { Behavior, Necessity, PaymentMethod, Responsible, TransactionType } from '@/models/transaction'

export const recurrenceValueTypes = ['FIXED', 'VARIABLE'] as const
export type RecurrenceValueType = (typeof recurrenceValueTypes)[number]

export interface Recurrence {
  id: string
  description: string
  type: TransactionType
  categoryId: string
  subcategoryId: string | null
  responsible: Responsible
  paymentMethod: PaymentMethod
  behavior: Behavior
  necessity: Necessity
  dueDay: number | null
  recurrenceValueType: RecurrenceValueType
  defaultAmountCents: number
  active: boolean
  startMonth: string
}

export type RecurrenceInput = Omit<Recurrence, 'id'>
