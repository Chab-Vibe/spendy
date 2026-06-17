import { useState, useRef } from 'react'
import { X, Camera } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { addTransaction } from '../../api/storage'
import { analyzeReceipt } from '../../api/claude'
import type { Transaction, Category, TransactionType } from '../../types'
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

export default function AddTransactionModal() {
  const { setShowAddModal, currentUserId, users, bumpData } = useStore()
  const user = users.find((u) => u.id === currentUserId) ?? users[0]

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('egyéb')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [analyzing, setAnalyzing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageCapture(file: File) {
    setAnalyzing(true)
    try {
      const base64 = await fileToBase64(file)
      const result = await analyzeReceipt(base64)
      if (result.amount > 0) setAmount(String(result.amount))
      if (result.description) setDescription(result.description)
      if (result.category) setCategory(result.category as Category)
    } catch (e: unknown) {
      const err = e as Error
      if (err.message === 'NO_API_KEY') {
        alert('Az AI elemzéshez add meg a VITE_ANTHROPIC_API_KEY kulcsot az .env.local fájlban.')
      } else {
        alert('Nem sikerült elemezni a blokkot. Töltsd ki kézzel.')
      }
    } finally {
      setAnalyzing(false)
    }
  }

  function handleSave() {
    const amountNum = parseInt(amount.replace(/\D/g, ''), 10)
    if (!amountNum || !user) return

    const tx: Transaction = {
      id: crypto.randomUUID(),
      userId: user.id,
      type,
      amount: amountNum,
      category: type === 'income' ? 'egyéb' : category,
      description: description.trim(),
      date,
      aiAnalyzed: false,
      createdAt: new Date().toISOString(),
    }
    addTransaction(tx)
    bumpData()
    setShowAddModal(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        onClick={() => setShowAddModal(false)}
      />
      <div
        className="relative w-full max-w-[430px] mx-auto rounded-t-3xl p-6 pb-10 max-h-[90dvh] overflow-y-auto"
        style={modalBg}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Új tétel</h2>
          <button onClick={() => setShowAddModal(false)} className="p-1 -mr-1">
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

        {/* Amount + camera */}
        <div className="mb-5">
          <label className="text-white/50 text-xs mb-2 block">Összeg (Ft)</label>
          <div className="flex items-end gap-3">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-4xl font-bold text-white bg-transparent pb-2 focus:outline-none"
              style={{ borderBottom: '2px solid rgba(167,139,250,0.6)' }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={analyzing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: 'rgba(167,139,250,0.2)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.3)' }}
            >
              <Camera size={15} />
              {analyzing ? '...' : 'Blokk'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageCapture(e.target.files[0])}
            />
          </div>
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
            placeholder={type === 'expense' ? 'pl. Tesco bevásárlás' : 'pl. Fizetés'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
            style={{ ...inputStyle, '::placeholder': { color: 'rgba(255,255,255,0.3)' } } as React.CSSProperties}
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

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!amount || !user}
          className="w-full rounded-2xl py-4 font-semibold text-base text-white disabled:opacity-30 active:scale-95 transition-transform"
          style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
            boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
          }}
        >
          Mentés
        </button>
      </div>
    </div>
  )
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
