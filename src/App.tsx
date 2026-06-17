import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Statistics from './pages/Statistics'
import Transactions from './pages/Transactions'
import Recurring from './pages/Recurring'
import BottomNav from './components/layout/BottomNav'
import AddTransactionModal from './components/transactions/AddTransactionModal'

export default function App() {
  const users = useStore((s) => s.users)
  const showAddModal = useStore((s) => s.showAddModal)
  const isOnboarded = users.length > 0

  return (
    <BrowserRouter>
      {!isOnboarded ? (
        <Routes>
          <Route path="*" element={<Onboarding />} />
        </Routes>
      ) : (
        <div className="relative min-h-dvh pb-28">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/recurring" element={<Recurring />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
          {showAddModal && <AddTransactionModal />}
        </div>
      )}
    </BrowserRouter>
  )
}
