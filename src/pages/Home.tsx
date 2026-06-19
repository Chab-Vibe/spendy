import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { getTransactions, getRecurringTemplates, getRecurringInstances } from '../api/storage'
import type { Transaction, RecurringTemplate, RecurringInstance } from '../types'
import UserSwitcher from '../components/layout/UserSwitcher'
import UpcomingRecurring from '../components/dashboard/UpcomingRecurring'
import TransactionCard from '../components/transactions/TransactionCard'
import { formatHUF } from '../utils/currency'

const card = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
}

export default function Home() {
  const { dataVersion } = useStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [templates, setTemplates] = useState<RecurringTemplate[]>([])
  const [instances, setInstances] = useState<RecurringInstance[]>([])

  useEffect(() => {
    getTransactions().then(setTransactions).catch(console.error)
    getRecurringTemplates().then(setTemplates).catch(console.error)
    getRecurringInstances().then(setInstances).catch(console.error)
  }, [dataVersion])

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const monthlyTx = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
  })

  const income = monthlyTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = monthlyTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense
  const recent = transactions.slice(0, 5)

  return (
    <div className="min-h-dvh px-4 pt-14">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">
            {now.toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' })}
          </p>
          <p className="text-gray-700 font-semibold text-sm mt-0.5">Áttekintés</p>
        </div>
        <UserSwitcher />
      </div>

      <div className="mb-6">
        <p className="text-gray-500 text-sm mb-1">Havi egyenleg</p>
        <p className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          {formatHUF(balance)}
        </p>
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl p-4" style={card}>
            <p className="text-gray-400 text-xs mb-1">↑ Bevétel</p>
            <p className="font-bold text-lg" style={{ color: '#16a34a' }}>{formatHUF(income)}</p>
          </div>
          <div className="flex-1 rounded-2xl p-4" style={card}>
            <p className="text-gray-400 text-xs mb-1">↓ Kiadás</p>
            <p className="font-bold text-lg" style={{ color: '#ef4444' }}>{formatHUF(expense)}</p>
          </div>
        </div>
      </div>

      <UpcomingRecurring
        templates={templates}
        instances={instances}
        year={currentYear}
        month={currentMonth}
      />

      {recent.length > 0 ? (
        <div className="rounded-2xl overflow-hidden mt-4" style={card}>
          <div className="px-4 pt-4 pb-2">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
              Legutóbbi tranzakciók
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {recent.map((t) => (
              <TransactionCard key={t.id} transaction={t} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-10 text-center mt-4" style={card}>
          <div className="text-5xl mb-4">💰</div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Még nincs tranzakció.
            <br />
            Nyomj a + gombra az első rögzítéséhez!
          </p>
        </div>
      )}
    </div>
  )
}
