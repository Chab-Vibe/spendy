import { useState } from 'react'
import { supabase } from '../lib/supabase'

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

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Erősítsd meg az email-t, majd jelentkezz be!')
        setMode('login')
      }
    } catch (err: unknown) {
      const e = err as { message?: string }
      if (e.message?.includes('Invalid login credentials')) {
        setError('Hibás email vagy jelszó.')
      } else if (e.message?.includes('User already registered')) {
        setError('Ez az email már regisztrálva van.')
      } else if (e.message?.includes('Password should be')) {
        setError('A jelszó legalább 6 karakter legyen.')
      } else {
        setError(e.message ?? 'Ismeretlen hiba.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-14">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="text-6xl mb-4" style={{ filter: 'drop-shadow(0 4px 16px rgba(167,139,250,0.5))' }}>
            💸
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Spendy</h1>
          <p className="text-white/50 text-sm">Háztartási kiadáskövető</p>
        </div>

        <div className="rounded-3xl p-6" style={glass}>
          {/* Mode toggle */}
          <div
            className="flex rounded-2xl p-1 mb-6"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setInfo('') }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={
                  mode === m
                    ? { background: 'rgba(255,255,255,0.2)', color: 'white' }
                    : { color: 'rgba(255,255,255,0.45)' }
                }
              >
                {m === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Jelszó</label>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}
            {info && (
              <p className="text-green-400 text-xs text-center">{info}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-3.5 font-semibold text-sm text-white disabled:opacity-40 active:scale-95 transition-transform mt-2"
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #5b21b6 100%)',
                boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
              }}
            >
              {loading ? '...' : mode === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
