import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { Transaction } from '../../types'
import { formatHUF } from '../../utils/currency'
import { getCategoryInfo } from '../../utils/categories'

interface Props {
  transaction: Transaction
  onEdit?: () => void
  onDelete?: () => void
}

export default function TransactionCard({ transaction: t, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const isIncome = t.type === 'income'
  const cat = getCategoryInfo(t.category)
  const date = new Date(t.date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })

  return (
    <div>
      <div
        className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${cat.color}20` }}
        >
          {cat.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {t.description || cat.label}
          </p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
        <span className="font-semibold text-sm" style={{ color: isIncome ? '#16a34a' : '#ef4444' }}>
          {isIncome ? '+' : '-'}{formatHUF(t.amount)}
        </span>
      </div>

      {expanded && (
        <div className="flex gap-2 px-4 pb-3">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); setExpanded(false) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-all"
              style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' }}
            >
              <Pencil size={12} /> Szerkesztés
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); setExpanded(false) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-all"
              style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
            >
              <Trash2 size={12} /> Törlés
            </button>
          )}
        </div>
      )}
    </div>
  )
}
