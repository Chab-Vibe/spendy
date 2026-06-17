import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import {
  getRecurringTemplates,
  getRecurringInstances,
  markRecurringPaid,
  unmarkRecurringPaid,
  addRecurringTemplate,
  deleteRecurringTemplate,
} from '../api/storage'
import RecurringItem from '../components/recurring/RecurringItem'
import AddRecurringModal from '../components/recurring/AddRecurringModal'
import { formatHUF } from '../utils/currency'

const glassCard = {
  background: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.18)',
}

export default function Recurring() {
  const { currentUserId, users, dataVersion, bumpData } = useStore()
  const userId = currentUserId ?? users[0]?.id ?? ''
  const [showAdd, setShowAdd] = useState(false)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const templates = useMemo(() => getRecurringTemplates(), [dataVersion])
  const instances = useMemo(() => getRecurringInstances(), [dataVersion])

  const isPaid = (templateId: string) =>
    instances.some(
      (i) => i.templateId === templateId && i.year === year && i.month === month && i.paidAt,
    )

  function handleTogglePaid(templateId: string) {
    if (isPaid(templateId)) {
      unmarkRecurringPaid(templateId, year, month)
    } else {
      markRecurringPaid(templateId, year, month, userId)
    }
    bumpData()
  }

  function handleDelete(id: string) {
    deleteRecurringTemplate(id)
    bumpData()
  }

  const active = templates.filter((t) => t.isActive).sort((a, b) => a.dueDay - b.dueDay)
  const total = active.reduce((s, t) => s + t.amount, 0)
  const paid = active.filter((t) => isPaid(t.id)).reduce((s, t) => s + t.amount, 0)
  const remaining = total - paid

  const monthLabel = now.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })

  return (
    <div className="min-h-dvh px-4 pt-14">
      {/* Header */}
      <div className="mb-6">
        <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">{monthLabel}</p>
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-white text-2xl font-bold">Rendszeres kiadások</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>

        <div className="flex gap-3">
          {[
            { label: 'Összes', value: total, color: 'white' },
            { label: 'Fizetve', value: paid, color: '#4ade80' },
            { label: 'Hátralévő', value: remaining, color: '#f87171' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 rounded-2xl p-3" style={glassCard}>
              <p className="text-white/50 text-[11px] mb-1">{label}</p>
              <p className="font-bold text-sm" style={{ color }}>{formatHUF(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      {active.length > 0 ? (
        <div className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="divide-y divide-white/8">
            {active.map((t) => (
              <RecurringItem
                key={t.id}
                template={t}
                paid={isPaid(t.id)}
                onToggle={() => handleTogglePaid(t.id)}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-10 text-center" style={glassCard}>
          <div className="text-5xl mb-4">🔄</div>
          <p className="text-white/60 text-sm mb-5">
            Még nincs rendszeres kiadás.
            <br />
            Add hozzá a havi számláidat!
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 rounded-2xl text-white font-semibold text-sm active:scale-95 transition-transform"
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            Hozzáadás
          </button>
        </div>
      )}

      {showAdd && (
        <AddRecurringModal
          onClose={() => setShowAdd(false)}
          onAdd={(t) => {
            addRecurringTemplate(t)
            bumpData()
            setShowAdd(false)
          }}
          userId={userId}
        />
      )}
    </div>
  )
}
