import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { Transaction } from '../../types'
import { formatHUF } from '../../utils/currency'

interface Props {
  transactions: Transaction[]
  period: 'week' | 'month'
}

const card = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
}

function groupByDay(transactions: Transaction[], days: number) {
  const now = new Date()
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (days - 1 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const dayTxs = transactions.filter((t) => t.date === dateStr)
    return {
      label: d.toLocaleDateString('hu-HU', { month: 'numeric', day: 'numeric' }),
      expense: dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      income: dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    }
  })
}

export default function TrendBarChart({ transactions, period }: Props) {
  const days = period === 'week' ? 7 : 30
  const data = groupByDay(transactions, days)

  return (
    <div className="rounded-2xl p-4" style={card}>
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Trend</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            interval={period === 'month' ? 6 : 0}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [formatHUF(Number(v ?? 0)), '']}
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              color: '#111827',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
          />
          <Bar dataKey="expense" name="Kiadás" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="income" name="Bevétel" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
