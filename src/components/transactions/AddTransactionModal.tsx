import { useState, useRef } from 'react'
import { X, Camera, Plus, Image } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { addTransaction, addCustomCategory } from '../../api/storage'
import { analyzeReceipt } from '../../api/claude'
import type { ReceiptLineItem } from '../../api/claude'
import type { Category, TransactionType } from '../../types'
import { CATEGORIES } from '../../utils/categories'
import CameraCapture from './CameraCapture'

const CAT_COLORS = ['#22C55E', '#3B82F6', '#F97316', '#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4', '#EF4444']

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

export default function AddTransactionModal() {
  const { setShowAddModal, currentUserId, householdId, bumpData, customCategories, setCustomCategories } = useStore()

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('egyéb')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [analyzing, setAnalyzing] = useState(false)
  const [scanError, setScanError] = useState('')
  const [fileInputKey, setFileInputKey] = useState(0)
  const [showCamera, setShowCamera] = useState(false)
  const [receiptItems, setReceiptItems] = useState<ReceiptLineItem[] | null>(null)
  const [receiptStore, setReceiptStore] = useState('')
  const [editCatIdx, setEditCatIdx] = useState<number | null>(null)

  // Új kategória hozzáadás
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatIcon, setNewCatIcon] = useState('📁')
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatColor, setNewCatColor] = useState(CAT_COLORS[0])
  const [addingCat, setAddingCat] = useState(false)

  const galleryRef = useRef<HTMLInputElement>(null)
  const allCats = [...CATEGORIES, ...customCategories]

  async function handleImageCapture(file: File) {
    setAnalyzing(true)
    setScanError('')
    try {
      const base64 = await compressImage(file)
      const result = await Promise.race([
        analyzeReceipt(base64, 'image/jpeg'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Időtúllépés – próbáld újra')), 30000)
        ),
      ])
      const validIds = allCats.map((c) => c.id)
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
      const msg =
        err.message === 'NO_API_KEY' ? 'Hiányzó API kulcs (VITE_ANTHROPIC_API_KEY)' :
        err.message === 'PARSE_ERROR' ? 'Nem sikerült elemezni a blokkot (rossz válaszformátum)' :
        err.message
      setScanError(msg)
      console.error('[blokk-elemzés hiba]', err)
    } finally {
      setAnalyzing(false)
      setFileInputKey((k) => k + 1)
    }
  }

  async function handleSave() {
    const amountNum = parseInt(amount.replace(/\D/g, ''), 10)
    if (!amountNum || !currentUserId || !householdId) return
    await addTransaction(
      { userId: currentUserId, type, amount: amountNum, category: type === 'income' ? 'egyéb' : category, description: description.trim(), date, aiAnalyzed: false },
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
        { userId: currentUserId, type: 'expense', amount: item.amount, category: item.category as Category, description: item.description || receiptStore || 'Blokk', date, aiAnalyzed: true },
        householdId,
      )
    }
    bumpData()
    setShowAddModal(false)
  }

  async function handleAddCategory() {
    if (!newCatLabel.trim() || !householdId) return
    setAddingCat(true)
    try {
      await addCustomCategory(householdId, newCatLabel.trim(), newCatIcon, newCatColor)
      const newCat = { id: `custom_${Date.now()}`, label: newCatLabel.trim(), icon: newCatIcon, color: newCatColor }
      setCustomCategories([...customCategories, newCat])
      setCategory(newCat.id)
      setShowAddCat(false)
      setNewCatLabel('')
      setNewCatIcon('📁')
      setNewCatColor(CAT_COLORS[0])
      // A pontos ID-t a DB adja vissza — inkább bumpData + reload
      bumpData()
    } finally {
      setAddingCat(false)
    }
  }

  const totalAmount = receiptItems?.reduce((s, i) => s + (i.amount || 0), 0) ?? 0

  return (
  <>
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/40"
        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        onClick={() => setShowAddModal(false)}
      />
      <div
        className="relative w-full max-w-[430px] mx-auto rounded-t-3xl p-6 pb-10 max-h-[90dvh] overflow-y-auto"
        style={modalBg}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {receiptItems !== null ? 'Blokk elemzés' : 'Új tétel'}
          </h2>
          <button onClick={() => setShowAddModal(false)} className="p-1 -mr-1">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {receiptItems !== null ? (
          <div>
            {receiptStore && (
              <p className="text-center text-gray-500 text-sm mb-4">{receiptStore}</p>
            )}
            <div className="space-y-2 mb-4">
              {receiptItems.map((item, idx) => {
                const catInfo = allCats.find((c) => c.id === item.category) ?? allCats.find((c) => c.id === 'egyéb')!
                return (
                  <div key={idx}>
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => setEditCatIdx(editCatIdx === idx ? null : idx)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium active:scale-95 transition-all shrink-0"
                        style={{ background: `${catInfo.color}18`, border: `1px solid ${catInfo.color}40`, color: catInfo.color }}
                      >
                        <span>{catInfo.icon}</span>
                        <span>{catInfo.label}</span>
                      </button>
                      <span className="flex-1 text-gray-400 text-xs truncate">{item.description}</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={item.amount || ''}
                        onChange={(e) => {
                          const updated = [...receiptItems]
                          updated[idx] = { ...item, amount: parseInt(e.target.value) || 0 }
                          setReceiptItems(updated)
                        }}
                        className="w-20 text-right text-gray-900 font-semibold bg-transparent focus:outline-none text-sm shrink-0"
                        style={{ borderBottom: '1px solid #1a9460' }}
                      />
                      <span className="text-gray-400 text-xs shrink-0">Ft</span>
                      <button
                        onClick={() => { setReceiptItems(receiptItems.filter((_, i) => i !== idx)); if (editCatIdx === idx) setEditCatIdx(null) }}
                        className="p-1 text-gray-300 active:text-red-400 transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {editCatIdx === idx && (
                      <div className="grid grid-cols-4 gap-1.5 mt-1.5 p-2 rounded-xl" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                        {allCats.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => { const updated = [...receiptItems]; updated[idx] = { ...item, category: cat.id }; setReceiptItems(updated); setEditCatIdx(null) }}
                            className="flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all active:scale-95"
                            style={item.category === cat.id
                              ? { background: `${cat.color}18`, border: `1px solid ${cat.color}40`, color: cat.color }
                              : { background: '#ffffff', border: '1px solid #e5e7eb', color: '#9ca3af' }}
                          >
                            <span className="text-lg">{cat.icon}</span>
                            <span className="text-[10px] leading-tight text-center">{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between items-center px-3 py-2.5 mb-5 rounded-xl" style={{ border: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <span className="text-gray-500 text-sm">Összesen</span>
              <span className="text-gray-900 font-bold">{totalAmount.toLocaleString('hu-HU')} Ft</span>
            </div>
            <div className="mb-5">
              <label className="text-gray-500 text-xs mb-1 block">Dátum</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setReceiptItems(null); setReceiptStore(''); setEditCatIdx(null) }} className="flex-1 py-3.5 rounded-2xl text-gray-500 text-sm font-medium" style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                ← Kézi bevitel
              </button>
              <button onClick={handleReceiptSave} disabled={receiptItems.length === 0 || !currentUserId || !householdId} className="flex-1 py-3.5 rounded-2xl text-white font-semibold text-sm disabled:opacity-30 active:scale-95 transition-transform" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)', boxShadow: '0 6px 20px rgba(26,148,96,0.35)' }}>
                Mentés ({receiptItems.length})
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Type toggle */}
            <div className="flex rounded-2xl p-1 mb-6" style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
              {(['expense', 'income'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={type === t
                    ? { background: t === 'expense' ? '#fef2f2' : '#f0fdf4', color: t === 'expense' ? '#ef4444' : '#16a34a', border: `1px solid ${t === 'expense' ? '#fecaca' : '#86efac'}` }
                    : { color: '#9ca3af' }}
                >
                  {t === 'expense' ? '↓ Kiadás' : '↑ Bevétel'}
                </button>
              ))}
            </div>

            {/* Amount + camera */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-500 text-xs">Összeg (Ft)</label>
                <div className="flex gap-1.5">
                  <button onClick={() => setShowCamera(true)} disabled={analyzing} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-transform disabled:opacity-50" style={{ background: '#f0fdf4', color: '#1a9460', border: '1px solid #86efac' }}>
                    <Camera size={12} />
                    {analyzing ? 'Elemzés...' : 'Blokk fotó'}
                  </button>
                  <button onClick={() => galleryRef.current?.click()} disabled={analyzing} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium active:scale-95 transition-transform disabled:opacity-50" style={{ background: '#f0fdf4', color: '#1a9460', border: '1px solid #86efac' }}>
                    <Image size={12} />
                  </button>
                </div>
                <input key={`gal-${fileInputKey}`} ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageCapture(f) }} />
              </div>
              <input type="number" inputMode="numeric" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full text-4xl font-bold text-gray-900 bg-transparent pb-2 focus:outline-none" style={{ borderBottom: '2px solid #1a9460' }} />
              {scanError && (
                <div className="mt-2 px-3 py-2 rounded-xl text-sm font-medium text-red-700" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  {scanError}
                </div>
              )}
            </div>

            {/* Category */}
            {type === 'expense' && (
              <div className="mb-5">
                <label className="text-gray-500 text-xs mb-2 block">Kategória</label>
                <div className="grid grid-cols-4 gap-2">
                  {allCats.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-2xl text-xs transition-all active:scale-95"
                      style={category === cat.id
                        ? { background: `${cat.color}18`, border: `1px solid ${cat.color}40`, color: cat.color }
                        : { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#9ca3af' }}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="leading-tight text-center">{cat.label}</span>
                    </button>
                  ))}

                  {/* + Új kategória gomb */}
                  <button
                    onClick={() => setShowAddCat((v) => !v)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-2xl text-xs transition-all active:scale-95"
                    style={{ background: showAddCat ? '#f0fdf4' : '#f9fafb', border: showAddCat ? '1px solid #86efac' : '1px dashed #d1d5db', color: showAddCat ? '#1a9460' : '#9ca3af' }}
                  >
                    <Plus size={20} />
                    <span className="leading-tight text-center">Új</span>
                  </button>
                </div>

                {/* Inline form új kategóriához */}
                {showAddCat && (
                  <div className="mt-3 p-4 rounded-2xl space-y-3" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <div className="flex gap-2">
                      <div className="w-16">
                        <label className="text-gray-400 text-[10px] mb-1 block">Ikon</label>
                        <input
                          type="text"
                          value={newCatIcon}
                          onChange={(e) => setNewCatIcon(e.target.value.slice(-2) || '📁')}
                          className="w-full text-center text-xl rounded-xl py-2 focus:outline-none"
                          style={inputStyle}
                          maxLength={2}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-gray-400 text-[10px] mb-1 block">Név</label>
                        <input
                          type="text"
                          value={newCatLabel}
                          onChange={(e) => setNewCatLabel(e.target.value)}
                          placeholder="pl. Hobbi"
                          maxLength={16}
                          className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {CAT_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setNewCatColor(c)}
                          className="w-7 h-7 rounded-full transition-transform active:scale-90"
                          style={{ background: c, outline: newCatColor === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddCat(false)} className="flex-1 rounded-xl py-2 text-xs text-gray-500 font-medium" style={{ background: '#f3f4f6' }}>
                        Mégse
                      </button>
                      <button
                        onClick={handleAddCategory}
                        disabled={!newCatLabel.trim() || addingCat}
                        className="flex-1 rounded-xl py-2 text-xs text-white font-semibold disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)' }}
                      >
                        {addingCat ? '...' : 'Hozzáadás'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-5">
              <label className="text-gray-500 text-xs mb-1 block">Leírás (opcionális)</label>
              <input type="text" placeholder={type === 'expense' ? 'pl. Tesco bevásárlás' : 'pl. Fizetés'} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
            </div>

            {/* Date */}
            <div className="mb-6">
              <label className="text-gray-500 text-xs mb-1 block">Dátum</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!amount || !currentUserId || !householdId}
              className="w-full rounded-2xl py-4 font-semibold text-base text-white disabled:opacity-30 active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)', boxShadow: '0 6px 20px rgba(26,148,96,0.35)' }}
            >
              Mentés
            </button>
          </>
        )}
      </div>
    </div>

    {showCamera && (
      <CameraCapture
        onCapture={(file) => { setShowCamera(false); handleImageCapture(file) }}
        onClose={() => setShowCamera(false)}
      />
    )}
  </>
  )
}

async function compressImage(file: File, maxPx = 1280, quality = 0.85): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const tryBitmap = async () => {
    const bmp = await Promise.race([
      createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
    ])
    const scale = Math.min(1, maxPx / Math.max(bmp.width, bmp.height))
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    bmp.close()
  }

  const tryImg = () =>
    new Promise<void>((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new window.Image()
      const t = setTimeout(() => { URL.revokeObjectURL(url); reject(new Error('Kép betöltés időtúllépés')) }, 8000)
      img.onload = () => {
        clearTimeout(t)
        URL.revokeObjectURL(url)
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve()
      }
      img.onerror = () => { clearTimeout(t); URL.revokeObjectURL(url); reject(new Error('Nem sikerült betölteni a képet')) }
      img.src = url
    })

  try {
    await tryBitmap()
  } catch {
    await tryImg()
  }

  return canvas.toDataURL('image/jpeg', quality).split(',')[1]
}
