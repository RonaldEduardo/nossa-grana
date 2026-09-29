export const goalMovementTypes = ['CONTRIBUTION', 'WITHDRAWAL'] as const
export type GoalMovementType = (typeof goalMovementTypes)[number]

export interface Goal {
  id: string
  name: string
  targetAmountCents: number
  targetDate: string
  active: boolean
  createdAt: string
}

export interface GoalMovement {
  id: string
  goalId: string
  type: GoalMovementType
  amountCents: number
  date: string
  note: string
}
