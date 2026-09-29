export const transactionTypes = ['ENTRADA', 'SAIDA'] as const
export const responsibles = ['CASA', 'RONALD', 'KAMILLE'] as const
export const paymentMethods = ['PIX', 'DEBITO', 'CREDITO', 'DINHEIRO'] as const
export const transactionStatuses = ['PENDENTE', 'PAGO'] as const
export const behaviors = ['FIXO', 'VARIAVEL'] as const
export const necessities = ['ESSENCIAL', 'NECESSARIO', 'OPCIONAL', 'DESPERDICIO'] as const

export type TransactionType = (typeof transactionTypes)[number]
export type Responsible = (typeof responsibles)[number]
export type PaymentMethod = (typeof paymentMethods)[number]
export type TransactionStatus = (typeof transactionStatuses)[number]
export type Behavior = (typeof behaviors)[number]
export type Necessity = (typeof necessities)[number]

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amountCents: number
  date: string
  competence: string
  responsible: Responsible
  paymentMethod: PaymentMethod
  status: TransactionStatus
  paidAt: string | null
  notes: string
  categoryId: string | null
  subcategoryId: string | null
  behavior: Behavior | null
  necessity: Necessity | null
  installmentGroupId?: string
  installmentNumber?: number
  installmentCount?: number
  originalTotalAmountCents?: number
  recurrenceId?: string
  needsValue?: boolean
  goalMovementId?: string
  createdAt: string
  updatedAt: string
}

export type TransactionInput = Pick<
  Transaction,
  | 'type'
  | 'description'
  | 'amountCents'
  | 'date'
  | 'responsible'
  | 'paymentMethod'
  | 'notes'
  | 'categoryId'
  | 'subcategoryId'
  | 'behavior'
  | 'necessity'
>
