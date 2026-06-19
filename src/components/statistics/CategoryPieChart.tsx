import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Transaction } from '../../types'
import { CATEGORIES } from '../../utils/categories'
import { formatHUF } from '../../utils/currency'

interface Props {
  transactions: Transaction[]
}

const card = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
}

export default function CategoryPieChart({ transactions }: Props) {
  const data = CATEGORIES.map((cat) => ({
    name: cat.label,
    value: transactions
      .filter((t) => t.category === cat.id)
      .reduce((s, t) => s + t.amount, 0),
    color: cat.color,
  }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) return null

  return (
    <div className="rounded-2xl p-4" style={card}>
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Kategóriák</p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={88}
            innerRadius={54}
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [formatHUF(Number(v ?? 0)), '']}
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              color: '#111827',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => (
              <span style={{ fontSize: '11px', color: '#6b7280' }}>{v}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
