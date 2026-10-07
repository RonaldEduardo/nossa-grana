export function calculateInstallments(totalAmountCents: number, installmentCount: number): number[] {
  if (!Number.isInteger(totalAmountCents) || totalAmountCents <= 0) {
    throw new Error('O valor total deve ser maior que zero em centavos.')
  }
  if (!Number.isInteger(installmentCount) || installmentCount < 1) {
    throw new Error('O numero de parcelas deve ser maior que zero.')
  }

  const baseAmount = Math.floor(totalAmountCents / installmentCount)
  const remainder = totalAmountCents % installmentCount
  return Array.from({ length: installmentCount }, (_, index) =>
    baseAmount + (index === installmentCount - 1 ? remainder : 0),
  )
}
