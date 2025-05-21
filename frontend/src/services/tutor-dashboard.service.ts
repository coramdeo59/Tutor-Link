'use clinet'
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Interface definitions for tutor dashboard data
export interface TutorStats {
  rating: number;
  reviews: number;
  totalEarnings: number;
  monthlyEarnings: number;
  upcomingSessions: number;
  totalHours: number;
  completedSessions: number;
  subjects: string[];
}

export interface TutoringSession {
  id?: number; // New primary key from backend
  sessionId?: number; // Keep for backward compatibility
  childId: number;
  childName?: string;
  subjectId: number;
  subject?: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';
  notes?: string;
  durationMinutes?: number;
  gradeLevelName?: string; // Added to match the usage in the UI
}

// Child and subject information interfaces
// These are for API responses from the database
export interface ChildDetails {
  childId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  gradeLevelId?: number;
}

export interface SubjectDetails {
  subjectId: number;
  name: string;
  description?: string;
}

// Safely check if window is defined (client-side only)
const isClient = typeof window !== 'undefined';

// Fetches child details from the backend by ID
export const fetchChildDetails = async (childId: number): Promise<ChildDetails | null> => {
  try {
    // Get token from localStorage - only in client environment
    let token;
    if (isClient) {
      try {
        token = localStorage.getItem('accessToken');
      } catch (e) {
        console.error('Error accessing localStorage:', e);
        return null;
      }
    } else {
      // Server-side fallback (Next.js SSR)
      console.log('Running in server environment, using default token');
      token = '';
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(`${API_URL}/users/children/tutoring/child/${childId}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching child details:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching child details for ID ${childId}:`, error);
    return null;
  }
};

// Fetches subject details from the backend by ID
export const fetchSubjectDetails = async (subjectId: number): Promise<SubjectDetails | null> => {
  try {
    // Get token from localStorage - only in client environment
    let token;
    if (isClient) {
      try {
        token = localStorage.getItem('accessToken');
      } catch (e) {
        console.error('Error accessing localStorage:', e);
        return null;
      }
    } else {
      // Server-side fallback (Next.js SSR)
      console.log('Running in server environment, using default token');
      token = '';
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(`${API_URL}/subjectAndGrade/subjects/${subjectId}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching subject details:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching subject details for ID ${subjectId}:`, error);
    return null;
  }
}

export interface Assignment {
  assignmentId: number;
  childId: number;
  childName?: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
}

export interface Feedback {
  feedbackId: number;
  childId: number;
  childName?: string;
  title: string;
  content: string;
  feedbackType: string;
  createdAt: string;
}

export interface Student {
  childId: number;
  firstName: string;
  lastName: string;
  username: string;
  photo: string | null;
  gradeLevelId: number | null;
  gradeLevelName: string;
  subjects: string[];
}

/**
 * TutorDashboardService
 * Handles API calls related to the tutor dashboard
 */
export class TutorDashboardService {
  /**
   * Get authentication headers
   * @returns Headers object with Authorization token
   */
  private static getAuthHeaders(): Record<string, string> {
    // Try multiple possible token keys to handle inconsistencies
    let token = localStorage.getItem('token') || 
               localStorage.getItem('accessToken') || 
               sessionStorage.getItem('accessToken');
    
    // First, check for existing token with Bearer prefix (important!)    
    if (token && token.startsWith('Bearer ')) {
      // Token already has Bearer prefix - leave as is
      console.log('Token already has Bearer prefix');
    } else {
      // Check if token exists and is not malformed
      if (!token || token === 'undefined' || token === 'null') {
        console.error('Auth token is missing or invalid');
        // For now, fallback to empty token to make the error more obvious in API responses
        token = '';
      } else {
        // Ensure token is properly trimmed to avoid whitespace issues
        token = token.trim();
        
        // Store original form for diagnostics
        const originalTokenLength = token.length;
        
        // Add Bearer prefix only if it's not already there
        if (!token.startsWith('Bearer ')) {
          token = `Bearer ${token}`;
        }
        
        console.log(`Processed token: original length=${originalTokenLength}, new length=${token.length}`);
      }
    }
    
    // Return headers with Authorization if token exists
    return {
      Authorization: token, // Don't add Bearer prefix again - it should already be in the token
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get tutor stats for dashboard
   * @returns Promise with tutor stats
   */
  static async getTutorStats(): Promise<TutorStats> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/users/tutors/dashboard/stats`,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor stats:', error);
      // Return default stats if API fails
      return {
        rating: 0,
        reviews: 0,
        totalEarnings: 0,
        monthlyEarnings: 0,
        upcomingSessions: 0,
        totalHours: 0,
        completedSessions: 0,
        subjects: []
      };
    }
  }

  /**
   * Get upcoming sessions for the tutor
   * @param limit Number of sessions to return
   * @returns Promise with sessions data
   */
  static async getUpcomingSessions(limit = 5): Promise<TutoringSession[]> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/tutors/sessions/my-sessions`,
        { headers }
      );
      
      // Filter the sessions by status and limit the results on the client side
      const upcomingSessions = response.data
        .filter((session: TutoringSession) => ['scheduled', 'confirmed'].includes(session.status))
        .sort((a: TutoringSession, b: TutoringSession) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, limit);
      
      return upcomingSessions;
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      return [];
    }
  }

  /**
   * Get recent feedback provided by the tutor
   * @param limit Number of feedback items to return
   * @returns Promise with feedback data
   */
  static async getRecentFeedback(limit = 5): Promise<Feedback[]> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/tutors/feedback/my-feedback`,
        { headers }
      );
      
      // Process and limit the feedback data on the client side
      const recentFeedback = response.data
        .sort((a: Feedback, b: Feedback) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
      
      return recentFeedback;
    } catch (error) {
      console.error('Error fetching recent feedback:', error);
      return [];
    }
  }

  /**
   * Get assignments created by the tutor
   * @param limit Number of assignments to return
   * @returns Promise with assignments data
   */
  static async getRecentAssignments(limit = 5): Promise<Assignment[]> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/tutors/assignments/my-assignments`,
        { headers }
      );
      
      // Process and limit the assignments data on the client side
      // Sort by due date with closest due dates first
      const recentAssignments = response.data
        .sort((a: Assignment, b: Assignment) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, limit);
      
      return recentAssignments;
    } catch (error) {
      console.error('Error fetching recent assignments:', error);
      return [];
    }
  }

  /**
   * Quick assign homework to a student
   * @param assignmentData Object containing assignment details
   * @returns Promise with assignment creation result
   */
  static async quickAssignHomework(assignmentData: {
    childId: number;
    title: string;
    description: string;
    subjectId: number;
    dueDate: string;
    notes?: string;
  }) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.post(
        `${API_URL}/tutors/assignments/quick-assign`,
        assignmentData,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating quick assignment:', error);
      throw error;
    }
  }

  // This implementation is now removed as it's a duplicate of the one below

  /**
   * Create a new tutoring session
   * @param sessionData The data for the new tutoring session
   * @returns Promise with the created session data
   */
  static async createSession(sessionData: any): Promise<any> {
    try {
      // Get token directly to ensure we're using the latest formatted version
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('accessToken') || 
                    sessionStorage.getItem('accessToken');
                    
      // Format token if needed
      const formattedToken = token && !token.startsWith('Bearer ') ? 
                           `Bearer ${token.trim()}` : token;
      
      // Use the formatted token directly
      const headers = {
        Authorization: formattedToken,
        'Content-Type': 'application/json'
      };
      
      console.log('Creating session with headers:', {
        authHeaderLength: headers.Authorization?.length || 0,
        hasBearerPrefix: headers.Authorization?.startsWith('Bearer ') || false
      });
      
      console.log('Creating session with data:', {
        ...sessionData,
        childId: Number(sessionData.childId),
        subjectId: Number(sessionData.subjectId)  
      });
      
      // Make direct API call with the formatted header
      const response = await axios.post(
        `${API_URL}/tutors/sessions`,
        {
          ...sessionData,
          childId: Number(sessionData.childId),
          subjectId: Number(sessionData.subjectId),
          // Add durationMinutes if it doesn't exist
          durationMinutes: sessionData.durationMinutes || 
            (sessionData.startTime && sessionData.endTime ? 
            Math.round((new Date(sessionData.endTime).getTime() - new Date(sessionData.startTime).getTime()) / 60000) : 60)
        },
        { headers }
      );
      
      console.log('Session created successfully:', response.data);
      
      // Store the token with Bearer prefix for future use
      if (formattedToken) {
        localStorage.setItem('token', formattedToken);
        localStorage.setItem('accessToken', formattedToken);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating session:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  }

  /**
   * Get completed sessions for the tutor
   * @param limit Number of sessions to return
   * @returns Promise with sessions data
   */
  static async getCompletedSessions(limit = 5): Promise<TutoringSession[]> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/tutors/sessions/my-sessions`,
        { headers }
      );
      
      // Filter to only include completed sessions and sort by most recent first
      const completedSessions = response.data
        .filter((session: TutoringSession) => session.status === 'completed')
        .sort((a: TutoringSession, b: TutoringSession) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
        .slice(0, limit);
      
      return completedSessions;
    } catch (error) {
      console.error('Error fetching completed sessions:', error);
      return [];
    }
  }

  /**
   * Calculate tutor statistics based on all available data
   * @returns Promise with calculated statistics
   */
  static async calculateTutorStats(): Promise<TutorStats> {
    try {
      // Get all sessions to calculate stats
      const headers = this.getAuthHeaders();
      const sessionsResponse = await axios.get(`${API_URL}/tutors/sessions/my-sessions`, { headers });
      const allSessions = sessionsResponse.data as TutoringSession[];
      
      // Get tutor's profile
      const profileResponse = await axios.get(`${API_URL}/users/tutors/profile/me`, { headers });
      const profile = profileResponse.data;
      
      // Calculate stats from sessions data
      const completedSessions = allSessions.filter(session => session.status === 'completed');
      const upcomingSessions = allSessions.filter(session => ['scheduled', 'confirmed'].includes(session.status));
      const totalHours = completedSessions.reduce((total, session) => {
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();
        const hours = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
        return total + hours;
      }, 0);
      
      // Calculate monthly earnings (assuming sessions have a price field or using a default rate)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthCompletedSessions = completedSessions.filter(session => {
        const sessionDate = new Date(session.endTime);
        return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
      });
      
      // Assuming an average rate of $40/hour for calculation
      const hourlyRate = 40;
      const monthlyEarnings = thisMonthCompletedSessions.reduce((total, session) => {
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();
        const hours = (end - start) / (1000 * 60 * 60);
        return total + (hours * hourlyRate);
      }, 0);
      
      const totalEarnings = completedSessions.reduce((total, session) => {
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();
        const hours = (end - start) / (1000 * 60 * 60);
        return total + (hours * hourlyRate);
      }, 0);
      
      // Return calculated statistics
      return {
        rating: 4.5, // Placeholder rating
        reviews: completedSessions.length, // Assuming 1 review per completed session
        totalEarnings: Math.round(totalEarnings),
        monthlyEarnings: Math.round(monthlyEarnings),
        upcomingSessions: upcomingSessions.length,
        totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
        completedSessions: completedSessions.length,
        subjects: ['Math', 'Science', 'English'] // Placeholder subjects
      };
    } catch (error) {
      console.error('Error calculating tutor stats:', error);
      return {
        rating: 0,
        reviews: 0,
        totalEarnings: 0,
        monthlyEarnings: 0,
        upcomingSessions: 0,
        totalHours: 0,
        completedSessions: 0,
        subjects: []
      };
    }
  }

  /**
   * Fetches the list of students that the tutor can create sessions and assignments with
   * @returns Promise with array of student data
   */
  static async getAvailableStudents(): Promise<any[]> {
    try {
      const headers = this.getAuthHeaders();
      
      // Add cache-busting query parameter
      const timestamp = new Date().getTime();
      
      const response = await axios.get(
        `${API_URL}/users/children/tutoring/available-students?_=${timestamp}`, 
        { 
          headers: {
            ...headers,
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          }
        }
      );
      
      console.log('Available students response:', response.status, response.data);
      return response.data || [];
    } catch (error: any) { // Type assertion for error handling
      console.error('Error fetching available students:', error);
      console.log('Error details:', error.response?.data || error.message);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Update a session's status
   * @param sessionId The ID of the session to update
   * @param status The new status to set
   * @returns Promise with the updated session data
   */
  static async updateSessionStatus(sessionId: number, status: string): Promise<TutoringSession> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.patch(
        `${API_URL}/tutors/sessions/${sessionId}/status`,
        { status },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error updating session ${sessionId} status:`, error);
      throw error; // Rethrow to let the component handle the error
    }
  }
}
