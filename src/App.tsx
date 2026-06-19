import { useEffect, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { useStore } from './store/useStore'
import { getHouseholdProfiles } from './api/storage'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Home from './pages/Home'
import Statistics from './pages/Statistics'
import Transactions from './pages/Transactions'
import Recurring from './pages/Recurring'
import Settings from './pages/Settings'
import BottomNav from './components/layout/BottomNav'
import AddTransactionModal from './components/transactions/AddTransactionModal'

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const { setUsers, setCurrentUser, setHouseholdId, showAddModal, householdId } = useStore()

  const loadProfile = useCallback(async (s: Session) => {
    setProfileLoaded(false)
    const { data } = await supabase
      .from('profiles')
      .select('id, name, color, household_id')
      .eq('id', s.user.id)
      .single()

    if (data?.household_id) {
      const hid = data.household_id as string
      setHouseholdId(hid)
      setCurrentUser(data.id as string)
      const members = await getHouseholdProfiles(hid)
      setUsers(members)
    } else {
      setHouseholdId(null)
    }
    setProfileLoaded(true)
  }, [setHouseholdId, setCurrentUser, setUsers])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) loadProfile(data.session)
      else setProfileLoaded(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) {
        loadProfile(s)
      } else {
        setProfileLoaded(true)
        setHouseholdId(null)
        setUsers([])
      }
    })
    return () => subscription.unsubscribe()
  }, [loadProfile])

  // Loading
  if (session === undefined || !profileLoaded) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-white/40 text-sm">Betöltés...</div>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    )
  }

  // Authenticated but no household → setup
  if (!householdId) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Setup onDone={() => loadProfile(session)} />} />
        </Routes>
      </BrowserRouter>
    )
  }

  // Fully set up → main app
  return (
    <BrowserRouter>
      <div className="relative min-h-dvh pb-28">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/recurring" element={<Recurring />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
        {showAddModal && <AddTransactionModal />}
      </div>
    </BrowserRouter>
  )
}
