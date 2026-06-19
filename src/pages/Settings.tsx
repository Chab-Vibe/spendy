import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Copy, Check, Share2, LogOut, ArrowLeft,
  UserMinus, AlertTriangle, Trash2, Plus, X,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import {
  updateProfile, getHouseholdInviteCode, getHouseholdProfiles,
  addCustomCategory, deleteCustomCategory, getCustomCategories,
} from '../api/storage'

const COLORS = [
  '#a78bfa', '#34d399', '#f87171', '#fbbf24',
  '#60a5fa', '#f472b6', '#fb923c', '#c084fc',
  '#1a9460', '#06b6d4',
]

const CAT_COLORS = ['#22C55E', '#3B82F6', '#F97316', '#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4', '#EF4444']

const card = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
}

const inputStyle = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  color: '#111827',
}

type ConfirmAction =
  | { type: 'remove'; userId: string; name: string }
  | { type: 'new-household' }
  | { type: 'delete-account' }
  | null

export default function Settings() {
  const navigate = useNavigate()
  const { users, currentUserId, householdId, allHouseholds, setUsers, bumpData, customCategories, setCustomCategories } = useStore()
  const me = users.find((u) => u.id === currentUserId) ?? null

  // Profil
  const [name, setName] = useState(me?.name ?? '')
  const [color, setColor] = useState(me?.color ?? COLORS[0])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Meghívó — háztartásonként
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [selectedInviteHId, setSelectedInviteHId] = useState<string | null>(householdId)
  const [copied, setCopied] = useState(false)

  // A megjelenített invite code: ha allHouseholds betöltött, abból; egyébként fallback
  const inviteCodeToShow = allHouseholds.length > 0
    ? (allHouseholds.find((h) => h.id === selectedInviteHId)?.invite_code ?? null)
    : inviteCode

  // Jelszó
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)

  // Megerősítő modal
  const [confirm, setConfirm] = useState<ConfirmAction>(null)
  const [newHouseholdName, setNewHouseholdName] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  // Új kategória
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatIcon, setNewCatIcon] = useState('📁')
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatColor, setNewCatColor] = useState(CAT_COLORS[0])
  const [addingCat, setAddingCat] = useState(false)

  useEffect(() => {
    if (householdId) getHouseholdInviteCode(householdId).then(setInviteCode)
  }, [householdId])

  async function handleSave() {
    if (!me || !name.trim()) return
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await updateProfile(me.id, name.trim(), color)
      setUsers(users.map((u) => u.id === me.id ? { ...u, name: name.trim(), color } : u))
      bumpData()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Hiba történt.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange() {
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordError('A jelszavak nem egyeznek.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('A jelszó legalább 6 karakter legyen.')
      return
    }
    setPasswordSaving(true)
    setPasswordError('')
    setPasswordSaved(false)
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPassword })
      if (err) throw err
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSaved(true)
      setTimeout(() => setPasswordSaved(false), 2000)
    } catch (err: unknown) {
      setPasswordError((err as Error).message ?? 'Hiba történt.')
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleConfirm() {
    if (!confirm) return
    setActionLoading(true)
    setActionError('')
    try {
      if (confirm.type === 'remove') {
        const { error: err } = await supabase.rpc('remove_household_member', { p_member_id: confirm.userId })
        if (err) throw err
        if (householdId) {
          const members = await getHouseholdProfiles(householdId)
          setUsers(members)
          bumpData()
        }
        setConfirm(null)
      } else if (confirm.type === 'new-household') {
        const { data, error: err } = await supabase.rpc('create_household', {
          p_name: me?.name ?? 'Én',
          p_color: me?.color ?? COLORS[0],
          p_household_name: newHouseholdName.trim() || 'Háztartás',
        })
        if (err) throw err
        const result = data as { error?: string } | null
        if (result?.error) throw new Error(result.error)
        window.location.reload()
      } else if (confirm.type === 'delete-account') {
        const { error: err } = await supabase.rpc('delete_own_account')
        if (err) throw err
        await supabase.auth.signOut()
      }
    } catch (err: unknown) {
      setActionError((err as Error).message ?? 'Hiba történt.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCopy() {
    if (!inviteCodeToShow) return
    await navigator.clipboard.writeText(inviteCodeToShow)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    if (!inviteCodeToShow) return
    const hName = allHouseholds.find((h) => h.id === selectedInviteHId)?.name ?? 'Spendy'
    if (navigator.share) {
      await navigator.share({ title: 'Spendy meghívó', text: `Csatlakozz a „${hName}" háztartáshoz a Spendy-ben! Kód: ${inviteCodeToShow}` }).catch(() => {})
    } else {
      handleCopy()
    }
  }

  async function handleAddCategory() {
    if (!newCatLabel.trim() || !householdId) return
    setAddingCat(true)
    try {
      await addCustomCategory(householdId, newCatLabel.trim(), newCatIcon, newCatColor)
      const cats = await getCustomCategories(householdId)
      setCustomCategories(cats)
      setShowAddCat(false)
      setNewCatLabel('')
      setNewCatIcon('📁')
      setNewCatColor(CAT_COLORS[0])
    } catch (err: unknown) {
      setActionError((err as Error).message ?? 'Hiba.')
    } finally {
      setAddingCat(false)
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      await deleteCustomCategory(id)
      setCustomCategories(customCategories.filter((c) => c.id !== id))
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-dvh px-4 pt-14 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl text-gray-400 active:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Beállítások</h1>
      </div>

      {/* Saját adatok */}
      <section className="mb-6">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Saját adataim</p>
        <div className="rounded-2xl p-5 space-y-5" style={card}>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block">Megjelenített név</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-2 block">Szín</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}>
                  {color === c && <Check size={13} color="white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button onClick={handleSave} disabled={saving || !name.trim()} className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-40 active:scale-95 transition-all" style={{ background: saved ? '#16a34a' : 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)', boxShadow: '0 4px 16px rgba(26,148,96,0.25)' }}>
            {saving ? '...' : saved ? '✓ Mentve' : 'Mentés'}
          </button>
        </div>
      </section>

      {/* Háztartás tagjai */}
      <section className="mb-6">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Háztartás tagjai</p>
        <div className="rounded-2xl overflow-hidden" style={card}>
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: u.color }}>
                {u.name[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-800 flex-1">{u.name}</span>
              {u.id === currentUserId ? (
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">te</span>
              ) : (
                <button onClick={() => setConfirm({ type: 'remove', userId: u.id, name: u.name })} className="p-1.5 rounded-lg text-gray-300 active:bg-red-50 active:text-red-400 transition-colors">
                  <UserMinus size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Társ meghívása */}
      <section className="mb-6">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Társ meghívása</p>
        <div className="rounded-2xl p-5" style={card}>
          {/* Háztartásválasztó — csak ha több van */}
          {allHouseholds.length > 1 && (
            <div className="mb-4">
              <label className="text-gray-500 text-xs mb-2 block">Melyik háztartásba hívod?</label>
              <div className="flex gap-2 flex-wrap">
                {allHouseholds.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => { setSelectedInviteHId(h.id); setCopied(false) }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
                    style={selectedInviteHId === h.id
                      ? { background: '#1a9460', color: '#fff' }
                      : { background: '#f0fdf4', color: '#1a9460', border: '1px solid #bbf7d0' }}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="text-gray-500 text-xs leading-relaxed mb-4">
            Küldd el ezt a kódot a társadnak — ő a <span className="font-semibold text-gray-700">Csatlakozás</span> opcióval tud belépni.
          </p>
          {inviteCodeToShow ? (
            <>
              <div className="flex items-center justify-center rounded-xl py-4 mb-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <span className="font-mono text-2xl font-bold text-gray-900 tracking-[0.25em]">{inviteCodeToShow}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold active:scale-95 transition-transform" style={{ background: '#f0fdf4', color: '#1a9460', border: '1px solid #bbf7d0' }}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Másolva!' : 'Másolás'}
                </button>
                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white active:scale-95 transition-transform" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)', boxShadow: '0 4px 16px rgba(26,148,96,0.25)' }}>
                  <Share2 size={15} /> Megosztás
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-2">Betöltés...</p>
          )}
        </div>
      </section>

      {/* Kategóriák */}
      <section className="mb-6">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Egyedi kategóriák</p>
        <div className="rounded-2xl overflow-hidden" style={card}>
          {customCategories.length === 0 && !showAddCat && (
            <p className="text-gray-400 text-sm text-center py-4">Még nincs egyedi kategória.</p>
          )}
          {customCategories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0" style={{ background: `${cat.color}20` }}>
                {cat.icon}
              </div>
              <span className="text-sm text-gray-800 flex-1">{cat.label}</span>
              <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 rounded-lg text-gray-300 active:bg-red-50 active:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Inline form */}
          {showAddCat && (
            <div className="px-4 py-4 border-t border-gray-50 space-y-3">
              <div className="flex gap-2">
                <div className="w-14">
                  <label className="text-gray-400 text-[10px] mb-1 block">Ikon</label>
                  <input type="text" value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value.slice(-2) || '📁')} className="w-full text-center text-lg rounded-xl py-2 focus:outline-none" style={inputStyle} maxLength={2} />
                </div>
                <div className="flex-1">
                  <label className="text-gray-400 text-[10px] mb-1 block">Név</label>
                  <input type="text" value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)} placeholder="pl. Hobbi" maxLength={16} className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none" style={inputStyle} />
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {CAT_COLORS.map((c) => (
                  <button key={c} onClick={() => setNewCatColor(c)} className="w-7 h-7 rounded-full transition-transform active:scale-90" style={{ background: c, outline: newCatColor === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddCat(false)} className="flex-1 rounded-xl py-2 text-xs text-gray-500 font-medium" style={{ background: '#f3f4f6' }}>Mégse</button>
                <button onClick={handleAddCategory} disabled={!newCatLabel.trim() || addingCat} className="flex-1 rounded-xl py-2 text-xs text-white font-semibold disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)' }}>
                  {addingCat ? '...' : 'Hozzáadás'}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowAddCat((v) => !v)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-t border-gray-50"
            style={{ color: showAddCat ? '#9ca3af' : '#1a9460' }}
          >
            {showAddCat ? <X size={14} /> : <Plus size={14} />}
            {showAddCat ? 'Bezárás' : 'Új kategória'}
          </button>
        </div>
      </section>

      {/* Jelszó módosítása */}
      <section className="mb-6">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Jelszó módosítása</p>
        <div className="rounded-2xl p-5 space-y-4" style={card}>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block">Új jelszó</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Legalább 6 karakter" className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block">Jelszó megerősítése</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Írd be még egyszer" className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none" style={inputStyle} />
          </div>
          {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
          <button onClick={handlePasswordChange} disabled={passwordSaving || !newPassword || !confirmPassword} className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-40 active:scale-95 transition-all" style={{ background: passwordSaved ? '#16a34a' : 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)', boxShadow: '0 4px 16px rgba(26,148,96,0.25)' }}>
            {passwordSaving ? '...' : passwordSaved ? '✓ Jelszó mentve' : 'Jelszó módosítása'}
          </button>
        </div>
      </section>

      {/* Háztartás */}
      <section className="mb-6">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Háztartás</p>
        <div className="rounded-2xl overflow-hidden" style={card}>
          <button onClick={() => { setNewHouseholdName(''); setConfirm({ type: 'new-household' }) }} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 active:bg-gray-50 transition-colors">
            <Plus size={16} className="text-gray-400" />
            <span>Új háztartás létrehozása</span>
          </button>
        </div>
      </section>

      {/* Fiók */}
      <section>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Fiók</p>
        <div className="rounded-2xl overflow-hidden" style={card}>
          <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 text-sm active:bg-red-50 transition-colors border-b border-gray-50">
            <LogOut size={16} /><span>Kijelentkezés</span>
          </button>
          <button onClick={() => setConfirm({ type: 'delete-account' })} className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 text-sm active:bg-red-50 transition-colors">
            <Trash2 size={16} /><span>Fiók törlése</span>
          </button>
        </div>
      </section>

      {/* Megerősítő modal */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setConfirm(null); setActionError('') } }}
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        >
          <div className="w-full max-w-sm rounded-3xl p-6 space-y-4" style={{ background: '#ffffff', boxShadow: '0 16px 64px rgba(0,0,0,0.2)' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">
                  {confirm.type === 'remove' && `${confirm.name} eltávolítása`}
                  {confirm.type === 'new-household' && 'Új háztartás létrehozása'}
                  {confirm.type === 'delete-account' && 'Fiók törlése'}
                </p>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  {confirm.type === 'remove' && `Eltávolítod ${confirm.name}-t a háztartásból.`}
                  {confirm.type === 'new-household' && 'Elhagyod a jelenlegi háztartást és teljesen újat hozol létre.'}
                  {confirm.type === 'delete-account' && 'Véglegesen törlöd a fiókodat. Ez nem visszavonható.'}
                </p>
                {confirm.type === 'new-household' && (
                  <input
                    type="text"
                    value={newHouseholdName}
                    onChange={(e) => setNewHouseholdName(e.target.value)}
                    placeholder="pl. Otthon, Munkahely"
                    maxLength={30}
                    autoFocus
                    className="w-full rounded-xl px-3 py-2 text-sm mt-3 focus:outline-none"
                    style={inputStyle}
                  />
                )}
              </div>
            </div>
            {actionError && <p className="text-red-500 text-xs">{actionError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setConfirm(null); setActionError('') }} disabled={actionLoading} className="flex-1 rounded-xl py-3 text-sm font-semibold text-gray-600 active:scale-95 transition-all" style={{ background: '#f3f4f6' }}>
                Mégse
              </button>
              <button
                onClick={handleConfirm}
                disabled={actionLoading || (confirm.type === 'new-household' && !newHouseholdName.trim())}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-white active:scale-95 transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
              >
                {actionLoading ? '...' : confirm.type === 'delete-account' ? 'Törlés' : 'Igen, folytatom'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
