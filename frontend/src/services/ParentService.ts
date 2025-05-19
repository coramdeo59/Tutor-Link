import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  grade: string;
  progress: number;
  nextSession?: {
    date: string;
    time: string;
    subject: string;
  };
}

interface Transaction {
  tutor: string;
  subject: string;
  amount: number;
  date: string;
}

interface DashboardData {
  children: Child[];
  activeTutors: number;
  totalUpcomingSessions: number;
  monthlySpending: number;
  upcomingPayment?: {
    amount: number;
    dueDate: string;
  };
  recentTransactions: Transaction[];
}

export const ParentService = {
  /**
   * Get dashboard data for a parent user
   * @param parentId - The ID of the parent user
   * @returns Dashboard data including children, sessions, and payment info
   */
  getChildrenDashboardData: async (parentId: string): Promise<DashboardData> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(`${API_URL}/users/parent/${parentId}/dashboard/children`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching parent dashboard data:', error);
      
      // Return mock data if API request fails
      return {
        children: [
          {
            id: 'child1',
            firstName: 'Emma',
            lastName: 'Smith',
            age: 14,
            grade: '9th Grade',
            progress: 72,
            nextSession: {
              date: 'Today',
              time: '4:00 PM',
              subject: 'Mathematics'
            }
          },
          {
            id: 'child2',
            firstName: 'Jack',
            lastName: 'Smith',
            age: 10,
            grade: '5th Grade',
            progress: 85,
            nextSession: {
              date: 'Tomorrow',
              time: '3:30 PM',
              subject: 'English'
            }
          }
        ],
        activeTutors: 3,
        totalUpcomingSessions: 5,
        monthlySpending: 320,
        upcomingPayment: {
          amount: 120,
          dueDate: '2025-05-15'
        },
        recentTransactions: [
          { tutor: 'Mr. Johnson', subject: 'Mathematics', amount: 80, date: '2025-05-05' },
          { tutor: 'Ms. Williams', subject: 'Science', amount: 80, date: '2025-05-03' },
          { tutor: 'Mr. Davis', subject: 'English', amount: 80, date: '2025-04-28' }
        ]
      };
    }
  },

  /**
   * Add a child to parent's account
   * @param parentId - The ID of the parent user
   * @param childData - Child data to be added
   * @returns The created child object
   */
  addChild: async (parentId: string, childData: any) => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.post(
      `${API_URL}/users/parent/${parentId}/children`, 
      childData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    return response.data;
  },

  /**
   * Get scheduled sessions for parent's children
   * @param parentId - The ID of the parent user
   * @returns List of scheduled sessions
   */
  getScheduledSessions: async (parentId: string) => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.get(
      `${API_URL}/scheduler/sessions/parent/${parentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    return response.data;
  }
};
