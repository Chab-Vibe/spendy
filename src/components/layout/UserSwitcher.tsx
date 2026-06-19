import { useState } from 'react'
import { ChevronDown, LogOut, Settings, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabase'
import { getHouseholdProfiles, getCustomCategories, switchHousehold } from '../../api/storage'

export default function UserSwitcher() {
  const {
    users, currentUserId, householdId, allHouseholds,
    setUsers, setHouseholdId, setCustomCategories, bumpData,
  } = useStore()
  const [open, setOpen] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const navigate = useNavigate()
  const current = users.find((u) => u.id === currentUserId) ?? users[0]

  if (!current) return null

  async function handleSwitchHousehold(hid: string) {
    if (hid === householdId || switching) return
    setSwitching(hid)
    setOpen(false)
    try {
      await switchHousehold(hid)
      const [members, customCats] = await Promise.all([
        getHouseholdProfiles(hid),
        getCustomCategories(hid).catch(() => []),
      ])
      setUsers(members)
      setHouseholdId(hid)
      setCustomCategories(customCats)
      bumpData()
    } finally {
      setSwitching(null)
    }
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
        {switching && (
          <div className="w-3 h-3 rounded-full border-2 border-[#1a9460] border-t-transparent animate-spin" />
        )}
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
            className="absolute top-10 right-0 z-20 min-w-[180px] rounded-2xl overflow-hidden p-1.5"
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            {/* Tagok */}
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

            {/* Háztartásváltó */}
            {allHouseholds.length > 0 && (
              <>
                <div className="mx-2 my-1.5 h-px bg-gray-100" />
                <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Háztartások
                </p>
                {allHouseholds.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleSwitchHousehold(h.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 transition-all active:scale-95"
                    style={h.id === householdId ? { background: '#f0fdf4' } : {}}
                  >
                    <Home size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="flex-1 text-left">{h.name}</span>
                    {h.id === householdId && (
                      <span className="text-[#1a9460] text-xs font-semibold">✓</span>
                    )}
                  </button>
                ))}
              </>
            )}

            <div className="mx-2 my-1.5 h-px bg-gray-100" />
            <button
              onClick={() => { navigate('/settings'); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 transition-all active:scale-95"
            >
              <Settings size={14} className="text-gray-400" />
              <span>Beállítások</span>
            </button>
            <button
              onClick={() => { supabase.auth.signOut(); setOpen(false) }}
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
