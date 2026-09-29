import { calculateGoalBalance, calculateMonthlyGoalSuggestion } from '@/domain/goals'
import { localStorageGoalRepository } from '@/infrastructure/local-storage-goal-repository'
import type { Goal, GoalMovement, GoalMovementType } from '@/models/goal'
import { deleteTransactionsByGoalMovement, createGoalMovementTransaction } from '@/services/transactions'

export function getGoals() {
  return localStorageGoalRepository.getGoals()
}

export function getGoalMovements(goalId?: string) {
  const movements = localStorageGoalRepository.getMovements()
  return goalId ? movements.filter((movement) => movement.goalId === goalId) : movements
}

export function createGoal(name: string, targetAmountCents: number, targetDate: string) {
  const goal: Goal = { id: crypto.randomUUID(), name: name.trim(), targetAmountCents, targetDate, active: true, createdAt: new Date().toISOString() }
  localStorageGoalRepository.saveGoals([...getGoals(), goal])
}

export function toggleGoal(id: string) {
  localStorageGoalRepository.saveGoals(getGoals().map((goal) => goal.id === id ? { ...goal, active: !goal.active } : goal))
}

export function deleteGoal(id: string) {
  const movements = getGoalMovements(id)
  movements.forEach((movement) => deleteTransactionsByGoalMovement(movement.id))
  localStorageGoalRepository.saveMovements(getGoalMovements().filter((movement) => movement.goalId !== id))
  localStorageGoalRepository.saveGoals(getGoals().filter((goal) => goal.id !== id))
}

export function createGoalMovement(goalId: string, type: GoalMovementType, amountCents: number, date: string, note: string) {
  const goal = getGoals().find((item) => item.id === goalId)
  if (!goal) throw new Error('Meta nao encontrada.')
  const movement: GoalMovement = { id: crypto.randomUUID(), goalId, type, amountCents, date, note: note.trim() }
  localStorageGoalRepository.saveMovements([...getGoalMovements(), movement])
  createGoalMovementTransaction(movement.id, {
    type: type === 'CONTRIBUTION' ? 'SAIDA' : 'ENTRADA',
    description: `${type === 'CONTRIBUTION' ? 'Aporte' : 'Retirada'}: ${goal.name}`,
    amountCents,
    date,
    responsible: 'CASA',
    paymentMethod: 'PIX',
    notes: movement.note,
    categoryId: 'reserva',
    subcategoryId: null,
    behavior: 'VARIAVEL',
    necessity: 'NECESSARIO',
  })
}

export function deleteGoalMovement(id: string) {
  deleteTransactionsByGoalMovement(id)
  localStorageGoalRepository.saveMovements(getGoalMovements().filter((movement) => movement.id !== id))
}

export function getGoalSummary(goal: Goal, currentMonth: string) {
  const balanceCents = calculateGoalBalance(getGoalMovements(goal.id))
  return { balanceCents, suggestionCents: calculateMonthlyGoalSuggestion(goal.targetAmountCents, balanceCents, goal.targetDate, currentMonth) }
}
