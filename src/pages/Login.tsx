import { useState } from 'react'
import { supabase } from '../lib/supabase'
import SpendyLogo from '../components/SpendyLogo'

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
}

const inputStyle = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  color: '#111827',
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
          <div className="mb-4"><SpendyLogo size={80} /></div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Spendy</h1>
          <p className="text-gray-500 text-sm">Háztartási kiadáskövető</p>
        </div>

        <div className="rounded-3xl p-6" style={cardStyle}>
          {/* Mode toggle */}
          <div
            className="flex rounded-2xl p-1 mb-6"
            style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}
          >
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setInfo('') }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={
                  mode === m
                    ? { background: '#ffffff', color: '#111827', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
                    : { color: '#9ca3af' }
                }
              >
                {m === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-500 text-xs mb-1.5 block">Email</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1.5 block">Jelszó</label>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            {info && <p className="text-green-600 text-xs text-center">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-3.5 font-semibold text-sm text-white disabled:opacity-40 active:scale-95 transition-transform mt-2"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)',
                boxShadow: '0 6px 20px rgba(26,148,96,0.35)',
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
