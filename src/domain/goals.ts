import type { GoalMovement } from '@/models/goal'

export function calculateGoalBalance(movements: GoalMovement[]): number {
  return movements.reduce((balance, movement) => (
    movement.type === 'CONTRIBUTION' ? balance + movement.amountCents : balance - movement.amountCents
  ), 0)
}

export function calculateMonthlyGoalSuggestion(targetAmountCents: number, balanceCents: number, targetDate: string, currentMonth: string): number | null {
  const missing = targetAmountCents - balanceCents
  if (missing <= 0) return 0
  const [targetYear, targetMonth] = targetDate.split('-').map(Number)
  const [currentYear, currentMonthNumber] = currentMonth.split('-').map(Number)
  const monthsRemaining = (targetYear - currentYear) * 12 + targetMonth - currentMonthNumber + 1
  if (monthsRemaining <= 0) return null
  return Math.ceil(missing / monthsRemaining)
}
