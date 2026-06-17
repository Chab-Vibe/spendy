import { useState } from 'react'
import { supabase } from '../lib/supabase'

const COLORS = ['#a78bfa', '#34d399', '#f87171', '#fbbf24', '#60a5fa', '#f472b6', '#fb923c', '#c084fc']

const glass = {
  background: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255,255,255,0.18)',
}

const inputStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.18)',
}

type Mode = 'choose' | 'create' | 'join'

export default function Setup({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<Mode>('choose')
  const [name, setName] = useState('')
  const [color, setColor] = useState('#a78bfa')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!name.trim()) return
    setError('')
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('create_household', {
        p_name: name.trim(),
        p_color: color,
      })
      if (error) throw error
      const result = data as { success?: boolean; error?: string; invite_code?: string }
      if (result.error) throw new Error(result.error)
      onDone()
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Hiba történt.')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!name.trim() || !inviteCode.trim()) return
    setError('')
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('join_household', {
        p_invite_code: inviteCode.trim().toUpperCase(),
        p_name: name.trim(),
        p_color: color,
      })
      if (error) throw error
      const result = data as { success?: boolean; error?: string }
      if (result.error) throw new Error(result.error)
      onDone()
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Hiba történt.')
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'choose') {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-14">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="text-5xl mb-4">🏠</div>
            <h1 className="text-2xl font-bold text-white mb-2">Háztartás beállítás</h1>
            <p className="text-white/50 text-sm">Hozz létre egy háztartást, vagy csatlakozz egy meglévőhöz.</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full rounded-2xl p-5 text-left active:scale-98 transition-transform"
              style={glass}
            >
              <div className="text-2xl mb-2">✨</div>
              <p className="text-white font-semibold mb-1">Új háztartás</p>
              <p className="text-white/50 text-xs">Létrehozol egy háztartást és meghívod a párod.</p>
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full rounded-2xl p-5 text-left active:scale-98 transition-transform"
              style={glass}
            >
              <div className="text-2xl mb-2">🔗</div>
              <p className="text-white font-semibold mb-1">Csatlakozás</p>
              <p className="text-white/50 text-xs">Van egy meghívókódod a párodtól.</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-14">
      <div className="w-full max-w-sm">
        <button onClick={() => { setMode('choose'); setError('') }} className="text-white/50 text-sm mb-6 flex items-center gap-1">
          ← Vissza
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">
          {mode === 'create' ? 'Új háztartás' : 'Csatlakozás'}
        </h1>

        <div className="rounded-3xl p-6 space-y-5" style={glass}>
          {/* Name */}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">A te neved</label>
            <input
              type="text"
              placeholder="Pl. Bence"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          {/* Invite code (join only) */}
          {mode === 'join' && (
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Meghívókód</label>
              <input
                type="text"
                placeholder="pl. AB12CD"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none tracking-widest font-mono uppercase"
                style={inputStyle}
              />
            </div>
          )}

          {/* Color */}
          <div>
            <label className="text-white/50 text-xs mb-2 block">Szín</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-transform active:scale-90"
                  style={{
                    background: c,
                    outline: color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: '2px',
                    boxShadow: color === c ? `0 0 12px ${c}80` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            onClick={mode === 'create' ? handleCreate : handleJoin}
            disabled={loading || !name.trim() || (mode === 'join' && inviteCode.length < 6)}
            className="w-full rounded-2xl py-3.5 font-semibold text-sm text-white disabled:opacity-40 active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #5b21b6 100%)',
              boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
            }}
          >
            {loading ? '...' : mode === 'create' ? 'Háztartás létrehozása' : 'Csatlakozás'}
          </button>
        </div>

        {mode === 'create' && (
          <p className="text-white/30 text-xs text-center mt-4">
            A meghívókódot a beállítások menüben találod majd.
          </p>
        )}
      </div>
    </div>
  )
}
