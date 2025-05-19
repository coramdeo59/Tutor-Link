import { create } from 'zustand'
import { ParentService, ChildOverview } from '@/services/parent.service'

interface ParentDashboardState {
  children: ChildOverview[]
  loading: boolean
  error: string | null
  upcomingSessionsCount: number
  activeTutorsCount: number

  // Actions
  fetchDashboardData: (userId: number) => Promise<void>
  reset: () => void
}

export const useParentDashboardStore = create<ParentDashboardState>((set, get) => ({
  children: [],
  loading: true,
  error: null,
  upcomingSessionsCount: 0,
  activeTutorsCount: 3, // Hardcoded for now, would come from API

  fetchDashboardData: async (userId: number) => {
    try {
      set({ loading: true, error: null })
      const childrenData = await ParentService.getChildrenOverview(userId)
      
      // Calculate upcoming sessions
      const upcomingSessionsCount = childrenData.filter(child => child.nextSession).length
      
      set({ 
        children: childrenData,
        upcomingSessionsCount,
        loading: false 
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      set({ 
        error: 'Unable to load dashboard data. Please try again later.',
        loading: false 
      })
    }
  },

  reset: () => {
    set({
      children: [],
      loading: true,
      error: null,
      upcomingSessionsCount: 0,
    })
  }
}))
