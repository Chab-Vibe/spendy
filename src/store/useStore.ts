import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AppState {
  users: User[]
  currentUserId: string | null
  showAddModal: boolean
  dataVersion: number

  setUsers: (users: User[]) => void
  setCurrentUser: (id: string) => void
  setShowAddModal: (show: boolean) => void
  bumpData: () => void
  currentUser: () => User | null
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      showAddModal: false,
      dataVersion: 0,

      setUsers: (users) => set({ users }),
      setCurrentUser: (id) => set({ currentUserId: id }),
      setShowAddModal: (show) => set({ showAddModal: show }),
      bumpData: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
      currentUser: () => {
        const { users, currentUserId } = get()
        return users.find((u) => u.id === currentUserId) ?? null
      },
    }),
    {
      name: 'spendy_store',
      partialize: (s) => ({ users: s.users, currentUserId: s.currentUserId }),
    },
  ),
)
