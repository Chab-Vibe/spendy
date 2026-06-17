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

const activeClass = 'text-white'
const inactiveClass = 'text-white/40'

export default function BottomNav() {
  const setShowAddModal = useStore((s) => s.setShowAddModal)

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-4 pb-4 pt-2">
      <div
        className="flex items-end rounded-3xl px-2 py-2"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* Left links */}
        {leftLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-all ${
                isActive ? activeClass : inactiveClass
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
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #5b21b6 100%)',
              boxShadow: '0 4px 24px rgba(124,58,237,0.6), 0 0 0 2px rgba(255,255,255,0.2)',
            }}
            aria-label="Új tétel rögzítése"
          >
            <Plus size={26} className="text-white" strokeWidth={2.5} />
          </button>
          <span className="text-[10px] text-white/40 mt-1 font-medium">Új tétel</span>
        </div>

        {/* Right links */}
        {rightLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-all ${
                isActive ? activeClass : inactiveClass
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
