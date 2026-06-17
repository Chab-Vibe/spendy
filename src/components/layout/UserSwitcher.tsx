import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useStore } from '../../store/useStore'

export default function UserSwitcher() {
  const { users, currentUserId, setCurrentUser } = useStore()
  const [open, setOpen] = useState(false)
  const current = users.find((u) => u.id === currentUserId) ?? users[0]

  if (!current) return null

  if (users.length === 1) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full border-2 border-white/30" style={{ background: current.color }} />
        <span className="text-white/80 text-sm font-medium">{current.name}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-95"
        style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <div className="w-5 h-5 rounded-full" style={{ background: current.color }} />
        <span className="text-white text-sm font-medium">{current.name}</span>
        <ChevronDown
          size={14}
          className={`text-white/70 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute top-10 left-0 z-20 min-w-[150px] rounded-2xl overflow-hidden p-1.5"
            style={{
              background: 'rgba(20,10,50,0.85)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            }}
          >
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setCurrentUser(u.id)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white transition-all active:scale-95"
                style={
                  u.id === currentUserId
                    ? { background: 'rgba(255,255,255,0.15)' }
                    : {}
                }
              >
                <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: u.color }} />
                <span className="flex-1 text-left">{u.name}</span>
                {u.id === currentUserId && <Check size={14} className="text-white/70" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
