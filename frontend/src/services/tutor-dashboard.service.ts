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
  sessionId: number;
  childId: number;
  childName?: string;
  subjectId: number;
  subject?: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';
  notes?: string;
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

/**
 * TutorDashboardService
 * Handles API calls related to the tutor dashboard
 */
export class TutorDashboardService {
  /**
   * Get authentication headers for API requests
   * @returns Headers object with authorization token
   */
  private static getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
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
}
