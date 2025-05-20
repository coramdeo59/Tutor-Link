import axios from 'axios';
import {
  ChildProgress,
  SubjectDetail,
  UpcomingSessions,
  SessionHistory,
  SessionQueryOptions,
  SessionStatus
} from '../lib/types/progress';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * ProgressService
 * Handles API calls related to child academic progress tracking
 */
export class ProgressService {
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
   * Get overall progress for a child
   * @param childId The child's ID
   * @returns Promise with child progress data
   */
  static async getChildProgress(childId: number): Promise<ChildProgress> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/api/children/${childId}/progress`,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching child progress:', error);
      throw error;
    }
  }

  /**
   * Get upcoming sessions for a child
   * @param childId The child's ID
   * @param limit Maximum number of sessions to return (default: 5)
   * @returns Promise with upcoming sessions data
   */
  static async getUpcomingSessions(childId: number, limit: number = 5): Promise<UpcomingSessions> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/api/children/${childId}/sessions/upcoming?limit=${limit}`,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      throw error;
    }
  }

  /**
   * Get detailed progress for a subject
   * @param childId The child's ID
   * @param subjectId The subject's ID
   * @returns Promise with detailed subject progress data
   */
  static async getSubjectProgress(childId: number, subjectId: number): Promise<SubjectDetail> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/api/children/${childId}/subjects/${subjectId}/progress`,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching subject progress:', error);
      throw error;
    }
  }

  /**
   * Get session history for a child
   * @param childId The child's ID
   * @param options Query options for pagination and filtering
   * @returns Promise with session history data
   */
  static async getSessionHistory(
    childId: number, 
    options: SessionQueryOptions = {}
  ): Promise<SessionHistory> {
    try {
      const headers = this.getAuthHeaders();
      const { page = 1, pageSize = 10, subjectId, status } = options;
      
      let url = `${API_URL}/api/children/${childId}/sessions/history?page=${page}&pageSize=${pageSize}`;
      
      if (subjectId) {
        url += `&subjectId=${subjectId}`;
      }
      
      if (status) {
        url += `&status=${status}`;
      }
      
      const response = await axios.get(url, { headers });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching session history:', error);
      throw error;
    }
  }
}
