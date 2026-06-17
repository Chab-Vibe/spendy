import type { AppData, Transaction, RecurringTemplate, RecurringInstance } from '../types'

const KEY = 'spendy_data'

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    return JSON.parse(raw)
  } catch {
    return empty()
  }
}

function empty(): AppData {
  return { users: [], transactions: [], recurringTemplates: [], recurringInstances: [] }
}

function save(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getTransactions(): Transaction[] {
  return [...load().transactions].sort((a, b) => b.date.localeCompare(a.date))
}

export function addTransaction(tx: Transaction): void {
  const data = load()
  data.transactions.push(tx)
  save(data)
}

export function deleteTransaction(id: string): void {
  const data = load()
  data.transactions = data.transactions.filter(t => t.id !== id)
  save(data)
}

export function getRecurringTemplates(): RecurringTemplate[] {
  return load().recurringTemplates
}

export function addRecurringTemplate(t: RecurringTemplate): void {
  const data = load()
  data.recurringTemplates.push(t)
  save(data)
}

export function deleteRecurringTemplate(id: string): void {
  const data = load()
  data.recurringTemplates = data.recurringTemplates.filter(t => t.id !== id)
  save(data)
}

export function getRecurringInstances(): RecurringInstance[] {
  return load().recurringInstances
}

export function markRecurringPaid(templateId: string, year: number, month: number, userId: string): void {
  const data = load()
  const existing = data.recurringInstances.find(
    i => i.templateId === templateId && i.year === year && i.month === month,
  )
  if (existing) {
    existing.paidAt = new Date().toISOString()
    existing.paidByUserId = userId
  } else {
    data.recurringInstances.push({
      id: crypto.randomUUID(),
      templateId,
      year,
      month,
      paidAt: new Date().toISOString(),
      paidByUserId: userId,
    })
  }
  save(data)
}

export function unmarkRecurringPaid(templateId: string, year: number, month: number): void {
  const data = load()
  data.recurringInstances = data.recurringInstances.filter(
    i => !(i.templateId === templateId && i.year === year && i.month === month),
  )
  save(data)
}
