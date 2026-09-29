import type { TransactionRepository } from '@/entities/transaction/model/transaction-repository'
import type { Transaction } from '@/entities/transaction/model/transaction'

const storageKey = 'finance.transactions'

export const localStorageTransactionRepository: TransactionRepository = {
  async getAll() {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return []
    try {
      return JSON.parse(stored) as Transaction[]
    } catch {
      return []
    }
  },
  async saveAll(transactions) {
    localStorage.setItem(storageKey, JSON.stringify(transactions))
  },
}
