import type { Goal, GoalMovement } from '@/entities/goal/model/goal'
import type { GoalRepository } from '@/entities/goal/model/goal-repository'
import type { Recurrence, RecurrenceCancellation } from '@/entities/recurrence/model/recurrence'
import type { RecurrenceRepository } from '@/entities/recurrence/model/recurrence-repository'
import type { Transaction } from '@/entities/transaction/model/transaction'
import type { TransactionRepository } from '@/entities/transaction/model/transaction-repository'

export function createTransactionRepository(initial: Transaction[] = []) {
  let transactions = [...initial]
  const repository: TransactionRepository = {
    getAll: async () => transactions,
    saveAll: async (next) => { transactions = [...next] },
  }
  return { repository, get: () => transactions }
}

export function createRecurrenceRepository(initial: Recurrence[] = []) {
  let recurrences = [...initial]
  let cancellations: RecurrenceCancellation[] = []
  const repository: RecurrenceRepository = {
    getAll: async () => recurrences,
    saveAll: async (next) => { recurrences = [...next] },
    getCancellations: async () => cancellations,
    saveCancellations: async (next) => { cancellations = [...next] },
  }
  return { repository, get: () => recurrences, cancellations: () => cancellations }
}

export function createGoalRepository(initialGoals: Goal[] = [], initialMovements: GoalMovement[] = []) {
  let goals = [...initialGoals]
  let movements = [...initialMovements]
  const repository: GoalRepository = {
    getGoals: async () => goals,
    saveGoals: async (next) => { goals = [...next] },
    getMovements: async () => movements,
    saveMovements: async (next) => { movements = [...next] },
  }
  return { repository, goals: () => goals, movements: () => movements }
}

export class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}
