import type { Transaction } from '@/entities/transaction/model/transaction'

export interface TransactionRepository {
  getAll(): Promise<Transaction[]>
  saveAll(transactions: Transaction[]): Promise<void>
}
