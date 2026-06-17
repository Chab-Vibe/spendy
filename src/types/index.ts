export type TransactionType = 'income' | 'expense'

export type Category =
  | 'élelmiszer'
  | 'rezsi'
  | 'lakás'
  | 'közlekedés'
  | 'egészség'
  | 'szórakozás'
  | 'ruha'
  | 'egyéb'

export interface User {
  id: string
  name: string
  color: string
}

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  category: Category
  description: string
  date: string
  receiptImageUrl?: string
  aiAnalyzed: boolean
  createdAt: string
}

export interface RecurringTemplate {
  id: string
  userId: string
  name: string
  amount: number
  category: Category
  dueDay: number
  isActive: boolean
}

export interface RecurringInstance {
  id: string
  templateId: string
  year: number
  month: number
  paidAt?: string
  paidByUserId?: string
}

export interface AppData {
  users: User[]
  transactions: Transaction[]
  recurringTemplates: RecurringTemplate[]
  recurringInstances: RecurringInstance[]
}
