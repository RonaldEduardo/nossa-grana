import { createCategoryFeatures } from '@/features/categories/model/category-features'
import { createGoalFeatures } from '@/features/goals/model/goal-features'
import { createRecurrenceFeatures } from '@/features/recurrences/model/recurrence-features'
import { createTransactionFeatures } from '@/features/transactions/model/transaction-features'
import { localStorageCategoryRepository } from '@/entities/category/api/local-storage-category-repository'
import { localStorageGoalRepository } from '@/entities/goal/api/local-storage-goal-repository'
import { localStorageRecurrenceRepository } from '@/entities/recurrence/api/local-storage-recurrence-repository'
import { localStorageTransactionRepository } from '@/entities/transaction/api/local-storage-transaction-repository'

export const transactionFeatures = createTransactionFeatures(localStorageTransactionRepository)
export const recurrenceFeatures = createRecurrenceFeatures(
  localStorageRecurrenceRepository,
  transactionFeatures.getTransactions,
  transactionFeatures.saveGeneratedTransactions,
)
export const categoryFeatures = createCategoryFeatures(
  localStorageCategoryRepository,
  transactionFeatures.getTransactions,
  recurrenceFeatures.getRecurrences,
)
export const goalFeatures = createGoalFeatures(
  localStorageGoalRepository,
  transactionFeatures.createGoalMovementTransaction,
  transactionFeatures.deleteTransactionsByGoalMovement,
)
