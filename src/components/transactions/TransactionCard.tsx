import type { Transaction } from '../../types'
import { formatHUF } from '../../utils/currency'
import { getCategoryInfo } from '../../utils/categories'

interface Props {
  transaction: Transaction
}

export default function TransactionCard({ transaction: t }: Props) {
  const isIncome = t.type === 'income'
  const cat = getCategoryInfo(t.category)
  const date = new Date(t.date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${cat.color}25` }}
      >
        {cat.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {t.description || cat.label}
        </p>
        <p className="text-xs text-white/40">{date}</p>
      </div>
      <span
        className="font-semibold text-sm"
        style={{ color: isIncome ? '#4ade80' : '#f87171' }}
      >
        {isIncome ? '+' : '-'}
        {formatHUF(t.amount)}
      </span>
    </div>
  )
}
