import { useState } from 'react'
import { X } from 'lucide-react'
import type { RecurringTemplate, Category } from '../../types'
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
  onClose: () => void
  onAdd: (template: RecurringTemplate) => void
  userId: string
}

export default function AddRecurringModal({ onClose, onAdd, userId }: Props) {
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
          <h2 className="text-lg font-bold text-white">Rendszeres kiadás</h2>
          <button onClick={onClose} className="p-1 -mr-1">
            <X size={20} className="text-white/50" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/50 text-xs mb-1 block">Megnevezés</label>
            <input
              type="text"
              placeholder="pl. Villanyszámla"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-white/50 text-xs mb-1 block">Összeg (Ft)</label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div className="w-28">
              <label className="text-white/50 text-xs mb-1 block">Esedékesség</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none pr-8"
                  style={inputStyle}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">-én</span>
              </div>
            </div>
          </div>

          <div>
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
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || !amount}
          className="mt-6 w-full rounded-2xl py-4 font-semibold text-base text-white disabled:opacity-30 active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
            boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
          }}
        >
          Hozzáadás
        </button>
      </div>
    </div>
  )
}
