import type { Goal, GoalMovement } from '@/entities/goal/model/goal'
import type { GoalRepository } from '@/entities/goal/model/goal-repository'

const goalsKey = 'finance.goals'
const movementsKey = 'finance.goalMovements'

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

export const localStorageGoalRepository: GoalRepository = {
  getGoals: async () => read<Goal>(goalsKey),
  saveGoals: async (goals) => localStorage.setItem(goalsKey, JSON.stringify(goals)),
  getMovements: async () => read<GoalMovement>(movementsKey),
  saveMovements: async (movements) => localStorage.setItem(movementsKey, JSON.stringify(movements)),
}
