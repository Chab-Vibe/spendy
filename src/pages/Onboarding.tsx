import { useState } from 'react'
import { useStore } from '../store/useStore'
import type { User } from '../types'

const COLORS = ['#a78bfa', '#34d399', '#f87171', '#fbbf24', '#60a5fa', '#f472b6', '#fb923c', '#c084fc']

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
}

function UserSetup({
  index,
  value,
  onChange,
}: {
  index: number
  value: { name: string; color: string }
  onChange: (v: { name: string; color: string }) => void
}) {
  const initial = value.name[0]?.toUpperCase() || String(index + 1)
  return (
    <div className="rounded-3xl p-5" style={cardStyle}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ background: value.color, boxShadow: `0 4px 16px ${value.color}60` }}
        >
          {initial}
        </div>
        <h3 className="font-semibold text-gray-800">{index + 1}. felhasználó</h3>
        {index === 1 && (
          <span className="ml-auto text-gray-400 text-xs">opcionális</span>
        )}
      </div>
      <input
        type="text"
        placeholder={index === 0 ? 'Pl. Bence' : 'Pl. Réka'}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        className="w-full rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none"
        style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }}
        maxLength={20}
      />
      <div className="flex gap-2 flex-wrap">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange({ ...value, color })}
            className="w-8 h-8 rounded-full transition-transform active:scale-90"
            style={{
              background: color,
              outline: value.color === color ? `3px solid ${color}` : 'none',
              outlineOffset: '2px',
              boxShadow: value.color === color ? `0 0 12px ${color}80` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function Onboarding() {
  const { setUsers, setCurrentUser } = useStore()
  const [u1, setU1] = useState({ name: '', color: '#a78bfa' })
  const [u2, setU2] = useState({ name: '', color: '#34d399' })

  function handleStart() {
    if (!u1.name.trim()) return
    const users: User[] = [
      { id: crypto.randomUUID(), name: u1.name.trim(), color: u1.color },
      ...(u2.name.trim()
        ? [{ id: crypto.randomUUID(), name: u2.name.trim(), color: u2.color }]
        : []),
    ]
    setUsers(users)
    setCurrentUser(users[0].id)
  }

  return (
    <div className="min-h-dvh flex flex-col px-5 py-14">
      <div className="mb-8">
        <div className="text-5xl mb-5">💸</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Spendy</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Kiadás-bevétel követő. Először állítsuk be, ki fogja használni!
        </p>
      </div>

      <div className="space-y-4 flex-1">
        <UserSetup index={0} value={u1} onChange={setU1} />
        <UserSetup index={1} value={u2} onChange={setU2} />
      </div>

      <button
        onClick={handleStart}
        disabled={!u1.name.trim()}
        className="mt-8 w-full rounded-2xl py-4 font-semibold text-base text-white disabled:opacity-30 active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)',
          boxShadow: '0 8px 32px rgba(26,148,96,0.4)',
        }}
      >
        Kezdjük el!
      </button>
    </div>
  )
}
