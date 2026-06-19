import { create } from 'zustand'
import type { User, CustomCategory, HouseholdInfo } from '../types'

interface AppState {
  users: User[]
  currentUserId: string | null
  householdId: string | null
  allHouseholds: HouseholdInfo[]
  customCategories: CustomCategory[]
  showAddModal: boolean
  dataVersion: number

  setUsers: (users: User[]) => void
  setCurrentUser: (id: string) => void
  setHouseholdId: (id: string | null) => void
  setAllHouseholds: (h: HouseholdInfo[]) => void
  setCustomCategories: (cats: CustomCategory[]) => void
  setShowAddModal: (show: boolean) => void
  bumpData: () => void
  currentUser: () => User | null
}

export const useStore = create<AppState>()((set, get) => ({
  users: [],
  currentUserId: null,
  householdId: null,
  allHouseholds: [],
  customCategories: [],
  showAddModal: false,
  dataVersion: 0,

  setUsers: (users) => set({ users }),
  setCurrentUser: (id) => set({ currentUserId: id }),
  setHouseholdId: (id) => set({ householdId: id }),
  setAllHouseholds: (h) => set({ allHouseholds: h }),
  setCustomCategories: (cats) => set({ customCategories: cats }),
  setShowAddModal: (show) => set({ showAddModal: show }),
  bumpData: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
  currentUser: () => {
    const { users, currentUserId } = get()
    return users.find((u) => u.id === currentUserId) ?? null
  },
}))
