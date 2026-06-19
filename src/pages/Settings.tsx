import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, Share2, LogOut, ArrowLeft } from 'lucide-react'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { updateProfile, getHouseholdInviteCode } from '../api/storage'

const COLORS = [
  '#a78bfa', '#34d399', '#f87171', '#fbbf24',
  '#60a5fa', '#f472b6', '#fb923c', '#c084fc',
  '#1a9460', '#06b6d4',
]

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

export default function Settings() {
  const navigate = useNavigate()
  const { users, currentUserId, householdId, setUsers, bumpData } = useStore()
  const me = users.find((u) => u.id === currentUserId) ?? null

  const [name, setName] = useState(me?.name ?? '')
  const [color, setColor] = useState(me?.color ?? COLORS[0])
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

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

  async function handleCopy() {
    if (!inviteCode) return
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    if (!inviteCode) return
    if (navigator.share) {
      await navigator.share({
        title: 'Spendy meghívó',
        text: `Csatlakozz a Spendy háztartásomhoz! Kód: ${inviteCode}`,
      }).catch(() => {})
    } else {
      handleCopy()
    }
  }

  return (
    <div className="min-h-dvh px-4 pt-14 pb-32">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-gray-400 active:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Beállítások</h1>
      </div>

      {/* Saját adatok */}
      <section className="mb-6">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
          Saját adataim
        </p>
        <div className="rounded-2xl p-5 space-y-5" style={card}>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block">Megjelenített név</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="text-gray-500 text-xs mb-2 block">Szín</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                  style={{
                    background: c,
                    outline: color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                >
                  {color === c && <Check size={13} color="white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-40 active:scale-95 transition-all"
            style={{
              background: saved
                ? '#16a34a'
                : 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)',
              boxShadow: '0 4px 16px rgba(26,148,96,0.25)',
            }}
          >
            {saving ? '...' : saved ? '✓ Mentve' : 'Mentés'}
          </button>
        </div>
      </section>

      {/* Háztartás tagjai */}
      <section className="mb-6">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
          Háztartás tagjai
        </p>
        <div className="rounded-2xl overflow-hidden" style={card}>
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0"
            >
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ background: u.color }}
              >
                {u.name[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-800 flex-1">{u.name}</span>
              {u.id === currentUserId && (
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                  te
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Társ meghívása */}
      <section className="mb-6">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
          Társ meghívása
        </p>
        <div className="rounded-2xl p-5" style={card}>
          <p className="text-gray-500 text-xs leading-relaxed mb-4">
            Küldd el ezt a kódot a társadnak — ő a{' '}
            <span className="font-semibold text-gray-700">Csatlakozás</span> opcióval tud belépni a Spendy-be.
          </p>
          {inviteCode ? (
            <>
              <div
                className="flex items-center justify-center rounded-xl py-4 mb-4"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
              >
                <span className="font-mono text-2xl font-bold text-gray-900 tracking-[0.25em]">
                  {inviteCode}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold active:scale-95 transition-transform"
                  style={{ background: '#f0fdf4', color: '#1a9460', border: '1px solid #bbf7d0' }}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Másolva!' : 'Másolás'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white active:scale-95 transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)',
                    boxShadow: '0 4px 16px rgba(26,148,96,0.25)',
                  }}
                >
                  <Share2 size={15} />
                  Megosztás
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-2">Betöltés...</p>
          )}
        </div>
      </section>

      {/* Kijelentkezés */}
      <section>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
          Fiók
        </p>
        <div className="rounded-2xl overflow-hidden" style={card}>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 text-sm active:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            <span>Kijelentkezés</span>
          </button>
        </div>
      </section>
    </div>
  )
}
