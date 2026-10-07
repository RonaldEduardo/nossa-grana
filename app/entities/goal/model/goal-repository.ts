import type { Goal, GoalMovement } from '@/entities/goal/model/goal'

export interface GoalRepository {
  getGoals(): Promise<Goal[]>
  saveGoals(goals: Goal[]): Promise<void>
  getMovements(): Promise<GoalMovement[]>
  saveMovements(movements: GoalMovement[]): Promise<void>
}
