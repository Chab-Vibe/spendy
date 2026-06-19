import { useState } from 'react'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabase'

export default function UserSwitcher() {
  const { users, currentUserId } = useStore()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const current = users.find((u) => u.id === currentUserId) ?? users[0]

  if (!current) return null

  async function handleLogout() {
    await supabase.auth.signOut()
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-95"
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <div className="w-5 h-5 rounded-full" style={{ background: current.color }} />
        <span className="text-gray-700 text-sm font-medium">{current.name}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute top-10 right-0 z-20 min-w-[160px] rounded-2xl overflow-hidden p-1.5"
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700"
                style={u.id === currentUserId ? { background: '#f0fdf4' } : {}}
              >
                <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: u.color }} />
                <span className="flex-1">{u.name}</span>
                {u.id === currentUserId && (
                  <span className="text-gray-400 text-xs">te</span>
                )}
              </div>
            ))}
            <div className="mx-2 my-1.5 h-px bg-gray-100" />
            <button
              onClick={() => { navigate('/settings'); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 transition-all active:scale-95"
            >
              <Settings size={14} className="text-gray-400" />
              <span>Beállítások</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 transition-all active:scale-95"
            >
              <LogOut size={14} />
              <span>Kijelentkezés</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
