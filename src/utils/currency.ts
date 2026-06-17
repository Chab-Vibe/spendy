export function formatHUF(amount: number): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function parseAmount(value: string): number {
  return parseInt(value.replace(/\D/g, ''), 10) || 0
}
