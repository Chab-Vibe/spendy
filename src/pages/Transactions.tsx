import { useMemo, useState } from 'react'
import { getTransactions } from '../api/storage'
import { useStore } from '../store/useStore'
import TransactionCard from '../components/transactions/TransactionCard'
import { CATEGORIES } from '../utils/categories'
import type { Category } from '../types'

const glassCard = {
  background: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.18)',
}

const pillActive = {
  background: 'rgba(255,255,255,0.25)',
  border: '1px solid rgba(255,255,255,0.3)',
}
const pillInactive = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
}

export default function Transactions() {
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all')
  const dataVersion = useStore((s) => s.dataVersion)
  const allTransactions = useMemo(() => getTransactions(), [dataVersion])

  const filtered = allTransactions.filter((t) => {
    const catOk = filter === 'all' || t.category === filter
    const typeOk = typeFilter === 'all' || t.type === typeFilter
    return catOk && typeOk
  })

  return (
    <div className="min-h-dvh px-4 pt-14">
      <div className="mb-6">
        <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">Előzmények</p>
        <h1 className="text-white text-2xl font-bold mb-5">Tranzakciók</h1>

        {/* Type filter */}
        <div className="flex gap-2 mb-3">
          {([
            { key: 'all', label: 'Összes' },
            { key: 'expense', label: '↓ Kiadás' },
            { key: 'income', label: '↑ Bevétel' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-all"
              style={typeFilter === key ? pillActive : pillInactive}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white whitespace-nowrap transition-all flex-shrink-0"
            style={filter === 'all' ? pillActive : pillInactive}
          >
            Mind
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white whitespace-nowrap transition-all flex-shrink-0"
              style={filter === cat.id ? pillActive : pillInactive}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="rounded-2xl overflow-hidden" style={glassCard}>
          <div className="divide-y divide-white/8 px-4">
            {filtered.map((t) => (
              <TransactionCard key={t.id} transaction={t} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-10 text-center" style={glassCard}>
          <div className="text-5xl mb-4">📋</div>
          <p className="text-white/60 text-sm">Nincs tranzakció ebben a szűrőben.</p>
        </div>
      )}
    </div>
  )
}
