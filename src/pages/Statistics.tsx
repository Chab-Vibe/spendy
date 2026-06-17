import { useEffect, useState, useMemo } from 'react'
import { getTransactions } from '../api/storage'
import { useStore } from '../store/useStore'
import type { Transaction } from '../types'
import CategoryPieChart from '../components/statistics/CategoryPieChart'
import TrendBarChart from '../components/statistics/TrendBarChart'
import { formatHUF } from '../utils/currency'

const glassCard = {
  background: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.18)',
}

export default function Statistics() {
  const [period, setPeriod] = useState<'week' | 'month'>('month')
  const dataVersion = useStore((s) => s.dataVersion)
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    getTransactions().then(setAllTransactions).catch(console.error)
  }, [dataVersion])

  const now = new Date()
  const filtered = useMemo(() => {
    if (period === 'month') {
      return allTransactions.filter((t) => {
        const d = new Date(t.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    }
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    return allTransactions.filter((t) => new Date(t.date) >= weekAgo)
  }, [allTransactions, period])

  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const expenses = filtered.filter((t) => t.type === 'expense')

  return (
    <div className="min-h-dvh px-4 pt-14">
      <div className="mb-6">
        <p className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">Pénzügyek</p>
        <h1 className="text-white text-2xl font-bold mb-5">Statisztika</h1>

        <div
          className="flex rounded-2xl p-1 mb-5"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={
                period === p
                  ? { background: 'rgba(255,255,255,0.25)', color: 'white' }
                  : { color: 'rgba(255,255,255,0.5)' }
              }
            >
              {p === 'week' ? 'Heti' : 'Havi'}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {[
            { label: '↑ Bevétel', value: income, color: '#4ade80' },
            { label: '↓ Kiadás', value: expense, color: '#f87171' },
            { label: 'Egyenleg', value: income - expense, color: 'white' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 rounded-2xl p-3" style={glassCard}>
              <p className="text-white/50 text-[11px] mb-1">{label}</p>
              <p className="font-bold text-sm" style={{ color }}>{formatHUF(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {expenses.length > 0 ? (
        <div className="space-y-4">
          <CategoryPieChart transactions={expenses} />
          <TrendBarChart transactions={filtered} period={period} />
        </div>
      ) : (
        <div className="rounded-2xl p-10 text-center" style={glassCard}>
          <div className="text-5xl mb-4">📊</div>
          <p className="text-white/60 text-sm">Nincs adat a kiválasztott időszakra.</p>
        </div>
      )}
    </div>
  )
}
