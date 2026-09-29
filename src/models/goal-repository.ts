import type { Goal, GoalMovement } from '@/models/goal'

export interface GoalRepository {
  getGoals(): Goal[]
  saveGoals(goals: Goal[]): void
  getMovements(): GoalMovement[]
  saveMovements(movements: GoalMovement[]): void
}
