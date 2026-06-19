import { useEffect, useState } from 'react'
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
import type { RecurringTemplate, RecurringInstance } from '../types'
import RecurringItem from '../components/recurring/RecurringItem'
import AddRecurringModal from '../components/recurring/AddRecurringModal'
import { formatHUF } from '../utils/currency'

const card = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
}

export default function Recurring() {
  const { currentUserId, householdId, dataVersion, bumpData } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [templates, setTemplates] = useState<RecurringTemplate[]>([])
  const [instances, setInstances] = useState<RecurringInstance[]>([])

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  useEffect(() => {
    getRecurringTemplates().then(setTemplates).catch(console.error)
    getRecurringInstances().then(setInstances).catch(console.error)
  }, [dataVersion])

  const isPaid = (templateId: string) =>
    instances.some(
      (i) => i.templateId === templateId && i.year === year && i.month === month && i.paidAt,
    )

  async function handleTogglePaid(templateId: string) {
    if (!currentUserId) return
    if (isPaid(templateId)) {
      await unmarkRecurringPaid(templateId, year, month)
    } else {
      await markRecurringPaid(templateId, year, month, currentUserId)
    }
    bumpData()
  }

  async function handleDelete(id: string) {
    await deleteRecurringTemplate(id)
    bumpData()
  }

  const active = templates.filter((t) => t.isActive).sort((a, b) => a.dueDay - b.dueDay)
  const total = active.reduce((s, t) => s + t.amount, 0)
  const paid = active.filter((t) => isPaid(t.id)).reduce((s, t) => s + t.amount, 0)
  const remaining = total - paid
  const monthLabel = now.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })

  return (
    <div className="min-h-dvh px-4 pt-14">
      <div className="mb-6">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-1">{monthLabel}</p>
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-gray-900 text-2xl font-bold">Rendszeres kiadások</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: '#1a9460', boxShadow: '0 2px 10px rgba(26,148,96,0.4)' }}
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>

        <div className="flex gap-3">
          {[
            { label: 'Összes', value: total, color: '#111827' },
            { label: 'Fizetve', value: paid, color: '#16a34a' },
            { label: 'Hátralévő', value: remaining, color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 rounded-2xl p-3" style={card}>
              <p className="text-gray-400 text-[11px] mb-1">{label}</p>
              <p className="font-bold text-sm" style={{ color }}>{formatHUF(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {active.length > 0 ? (
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div className="divide-y divide-gray-100">
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
        <div className="rounded-2xl p-10 text-center" style={card}>
          <div className="text-5xl mb-4">🔄</div>
          <p className="text-gray-500 text-sm mb-5">
            Még nincs rendszeres kiadás.
            <br />
            Add hozzá a havi számláidat!
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-3 rounded-2xl text-white font-semibold text-sm active:scale-95 transition-transform"
            style={{ background: '#1a9460', boxShadow: '0 2px 10px rgba(26,148,96,0.4)' }}
          >
            Hozzáadás
          </button>
        </div>
      )}

      {showAdd && householdId && currentUserId && (
        <AddRecurringModal
          onClose={() => setShowAdd(false)}
          onAdd={async (t) => {
            await addRecurringTemplate(t, householdId)
            bumpData()
            setShowAdd(false)
          }}
          userId={currentUserId}
        />
      )}
    </div>
  )
}
