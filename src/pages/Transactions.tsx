import { useEffect, useState } from 'react'
import { getTransactions, deleteTransaction } from '../api/storage'
import { useStore } from '../store/useStore'
import type { Transaction } from '../types'
import TransactionCard from '../components/transactions/TransactionCard'
import EditTransactionModal from '../components/transactions/EditTransactionModal'
import { CATEGORIES } from '../utils/categories'
import type { Category } from '../types'

const card = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
}

export default function Transactions() {
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all')
  const { dataVersion, bumpData } = useStore()
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)

  useEffect(() => {
    getTransactions().then(setAllTransactions).catch(console.error)
  }, [dataVersion])

  const filtered = allTransactions.filter((t) => {
    const catOk = filter === 'all' || t.category === filter
    const typeOk = typeFilter === 'all' || t.type === typeFilter
    return catOk && typeOk
  })

  async function handleDelete(id: string) {
    await deleteTransaction(id)
    bumpData()
  }

  return (
    <div className="min-h-dvh px-4 pt-14">
      <div className="mb-6">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-1">Előzmények</p>
        <h1 className="text-gray-900 text-2xl font-bold mb-5">Tranzakciók</h1>

        <div className="flex gap-2 mb-3">
          {([
            { key: 'all', label: 'Összes' },
            { key: 'expense', label: '↓ Kiadás' },
            { key: 'income', label: '↑ Bevétel' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                typeFilter === key
                  ? { background: '#1a9460', color: 'white' }
                  : { background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#6b7280' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
            style={
              filter === 'all'
                ? { background: '#1a9460', color: 'white' }
                : { background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#6b7280' }
            }
          >
            Mind
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={
                filter === cat.id
                  ? { background: '#1a9460', color: 'white' }
                  : { background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#6b7280' }
              }
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div className="divide-y divide-gray-100">
            {filtered.map((t) => (
              <TransactionCard
                key={t.id}
                transaction={t}
                onEdit={() => setEditingTx(t)}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-10 text-center" style={card}>
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 text-sm">Nincs tranzakció ebben a szűrőben.</p>
        </div>
      )}

      {editingTx && (
        <EditTransactionModal
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  )
}
