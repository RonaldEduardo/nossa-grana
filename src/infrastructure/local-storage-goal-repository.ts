import type { Goal, GoalMovement } from '@/models/goal'
import type { GoalRepository } from '@/models/goal-repository'

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
  getGoals: () => read<Goal>(goalsKey),
  saveGoals: (goals) => localStorage.setItem(goalsKey, JSON.stringify(goals)),
  getMovements: () => read<GoalMovement>(movementsKey),
  saveMovements: (movements) => localStorage.setItem(movementsKey, JSON.stringify(movements)),
}
