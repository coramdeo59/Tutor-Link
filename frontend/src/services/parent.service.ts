import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Interface for next session data
export interface NextSession {
  sessionId: number;
  tutorId: number;
  tutorName: string;
  tutorPhotoUrl: string | null;
  subjectId: number;
  subjectName: string;
  sessionDateTime: Date;
  durationMinutes: number;
}

// Interface for creating a new child
export interface CreateChildRequest {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  parentId: number;
  dateOfBirth?: string;
  gradeLevelId?: number;
  photo?: string;
}

// Interface for child data returned from API
export interface ChildResponse {
  childId: number;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  age: number | null;
  gradeName: string | null;
  overallProgress: number | null;
  nextSession: NextSession | null;
}

// Simplified child overview for UI display
export interface ChildOverview {
  id: number;
  name: string;
  age: number | null;
  grade: string | null;
  progress: number;
  nextSession?: {
    date: string;
    time: string;
    subject: string;
  };
}

/**
 * Service for handling parent-related API requests
 */
export class ParentService {
  /**
   * Fetches children dashboard data for a parent
   * @param parentId The ID of the parent
   * @returns Promise with children overview data
   */
  static async getChildrenOverview(parentId: number): Promise<ChildOverview[]> {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('accessToken');
      
      // Set up headers with authentication
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make API request to backend
      const response = await axios.get<ChildResponse[]>(
        `${API_URL}/users/parent/${parentId}/dashboard/children`, 
        { headers }
      );
      
      // Transform the response data for the UI
      return response.data.map(child => {
        // Format date and time
        let formattedDate = "No upcoming sessions";
        let formattedTime = "";
        let subjectName = "";
        
        if (child.nextSession) {
          const sessionDate = new Date(child.nextSession.sessionDateTime);
          
          // Get relative date (Today, Tomorrow, or date)
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          if (sessionDate.toDateString() === today.toDateString()) {
            formattedDate = "Today";
          } else if (sessionDate.toDateString() === tomorrow.toDateString()) {
            formattedDate = "Tomorrow";
          } else {
            formattedDate = sessionDate.toLocaleDateString("en-US", { 
              month: 'short', 
              day: 'numeric' 
            });
          }
          
          // Format time
          formattedTime = sessionDate.toLocaleTimeString("en-US", { 
            hour: 'numeric', 
            minute: '2-digit'
          });
          
          subjectName = child.nextSession.subjectName;
        }
        
        return {
          id: child.childId,
          name: `${child.firstName} ${child.lastName}`,
          age: child.age,
          grade: child.gradeName,
          progress: child.overallProgress || 0,
          nextSession: child.nextSession ? {
            date: formattedDate,
            time: formattedTime,
            subject: subjectName
          } : undefined
        };
      });
      
    } catch (error) {
      console.error('Error fetching parent dashboard data:', error);
      
      // For development/demo only - return mock data if API fails
      // Remove this in production
      return [
        {
          id: 1,
          name: 'Melkamu Elias',
          age: 13,
          grade: '8th Grade',
          progress: 72,
          nextSession: { date: 'Today', time: '4:00 PM', subject: 'Mathematics' }
        },
        {
          id: 2,
          name: 'Abebe kebede',
          age: 10,
          grade: '5th Grade',
          progress: 85,
          nextSession: { date: 'Tomorrow', time: '3:30 PM', subject: 'English' }
        }
      ];
      
      // Uncomment this for production use:
      // throw error;
    }
  }
  
  /**
   * Creates a new child for a parent
   * @param childData The child data to create
   * @returns Promise with the created child
   */
  static async createChild(childData: CreateChildRequest): Promise<any> {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('accessToken');
      
      // Set up headers with authentication
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make API request to backend
      const response = await axios.post(
        `${API_URL}/users/child`, 
        childData,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating child:', error);
      throw error;
    }
  }
}
