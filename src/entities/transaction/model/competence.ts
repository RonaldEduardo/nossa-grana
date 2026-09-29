import type { PaymentMethod } from '@/entities/transaction/model/transaction'

export function calculateCompetence(date: string, paymentMethod: PaymentMethod): string {
  const [year, month] = date.split('-').map(Number)
  if (!year || !month) throw new Error('Data invalida para calcular competencia.')

  const competenceDate = new Date(year, month - 1 + (paymentMethod === 'CREDITO' ? 1 : 0), 1)
  return `${competenceDate.getFullYear()}-${String(competenceDate.getMonth() + 1).padStart(2, '0')}`
}

export function addMonthsToCompetence(competence: string, months: number): string {
  const [year, month] = competence.split('-').map(Number)
  const date = new Date(year, month - 1 + months, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
