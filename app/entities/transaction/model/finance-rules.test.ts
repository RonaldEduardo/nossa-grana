import { describe, expect, it } from 'vitest'
import { calculateCompetence } from '@/entities/transaction/model/competence'
import { calculateGoalBalance, calculateMonthlyGoalSuggestion } from '@/entities/goal/model/goals'
import { calculateInstallments } from '@/entities/transaction/model/installments'

describe('regras financeiras', () => {
  it('calcula a competencia de PIX no mesmo mes e de credito no mes seguinte', () => {
    expect(calculateCompetence('2026-09-15', 'CREDITO')).toBe('2026-10')
    expect(calculateCompetence('2026-09-15', 'PIX')).toBe('2026-09')
  })

  it('calcula a competencia de credito na virada de dezembro para janeiro', () => {
    expect(calculateCompetence('2026-12-15', 'CREDITO')).toBe('2027-01')
  })

  it('distribui parcelas com divisao exata', () => {
    const installments = calculateInstallments(9000, 3)
    expect(installments).toEqual([3000, 3000, 3000])
    expect(installments.reduce((total, amount) => total + amount, 0)).toBe(9000)
  })

  it('distribui o resto na ultima parcela sem perder centavos', () => {
    const installments = calculateInstallments(10000, 3)
    expect(installments).toEqual([3333, 3333, 3334])
    expect(installments.reduce((total, amount) => total + amount, 0)).toBe(10000)
  })

  it('calcula saldo e sugestao de uma meta', () => {
    const balance = calculateGoalBalance([
      { id: '1', goalId: 'goal', type: 'CONTRIBUTION', amountCents: 50000, date: '2026-09-01', note: '' },
      { id: '2', goalId: 'goal', type: 'WITHDRAWAL', amountCents: 20000, date: '2026-09-02', note: '' },
    ])
    expect(balance).toBe(30000)
    expect(calculateMonthlyGoalSuggestion(100000, balance, '2026-12', '2026-10')).toBe(23334)
  })
})
