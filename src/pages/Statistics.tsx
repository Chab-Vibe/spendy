import { useEffect, useState, useMemo } from 'react'
import { getTransactions } from '../api/storage'
import { useStore } from '../store/useStore'
import type { Transaction } from '../types'
import CategoryPieChart from '../components/statistics/CategoryPieChart'
import TrendBarChart from '../components/statistics/TrendBarChart'
import { formatHUF } from '../utils/currency'

const card = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
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
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-1">Pénzügyek</p>
        <h1 className="text-gray-900 text-2xl font-bold mb-5">Statisztika</h1>

        <div
          className="flex rounded-2xl p-1 mb-5"
          style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}
        >
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={
                period === p
                  ? { background: '#1a9460', color: 'white' }
                  : { color: '#9ca3af' }
              }
            >
              {p === 'week' ? 'Heti' : 'Havi'}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {[
            { label: '↑ Bevétel', value: income, color: '#16a34a' },
            { label: '↓ Kiadás', value: expense, color: '#ef4444' },
            { label: 'Egyenleg', value: income - expense, color: '#111827' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 rounded-2xl p-3" style={card}>
              <p className="text-gray-400 text-[11px] mb-1">{label}</p>
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
        <div className="rounded-2xl p-10 text-center" style={card}>
          <div className="text-5xl mb-4">📊</div>
          <p className="text-gray-500 text-sm">Nincs adat a kiválasztott időszakra.</p>
        </div>
      )}
    </div>
  )
}
