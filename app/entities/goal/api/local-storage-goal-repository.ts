import type { Goal, GoalMovement } from '@/entities/goal/model/goal'
import type { GoalRepository } from '@/entities/goal/model/goal-repository'
import { readLocalStorageCollection, writeLocalStorageCollection } from '@/entities/shared/local-storage'

const goalsKey = 'finance.goals'
const movementsKey = 'finance.goalMovements'

export const localStorageGoalRepository: GoalRepository = {
  getGoals: async () => readLocalStorageCollection<Goal>(goalsKey),
  saveGoals: async (goals) => writeLocalStorageCollection(goalsKey, goals),
  getMovements: async () => readLocalStorageCollection<GoalMovement>(movementsKey),
  saveMovements: async (movements) => writeLocalStorageCollection(movementsKey, movements),
}
