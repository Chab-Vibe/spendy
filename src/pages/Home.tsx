import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { getTransactions, getRecurringTemplates, getRecurringInstances } from '../api/storage'
import type { Transaction, RecurringTemplate, RecurringInstance } from '../types'
import UserSwitcher from '../components/layout/UserSwitcher'
import UpcomingRecurring from '../components/dashboard/UpcomingRecurring'
import TransactionCard from '../components/transactions/TransactionCard'
import { formatHUF } from '../utils/currency'

const glassCard = {
  background: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.18)',
}

const glassStrong = {
  background: 'rgba(255,255,255,0.15)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255,255,255,0.22)',
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
          <p className="text-white/50 text-xs font-medium uppercase tracking-widest">
            {now.toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' })}
          </p>
          <p className="text-white font-semibold text-sm mt-0.5">Áttekintés</p>
        </div>
        <UserSwitcher />
      </div>

      <div className="mb-6">
        <p className="text-white/60 text-sm mb-1">Havi egyenleg</p>
        <p
          className="text-5xl font-bold text-white mb-6 tracking-tight"
          style={{ textShadow: '0 2px 20px rgba(255,255,255,0.2)' }}
        >
          {formatHUF(balance)}
        </p>
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl p-4" style={glassCard}>
            <p className="text-white/60 text-xs mb-1">↑ Bevétel</p>
            <p className="text-white font-bold text-lg">{formatHUF(income)}</p>
          </div>
          <div className="flex-1 rounded-2xl p-4" style={glassCard}>
            <p className="text-white/60 text-xs mb-1">↓ Kiadás</p>
            <p className="text-white font-bold text-lg">{formatHUF(expense)}</p>
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
        <div className="rounded-2xl overflow-hidden mt-4" style={glassStrong}>
          <div className="px-4 pt-4 pb-2">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">
              Legutóbbi tranzakciók
            </p>
          </div>
          <div className="divide-y divide-white/8">
            {recent.map((t) => (
              <TransactionCard key={t.id} transaction={t} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-10 text-center mt-4" style={glassCard}>
          <div className="text-5xl mb-4">💰</div>
          <p className="text-white/60 text-sm leading-relaxed">
            Még nincs tranzakció.
            <br />
            Nyomj a + gombra az első rögzítéséhez!
          </p>
        </div>
      )}
    </div>
  )
}
