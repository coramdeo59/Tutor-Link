import { create } from 'zustand'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Interface definitions
interface Child {
  childId: number
  firstName: string
  lastName: string
  username: string
  photo?: string
  dateOfBirth?: string
  gradeLevelId?: number
  overallProgress?: number
  gradeName?: string
}

interface NextSession {
  sessionId: number
  tutorId: number
  tutorName: string
  subject: string
  date: string
  time: string
}

interface ChildWithDetails extends Child {
  age?: number
  nextSession?: NextSession
}

interface ParentDashboardState {
  parent: {
    parentId: number
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    photo?: string
    city?: string
    state?: string
  } | null
  children: ChildWithDetails[]
  upcomingSessionsCount: number
  activeTutorsCount: number
  loading: boolean
  error: string | null
  fetchDashboardData: (parentId: number) => Promise<void>
  reset: () => void
}

export const useParentDashboardStore = create<ParentDashboardState>((set) => ({
  parent: null,
  children: [],
  upcomingSessionsCount: 0,
  activeTutorsCount: 0,
  loading: false,
  error: null,

  fetchDashboardData: async (parentId: number) => {
    try {
      set({ loading: true, error: null })
      
      // Get token from localStorage
      const token = localStorage.getItem('accessToken')
      
      // Set up headers with authentication
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // In a production app, we would fetch both parent data and children data:
      // const parentResponse = await axios.get(`${API_URL}/users/parent/${parentId}`, { headers })
      // const childrenResponse = await axios.get(`${API_URL}/users/parent/${parentId}/children`, { headers })
      
      // For now, using mock data that matches the backend schema
      const mockParent = {
        parentId: parentId,
        firstName: "Ayana",
        lastName: "Mekonnen",
        email: "ayana@example.com",
        phoneNumber: "+251912345678",
        photo: "https://randomuser.me/api/portraits/women/25.jpg",
        city: "Addis Ababa",
        state: "Addis Ababa",
      }
      
      const mockChildren = [
        {
          childId: 1,
          firstName: "Melkamu",
          lastName: "Elias",
          username: "melkamu",
          photo: "https://randomuser.me/api/portraits/kids/1.jpg",
          dateOfBirth: "2012-05-15",
          gradeLevelId: 8,
          gradeName: "8th Grade",
          overallProgress: 72,
          age: 13,
          nextSession: {
            sessionId: 101,
            tutorId: 201,
            tutorName: "Ms. Johnson",
            subject: "Mathematics",
            date: "Today",
            time: "4:00 PM"
          }
        },
        {
          childId: 2,
          firstName: "Abebe",
          lastName: "Kebede",
          username: "abebe",
          photo: "https://randomuser.me/api/portraits/kids/2.jpg",
          dateOfBirth: "2015-08-22",
          gradeLevelId: 5,
          gradeName: "5th Grade",
          overallProgress: 85,
          age: 10,
          nextSession: {
            sessionId: 102,
            tutorId: 202,
            tutorName: "Mr. Davis",
            subject: "English",
            date: "Tomorrow",
            time: "3:30 PM"
          }
        },
        {
          childId: 3,
          firstName: "Sara",
          lastName: "Mohammed",
          username: "sara",
          photo: "https://randomuser.me/api/portraits/kids/3.jpg",
          dateOfBirth: "2016-02-10",
          gradeLevelId: 4,
          gradeName: "4th Grade",
          overallProgress: 68,
          age: 9,
          nextSession: null
        }
      ]

      // Calculate upcoming sessions
      const upcomingSessions = mockChildren.filter(child => child.nextSession).length
      const activeTutors = 3 // In a real app, this would be calculated from the data
      
      set({ 
        parent: mockParent,
        children: mockChildren,
        upcomingSessionsCount: upcomingSessions,
        activeTutorsCount: activeTutors,
        loading: false 
      })
    } catch (err: any) {
      console.error('Error fetching parent dashboard data:', err)
      set({ 
        error: err.response?.data?.message || 'Failed to load dashboard data',
        loading: false 
      })
    }
  },

  reset: () => {
    set({
      parent: null,
      children: [],
      upcomingSessionsCount: 0,
      activeTutorsCount: 0,
      loading: false,
      error: null,
    })
  }
}))
