import { useState } from 'react'
import { X } from 'lucide-react'
import type { RecurringTemplate, Category } from '../../types'
import { CATEGORIES } from '../../utils/categories'
import { useStore } from '../../store/useStore'

const modalBg = {
  background: '#ffffff',
  borderTop: '1px solid #e5e7eb',
  boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
}

const inputStyle = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  color: '#111827',
}

interface Props {
  onClose: () => void
  onAdd: (template: RecurringTemplate) => void
  userId: string
}

export default function AddRecurringModal({ onClose, onAdd, userId }: Props) {
  const customCategories = useStore((s) => s.customCategories)
  const allCats = [...CATEGORIES, ...customCategories]
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('rezsi')
  const [dueDay, setDueDay] = useState('1')

  function handleSave() {
    const amountNum = parseInt(amount.replace(/\D/g, ''), 10)
    const day = Math.min(31, Math.max(1, parseInt(dueDay, 10) || 1))
    if (!name.trim() || !amountNum) return

    onAdd({
      id: crypto.randomUUID(),
      userId,
      name: name.trim(),
      amount: amountNum,
      category,
      dueDay: day,
      isActive: true,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/40"
        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[430px] mx-auto rounded-t-3xl p-6 pb-10 max-h-[90dvh] overflow-y-auto"
        style={modalBg}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Rendszeres kiadás</h2>
          <button onClick={onClose} className="p-1 -mr-1">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Megnevezés</label>
            <input
              type="text"
              placeholder="pl. Villanyszámla"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-gray-500 text-xs mb-1 block">Összeg (Ft)</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div className="w-28">
              <label className="text-gray-500 text-xs mb-1 block">Esedékesség</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none pr-8"
                  style={inputStyle}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">-én</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-xs mb-2 block">Kategória</label>
            <div className="grid grid-cols-4 gap-2">
              {allCats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-2xl text-xs transition-all active:scale-95"
                  style={
                    category === cat.id
                      ? { background: `${cat.color}20`, border: `1px solid ${cat.color}50`, color: cat.color }
                      : { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#9ca3af' }
                  }
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="leading-tight text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || !amount}
          className="mt-6 w-full rounded-2xl py-4 font-semibold text-base text-white disabled:opacity-30 active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)',
            boxShadow: '0 6px 20px rgba(26,148,96,0.35)',
          }}
        >
          Hozzáadás
        </button>
      </div>
    </div>
  )
}
