import { useState, useRef } from 'react'
import { X, Camera } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { addTransaction } from '../../api/storage'
import { analyzeReceipt } from '../../api/claude'
import type { ReceiptLineItem } from '../../api/claude'
import type { Category, TransactionType } from '../../types'
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
  const { setShowAddModal, currentUserId, householdId, bumpData } = useStore()

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('egyéb')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [analyzing, setAnalyzing] = useState(false)
  const [scanError, setScanError] = useState('')
  const [fileInputKey, setFileInputKey] = useState(0)
  const [receiptItems, setReceiptItems] = useState<ReceiptLineItem[] | null>(null)
  const [receiptStore, setReceiptStore] = useState('')
  const [editCatIdx, setEditCatIdx] = useState<number | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  async function handleImageCapture(file: File) {
    setAnalyzing(true)
    setScanError('')
    try {
      const base64 = await fileToBase64(file)
      const supported = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      const mimeType = supported.includes(file.type) ? file.type : 'image/jpeg'
      const result = await analyzeReceipt(base64, mimeType)
      const validIds: string[] = CATEGORIES.map((c) => c.id)
      const items = (result.lineItems ?? []).map((item) => ({
        ...item,
        category: validIds.includes(item.category) ? item.category : 'egyéb',
      }))
      setReceiptItems(
        items.length > 0
          ? items
          : [{ amount: result.totalAmount ?? 0, category: 'egyéb', description: 'Blokk' }],
      )
      setReceiptStore(result.storeName ?? '')
    } catch (e: unknown) {
      const err = e as Error
      setScanError(err.message === 'NO_API_KEY' ? 'Hiányzó API kulcs (VITE_ANTHROPIC_API_KEY)' : `Hiba: ${err.message}`)
    } finally {
      setAnalyzing(false)
      setFileInputKey((k) => k + 1)
    }
  }

  async function handleSave() {
    const amountNum = parseInt(amount.replace(/\D/g, ''), 10)
    if (!amountNum || !currentUserId || !householdId) return

    await addTransaction(
      {
        userId: currentUserId,
        type,
        amount: amountNum,
        category: type === 'income' ? 'egyéb' : category,
        description: description.trim(),
        date,
        aiAnalyzed: false,
      },
      householdId,
    )
    bumpData()
    setShowAddModal(false)
  }

  async function handleReceiptSave() {
    if (!receiptItems || !currentUserId || !householdId) return
    for (const item of receiptItems) {
      if (item.amount <= 0) continue
      await addTransaction(
        {
          userId: currentUserId,
          type: 'expense',
          amount: item.amount,
          category: item.category as Category,
          description: item.description || receiptStore || 'Blokk',
          date,
          aiAnalyzed: true,
        },
        householdId,
      )
    }
    bumpData()
    setShowAddModal(false)
  }

  const totalAmount = receiptItems?.reduce((s, i) => s + (i.amount || 0), 0) ?? 0

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
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">
            {receiptItems !== null ? 'Blokk elemzés' : 'Új tétel'}
          </h2>
          <button onClick={() => setShowAddModal(false)} className="p-1 -mr-1">
            <X size={20} className="text-white/50" />
          </button>
        </div>

        {receiptItems !== null ? (
          /* ── Receipt review mode ── */
          <div>
            {receiptStore && (
              <p className="text-center text-white/60 text-sm mb-4">{receiptStore}</p>
            )}

            <div className="space-y-2 mb-4">
              {receiptItems.map((item, idx) => {
                const catInfo =
                  CATEGORIES.find((c) => c.id === item.category) ??
                  CATEGORIES.find((c) => c.id === 'egyéb')!
                return (
                  <div key={idx}>
                    <div
                      className="flex items-center gap-2 p-3 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <button
                        onClick={() => setEditCatIdx(editCatIdx === idx ? null : idx)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium active:scale-95 transition-all shrink-0"
                        style={{
                          background: `${catInfo.color}25`,
                          border: `1px solid ${catInfo.color}50`,
                          color: catInfo.color,
                        }}
                      >
                        <span>{catInfo.icon}</span>
                        <span>{catInfo.label}</span>
                      </button>
                      <span className="flex-1 text-white/50 text-xs truncate">
                        {item.description}
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={item.amount || ''}
                        onChange={(e) => {
                          const updated = [...receiptItems]
                          updated[idx] = { ...item, amount: parseInt(e.target.value) || 0 }
                          setReceiptItems(updated)
                        }}
                        className="w-20 text-right text-white font-semibold bg-transparent focus:outline-none text-sm shrink-0"
                        style={{ borderBottom: '1px solid rgba(167,139,250,0.4)' }}
                      />
                      <span className="text-white/40 text-xs shrink-0">Ft</span>
                      <button
                        onClick={() => {
                          setReceiptItems(receiptItems.filter((_, i) => i !== idx))
                          if (editCatIdx === idx) setEditCatIdx(null)
                        }}
                        className="p-1 text-white/30 active:text-red-400 transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {editCatIdx === idx && (
                      <div
                        className="grid grid-cols-4 gap-1.5 mt-1.5 p-2 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              const updated = [...receiptItems]
                              updated[idx] = { ...item, category: cat.id }
                              setReceiptItems(updated)
                              setEditCatIdx(null)
                            }}
                            className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all active:scale-95"
                            style={
                              item.category === cat.id
                                ? {
                                    background: `${cat.color}30`,
                                    border: `1px solid ${cat.color}60`,
                                    color: cat.color,
                                  }
                                : {
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'rgba(255,255,255,0.5)',
                                  }
                            }
                          >
                            <span className="text-lg">{cat.icon}</span>
                            <span className="text-[10px] leading-tight text-center">
                              {cat.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div
              className="flex justify-between items-center px-3 py-2.5 mb-5 rounded-xl"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              <span className="text-white/60 text-sm">Összesen</span>
              <span className="text-white font-bold">{totalAmount.toLocaleString('hu-HU')} Ft</span>
            </div>

            <div className="mb-5">
              <label className="text-white/50 text-xs mb-1 block">Dátum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReceiptItems(null)
                  setReceiptStore('')
                  setEditCatIdx(null)
                }}
                className="flex-1 py-3.5 rounded-2xl text-white/60 text-sm font-medium"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                ← Kézi bevitel
              </button>
              <button
                onClick={handleReceiptSave}
                disabled={receiptItems.length === 0 || !currentUserId || !householdId}
                className="flex-1 py-3.5 rounded-2xl text-white font-semibold text-sm disabled:opacity-30 active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                  boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
                }}
              >
                Mentés ({receiptItems.length})
              </button>
            </div>
          </div>
        ) : (
          /* ── Normal form mode ── */
          <>
            {/* Type toggle */}
            <div
              className="flex rounded-2xl p-1 mb-6"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {(['expense', 'income'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={
                    type === t
                      ? {
                          background:
                            t === 'expense' ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)',
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
              <div className="flex justify-between items-center mb-2">
                <label className="text-white/50 text-xs">Összeg (Ft)</label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => cameraRef.current?.click()}
                    disabled={analyzing}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-transform disabled:opacity-50"
                    style={{ background: 'rgba(167,139,250,0.2)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.3)' }}
                  >
                    <Camera size={12} />
                    {analyzing ? '...' : 'Kamera'}
                  </button>
                  <button
                    onClick={() => galleryRef.current?.click()}
                    disabled={analyzing}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-transform disabled:opacity-50"
                    style={{ background: 'rgba(167,139,250,0.2)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.3)' }}
                  >
                    🖼️
                  </button>
                </div>
                <input
                  key={`cam-${fileInputKey}`}
                  ref={cameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageCapture(f) }}
                />
                <input
                  key={`gal-${fileInputKey}`}
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageCapture(f) }}
                />
              </div>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-4xl font-bold text-white bg-transparent pb-2 focus:outline-none"
                style={{ borderBottom: '2px solid rgba(167,139,250,0.6)' }}
              />
              {scanError && (
                <p className="mt-2 text-xs text-red-400">{scanError}</p>
              )}
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
                          ? {
                              background: `${cat.color}30`,
                              border: `1px solid ${cat.color}60`,
                              color: cat.color,
                            }
                          : {
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.5)',
                            }
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

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!amount || !currentUserId || !householdId}
              className="w-full rounded-2xl py-4 font-semibold text-base text-white disabled:opacity-30 active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
              }}
            >
              Mentés
            </button>
          </>
        )}
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
