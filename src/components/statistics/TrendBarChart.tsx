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

const glassCard = {
  background: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.18)',
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
    <div className="rounded-2xl p-4" style={glassCard}>
      <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Trend</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
            interval={period === 'month' ? 6 : 0}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(v) => [formatHUF(Number(v ?? 0)), '']}
            contentStyle={{
              background: 'rgba(15,8,45,0.9)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              color: 'white',
            }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey="expense" name="Kiadás" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="income" name="Bevétel" fill="#4ade80" radius={[4, 4, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
