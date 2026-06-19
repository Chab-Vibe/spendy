import { NavLink } from 'react-router-dom'
import { Home, BarChart2, RefreshCw, List, Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'

const leftLinks = [
  { to: '/', icon: Home, label: 'Főoldal' },
  { to: '/statistics', icon: BarChart2, label: 'Statisztika' },
]
const rightLinks = [
  { to: '/recurring', icon: RefreshCw, label: 'Rendszeres' },
  { to: '/transactions', icon: List, label: 'Tranzakciók' },
]

export default function BottomNav() {
  const setShowAddModal = useStore((s) => s.setShowAddModal)

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-4 pb-4 pt-2">
      <div
        className="flex items-end rounded-3xl px-2 py-2"
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
        }}
      >
        {leftLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-all ${
                isActive ? 'text-[#1a9460]' : 'text-gray-400'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Center + button */}
        <div className="flex-1 flex flex-col items-center pb-1">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform -mt-6"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #1a9460 100%)',
              boxShadow: '0 4px 20px rgba(26,148,96,0.5)',
            }}
            aria-label="Új tétel rögzítése"
          >
            <Plus size={26} className="text-white" strokeWidth={2.5} />
          </button>
          <span className="text-[10px] text-gray-400 mt-1 font-medium">Új tétel</span>
        </div>

        {rightLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-all ${
                isActive ? 'text-[#1a9460]' : 'text-gray-400'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
