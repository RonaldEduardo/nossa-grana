import type { TransactionRepository } from '@/entities/transaction/model/transaction-repository'
import type { Transaction } from '@/entities/transaction/model/transaction'
import { readLocalStorageCollection, writeLocalStorageCollection } from '@/entities/shared/local-storage'

const storageKey = 'finance.transactions'

export const localStorageTransactionRepository: TransactionRepository = {
  async getAll() {
    return readLocalStorageCollection<Transaction>(storageKey)
  },
  async saveAll(transactions) {
    writeLocalStorageCollection(storageKey, transactions)
  },
}
