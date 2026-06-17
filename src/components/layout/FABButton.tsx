import { Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'

export default function FABButton() {
  const setShowAddModal = useStore((s) => s.setShowAddModal)

  return (
    <button
      onClick={() => setShowAddModal(true)}
      className="fixed bottom-20 right-4 w-14 h-14 bg-[#5B4FCF] rounded-full shadow-xl flex items-center justify-center z-50 active:scale-95 transition-transform"
      aria-label="Új tétel rögzítése"
    >
      <Plus size={28} className="text-white" strokeWidth={2.5} />
    </button>
  )
}
