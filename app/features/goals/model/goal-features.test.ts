import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createGoalFeatures } from '@/features/goals/model/goal-features'
import type { GoalRepository } from '@/entities/goal/model/goal-repository'
import type { Goal, GoalMovement } from '@/entities/goal/model/goal'
import type { TransactionInput } from '@/entities/transaction/model/transaction'

function createRepository(initialGoals: Goal[] = [], initialMovements: GoalMovement[] = []) {
  let goals = initialGoals
  let movements = initialMovements
  const repository: GoalRepository = {
    getGoals: async () => goals,
    saveGoals: async (nextGoals) => { goals = nextGoals },
    getMovements: async () => movements,
    saveMovements: async (nextMovements) => { movements = nextMovements },
  }
  return { repository, getGoals: () => goals, getMovements: () => movements }
}

describe('goal features', () => {
  beforeEach(() => {
    let id = 0
    vi.stubGlobal('crypto', { randomUUID: () => `id-${++id}` })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('cria e alterna meta, calculando saldo e sugestao sem alterar as regras', async () => {
    const fake = createRepository([], [
      { id: 'contribution', goalId: 'goal-1', type: 'CONTRIBUTION', amountCents: 2500, date: '2026-10-01', note: '' },
      { id: 'withdrawal', goalId: 'goal-1', type: 'WITHDRAWAL', amountCents: 500, date: '2026-10-02', note: '' },
    ])
    const features = createGoalFeatures(fake.repository, async () => {}, async () => {})

    await features.createGoal(' Reserva ', 10000, '2026-12')
    expect(fake.getGoals()[0]).toMatchObject({ id: 'id-1', name: 'Reserva', targetAmountCents: 10000, active: true })

    const goal: Goal = { ...fake.getGoals()[0], id: 'goal-1' }
    await fake.repository.saveGoals([goal])
    await features.toggleGoal(goal.id)
    expect(fake.getGoals()[0].active).toBe(false)
    expect(await features.getGoalSummary(fake.getGoals()[0], '2026-10')).toEqual({ balanceCents: 2000, suggestionCents: 2667 })
  })

  it('gera espelhos de aporte e retirada com IDs e campos fixos preservados', async () => {
    const goal: Goal = { id: 'goal-1', name: 'Reserva', targetAmountCents: 100000, targetDate: '2026-12', active: true, createdAt: '2026-01-01T00:00:00.000Z' }
    const fake = createRepository([goal])
    const mirrors: Array<{ movementId: string; input: TransactionInput }> = []
    const features = createGoalFeatures(
      fake.repository,
      async (movementId, input) => { mirrors.push({ movementId, input }) },
      async () => {},
    )

    await features.createGoalMovement(goal.id, 'CONTRIBUTION', 25000, '2026-09-10', ' Aporte ')
    await features.createGoalMovement(goal.id, 'WITHDRAWAL', 12500, '2026-09-11', '')

    expect(fake.getMovements()).toEqual([
      { id: 'id-1', goalId: goal.id, type: 'CONTRIBUTION', amountCents: 25000, date: '2026-09-10', note: 'Aporte' },
      { id: 'id-2', goalId: goal.id, type: 'WITHDRAWAL', amountCents: 12500, date: '2026-09-11', note: '' },
    ])
    expect(mirrors).toEqual([
      { movementId: 'id-1', input: { type: 'SAIDA', description: 'Aporte: Reserva', amountCents: 25000, date: '2026-09-10', responsible: 'CASA', paymentMethod: 'PIX', notes: 'Aporte', categoryId: 'reserva', subcategoryId: null, behavior: 'VARIAVEL', necessity: 'NECESSARIO' } },
      { movementId: 'id-2', input: { type: 'ENTRADA', description: 'Retirada: Reserva', amountCents: 12500, date: '2026-09-11', responsible: 'CASA', paymentMethod: 'PIX', notes: '', categoryId: 'reserva', subcategoryId: null, behavior: 'VARIAVEL', necessity: 'NECESSARIO' } },
    ])
  })

  it('remove espelho ao excluir movimento e todos os espelhos ao excluir meta', async () => {
    const goals: Goal[] = [
      { id: 'goal-1', name: 'Meta', targetAmountCents: 10000, targetDate: '2026-12', active: true, createdAt: '' },
      { id: 'goal-2', name: 'Outra', targetAmountCents: 10000, targetDate: '2026-12', active: true, createdAt: '' },
    ]
    const movements: GoalMovement[] = [
      { id: 'movement-1', goalId: 'goal-1', type: 'CONTRIBUTION', amountCents: 1000, date: '', note: '' },
      { id: 'movement-2', goalId: 'goal-1', type: 'WITHDRAWAL', amountCents: 500, date: '', note: '' },
      { id: 'movement-3', goalId: 'goal-2', type: 'CONTRIBUTION', amountCents: 1000, date: '', note: '' },
    ]
    const fake = createRepository(goals, movements)
    const deletedMirrors: string[] = []
    const features = createGoalFeatures(fake.repository, async () => {}, async (id) => { deletedMirrors.push(id) })

    await features.deleteGoalMovement('movement-1')
    expect(deletedMirrors).toEqual(['movement-1'])
    expect(fake.getMovements().map((movement) => movement.id)).toEqual(['movement-2', 'movement-3'])

    await features.deleteGoal('goal-1')
    expect(deletedMirrors).toEqual(['movement-1', 'movement-2'])
    expect(fake.getGoals().map((goal) => goal.id)).toEqual(['goal-2'])
    expect(fake.getMovements().map((movement) => movement.id)).toEqual(['movement-3'])
  })

  it('preserva a falha parcial atual quando a criacao do espelho falha', async () => {
    const goal: Goal = { id: 'goal-1', name: 'Meta', targetAmountCents: 10000, targetDate: '2026-12', active: true, createdAt: '' }
    const fake = createRepository([goal])
    const features = createGoalFeatures(fake.repository, async () => { throw new Error('falha no espelho') }, async () => {})

    await expect(features.createGoalMovement(goal.id, 'CONTRIBUTION', 1000, '2026-09-10', '')).rejects.toThrow('falha no espelho')
    expect(fake.getMovements()).toHaveLength(1)
    expect(fake.getMovements()[0]).toMatchObject({ goalId: goal.id, type: 'CONTRIBUTION' })
  })
})
