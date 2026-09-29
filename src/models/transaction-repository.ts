import type { Transaction } from '@/models/transaction'

export interface TransactionRepository {
  getAll(): Transaction[]
  saveAll(transactions: Transaction[]): void
}
