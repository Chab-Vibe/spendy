import type { RecurringTemplate, RecurringInstance } from '../../types'
import { formatHUF } from '../../utils/currency'
import { getCategoryInfo } from '../../utils/categories'

interface Props {
  templates: RecurringTemplate[]
  instances: RecurringInstance[]
  year: number
  month: number
}

export default function UpcomingRecurring({ templates, instances, year, month }: Props) {
  const active = templates.filter((t) => t.isActive)
  if (active.length === 0) return null

  const isPaid = (templateId: string) =>
    instances.some(
      (i) => i.templateId === templateId && i.year === year && i.month === month && i.paidAt,
    )

  const today = new Date().getDate()
  const upcoming = active
    .filter((t) => !isPaid(t.id) && t.dueDay >= today - 3)
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 4)

  if (upcoming.length === 0) return null

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.10)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.18)',
      }}
    >
      <div className="px-4 pt-4 pb-2">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
          Közelgő számlák
        </p>
      </div>
      <div className="divide-y divide-white/8">
        {upcoming.map((t) => {
          const cat = getCategoryInfo(t.category)
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl flex-shrink-0">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{t.name}</p>
                <p className="text-xs text-white/40">{t.dueDay}.-én esedékes</p>
              </div>
              <span className="font-semibold text-white/90 text-sm">{formatHUF(t.amount)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
