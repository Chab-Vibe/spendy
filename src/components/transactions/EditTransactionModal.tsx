import { useState } from 'react'
import { X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { updateTransaction, deleteTransaction } from '../../api/storage'
import type { Category, Transaction, TransactionType } from '../../types'
import { CATEGORIES } from '../../utils/categories'

const modalBg = {
  background: 'rgba(15, 8, 45, 0.92)',
  backdropFilter: 'blur(50px)',
  WebkitBackdropFilter: 'blur(50px)',
  borderTop: '1px solid rgba(255,255,255,0.15)',
}

const inputStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
}

interface Props {
  transaction: Transaction
  onClose: () => void
}

export default function EditTransactionModal({ transaction, onClose }: Props) {
  const { bumpData } = useStore()

  const [type, setType] = useState<TransactionType>(transaction.type)
  const [amount, setAmount] = useState(String(transaction.amount))
  const [category, setCategory] = useState<Category>(transaction.category)
  const [description, setDescription] = useState(transaction.description)
  const [date, setDate] = useState(transaction.date)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    const amountNum = parseInt(amount.replace(/\D/g, ''), 10)
    if (!amountNum) return
    await updateTransaction(transaction.id, {
      type,
      amount: amountNum,
      category: type === 'income' ? 'egyéb' : category,
      description: description.trim(),
      date,
    })
    bumpData()
    onClose()
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteTransaction(transaction.id)
    bumpData()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[430px] mx-auto rounded-t-3xl p-6 pb-10 max-h-[90dvh] overflow-y-auto"
        style={modalBg}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Tétel szerkesztése</h2>
          <button onClick={onClose} className="p-1 -mr-1">
            <X size={20} className="text-white/50" />
          </button>
        </div>

        {/* Type toggle */}
        <div
          className="flex rounded-2xl p-1 mb-6"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={
                type === t
                  ? {
                      background: t === 'expense' ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)',
                      color: t === 'expense' ? '#fca5a5' : '#86efac',
                      border: `1px solid ${t === 'expense' ? 'rgba(248,113,113,0.4)' : 'rgba(74,222,128,0.4)'}`,
                    }
                  : { color: 'rgba(255,255,255,0.4)' }
              }
            >
              {t === 'expense' ? '↓ Kiadás' : '↑ Bevétel'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="mb-5">
          <label className="text-white/50 text-xs mb-2 block">Összeg (Ft)</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-4xl font-bold text-white bg-transparent pb-2 focus:outline-none"
            style={{ borderBottom: '2px solid rgba(167,139,250,0.6)' }}
          />
        </div>

        {/* Category */}
        {type === 'expense' && (
          <div className="mb-5">
            <label className="text-white/50 text-xs mb-2 block">Kategória</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-2xl text-xs transition-all active:scale-95"
                  style={
                    category === cat.id
                      ? { background: `${cat.color}30`, border: `1px solid ${cat.color}60`, color: cat.color }
                      : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
                  }
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="leading-tight text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-5">
          <label className="text-white/50 text-xs mb-1 block">Leírás (opcionális)</label>
          <input
            type="text"
            placeholder="pl. Tesco bevásárlás"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>

        {/* Date */}
        <div className="mb-6">
          <label className="text-white/50 text-xs mb-1 block">Dátum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!amount}
          className="w-full rounded-2xl py-4 font-semibold text-base text-white disabled:opacity-30 active:scale-95 transition-transform mb-3"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
            boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
          }}
        >
          Mentés
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full rounded-2xl py-3.5 font-semibold text-sm text-red-400 disabled:opacity-30 active:scale-95 transition-transform"
          style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}
        >
          {deleting ? 'Törlés...' : 'Tétel törlése'}
        </button>
      </div>
    </div>
  )
}
