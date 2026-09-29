import type { TransactionRepository } from '@/models/transaction-repository'
import type { Transaction } from '@/models/transaction'

const storageKey = 'finance.transactions'

export const localStorageTransactionRepository: TransactionRepository = {
  getAll() {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return []
    try {
      return JSON.parse(stored) as Transaction[]
    } catch {
      return []
    }
  },
  saveAll(transactions) {
    localStorage.setItem(storageKey, JSON.stringify(transactions))
  },
}
