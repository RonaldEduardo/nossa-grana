import { calculateGoalBalance, calculateMonthlyGoalSuggestion } from '@/entities/goal/model/goals'
import type { GoalRepository } from '@/entities/goal/model/goal-repository'
import type { Goal, GoalMovement, GoalMovementType } from '@/entities/goal/model/goal'
import type { TransactionInput } from '@/entities/transaction/model/transaction'

export function createGoalFeatures(
  goalRepository: GoalRepository,
  createGoalMovementTransaction: (movementId: string, input: TransactionInput) => Promise<void>,
  deleteTransactionsByGoalMovement: (goalMovementId: string) => Promise<void>,
) {
  async function getGoals() {
    return await goalRepository.getGoals()
  }

  async function getGoalMovements(goalId?: string) {
    const movements = await goalRepository.getMovements()
    return goalId ? movements.filter((movement) => movement.goalId === goalId) : movements
  }

  async function createGoal(name: string, targetAmountCents: number, targetDate: string) {
    const goal: Goal = { id: crypto.randomUUID(), name: name.trim(), targetAmountCents, targetDate, active: true, createdAt: new Date().toISOString() }
    await goalRepository.saveGoals([...(await getGoals()), goal])
  }

  async function toggleGoal(id: string) {
    await goalRepository.saveGoals((await getGoals()).map((goal) => goal.id === id ? { ...goal, active: !goal.active } : goal))
  }

  async function deleteGoal(id: string) {
    const movements = await getGoalMovements(id)
    for (const movement of movements) await deleteTransactionsByGoalMovement(movement.id)
    await goalRepository.saveMovements((await getGoalMovements()).filter((movement) => movement.goalId !== id))
    await goalRepository.saveGoals((await getGoals()).filter((goal) => goal.id !== id))
  }

  async function createGoalMovement(goalId: string, type: GoalMovementType, amountCents: number, date: string, note: string) {
    const goal = (await getGoals()).find((item) => item.id === goalId)
    if (!goal) throw new Error('Meta nao encontrada.')
    const movement: GoalMovement = { id: crypto.randomUUID(), goalId, type, amountCents, date, note: note.trim() }
    await goalRepository.saveMovements([...(await getGoalMovements()), movement])
    await createGoalMovementTransaction(movement.id, {
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

  async function deleteGoalMovement(id: string) {
    await deleteTransactionsByGoalMovement(id)
    await goalRepository.saveMovements((await getGoalMovements()).filter((movement) => movement.id !== id))
  }

  async function getGoalSummary(goal: Goal, currentMonth: string) {
    const balanceCents = calculateGoalBalance(await getGoalMovements(goal.id))
    return { balanceCents, suggestionCents: calculateMonthlyGoalSuggestion(goal.targetAmountCents, balanceCents, goal.targetDate, currentMonth) }
  }

  return {
    getGoals,
    getGoalMovements,
    createGoal,
    toggleGoal,
    deleteGoal,
    createGoalMovement,
    deleteGoalMovement,
    getGoalSummary,
  }
}
