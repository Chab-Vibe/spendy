import type { RecurringTemplate } from '../../types'
import { getCategoryInfo } from '../../utils/categories'
import { formatHUF } from '../../utils/currency'
import { Check, Trash2 } from 'lucide-react'

interface Props {
  template: RecurringTemplate
  paid: boolean
  onToggle: () => void
  onDelete: () => void
}

export default function RecurringItem({ template, paid, onToggle, onDelete }: Props) {
  const cat = getCategoryInfo(template.category)

  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="text-2xl flex-shrink-0">{cat.icon}</span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${paid ? 'text-gray-400 line-through' : 'text-gray-800'}`}
        >
          {template.name}
        </p>
        <p className="text-xs text-gray-400">
          {template.dueDay}.-én · {cat.label}
        </p>
      </div>
      <span className={`font-semibold text-sm mr-1 ${paid ? 'text-gray-400' : 'text-gray-700'}`}>
        {formatHUF(template.amount)}
      </span>
      <button
        onClick={onToggle}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={
          paid
            ? { background: '#1a9460', boxShadow: '0 0 12px rgba(26,148,96,0.4)' }
            : { border: '2px solid #e5e7eb' }
        }
      >
        {paid && <Check size={15} className="text-white" strokeWidth={3} />}
      </button>
      <button
        onClick={() => {
          if (confirm(`Töröljük a "${template.name}" rendszeres kiadást?`)) onDelete()
        }}
        className="w-8 h-8 flex items-center justify-center"
      >
        <Trash2 size={15} className="text-gray-300" />
      </button>
    </div>
  )
}
