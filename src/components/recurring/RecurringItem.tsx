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
          className={`text-sm font-medium truncate ${paid ? 'text-white/40 line-through' : 'text-white'}`}
        >
          {template.name}
        </p>
        <p className="text-xs text-white/40">
          {template.dueDay}.-én · {cat.label}
        </p>
      </div>
      <span className={`font-semibold text-sm mr-1 ${paid ? 'text-white/40' : 'text-white'}`}>
        {formatHUF(template.amount)}
      </span>
      <button
        onClick={onToggle}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={
          paid
            ? { background: '#4ade80', boxShadow: '0 0 12px rgba(74,222,128,0.5)' }
            : { border: '2px solid rgba(255,255,255,0.2)' }
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
        <Trash2 size={15} className="text-white/20" />
      </button>
    </div>
  )
}
