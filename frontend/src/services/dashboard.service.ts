import axios from 'axios';
import { 
  ChildrenData, 
  ParentStats, 
  PaymentData,
  ChildData,
  Transaction,
  UpcomingPayment
} from '../lib/types';
import { ChildService, ChildDto } from './child.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Dashboard Service
 * Handles all API calls related to the parent dashboard
 */
export class DashboardService {
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
   * Fetch parent dashboard stats
   * @param parentId The parent's ID
   * @returns Promise with dashboard stats
   */
  static async getParentStats(parentId: string): Promise<ParentStats> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/users/parent/${parentId}/dashboard/stats`, 
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching parent stats:', error);
      // Fallback to mock data for development
      return {
        children: { count: 2, names: 'Emma & Jack' },
        tutors: { count: 3, description: 'Across 4 subjects' },
        sessions: { count: 5, description: 'Next: Today at 4 PM' },
        spending: { value: 320, formatted: '$320', description: '8 sessions this month' }
      };
    }
  }

  /**
   * Fetch children overview data
   * @param parentId The parent's ID
   * @returns Promise with children data
   */
  static async getChildrenOverview(parentId: string): Promise<ChildrenData> {
    try {
      // Fetch children directly from the Child API endpoint
      const childrenData = await ChildService.getChildren();
      
      if (!childrenData || childrenData.length === 0) {
        return { children: [] };
      }
      
      // Transform API response to match our ChildData type definition
      const children: ChildData[] = childrenData.map((child: ChildDto) => {
        // Calculate age from dateOfBirth
        const age = ChildService.calculateAge(child.dateOfBirth);
        
        // Get grade name from gradeLevelId
        const grade = ChildService.getGradeName(child.gradeLevelId);
        
        // For next session, we would normally fetch this from a sessions API
        // For now, we'll use a placeholder based on child ID
        let nextSession: string | undefined = undefined;
        if (child.childId % 2 === 0) {
          nextSession = `Tomorrow, 3:30 PM - English`;
        } else {
          nextSession = `Today, 4:00 PM - Mathematics`;
        }
        
        return {
          id: child.childId.toString(),
          name: `${child.firstName} ${child.lastName}`,
          age,
          grade,
          progress: child.overallProgress || 0,
          nextSession
        };
      });
      
      return { children };
    } catch (error) {
      console.error('Error fetching children data:', error);
      // Fallback to mock data for development
      return {
        children: [
          {
            id: '1',
            name: 'Emma Smith',
            age: 14,
            grade: '9th Grade',
            progress: 72,
            nextSession: 'Today, 4:00 PM - Mathematics'
          },
          {
            id: '2',
            name: 'Jack Smith',
            age: 10,
            grade: '5th Grade',
            progress: 85,
            nextSession: 'Tomorrow, 3:30 PM - English'
          }
        ]
      };
    }
  }

  /**
   * Format session date relative to today
   * @param date Date object to format
   * @returns Formatted date string
   */
  private static formatSessionDate(date: Date): string {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  /**
   * Format session time
   * @param date Date object to format
   * @returns Formatted time string
   */
  private static formatSessionTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit'
    });
  }

  /**
   * Fetch payment data for parent
   * @param parentId The parent's ID
   * @returns Promise with payment data
   */
  static async getPaymentData(parentId: string): Promise<PaymentData> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/payment/parent/${parentId}/dashboard`, 
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching payment data:', error);
      // Fallback to mock data for development
      const upcomingPayment: UpcomingPayment = {
        amount: 120,
        dueDate: '2025-05-15'
      };
      
      const transactions: Transaction[] = [
        {
          id: '1',
          tutorName: 'Mr. Johnson',
          subject: 'Mathematics',
          amount: 80,
          date: '2025-05-05'
        },
        {
          id: '2',
          tutorName: 'Ms. Williams', 
          subject: 'Science',
          amount: 90,
          date: '2025-05-03'
        },
        {
          id: '3',
          tutorName: 'Mr. Davis',
          subject: 'English',
          amount: 80,
          date: '2025-04-28'
        }
      ];
      
      return { upcomingPayment, transactions };
    }
  }

  /**
   * Get parent welcome message data
   * @param parentId The parent's ID
   * @returns Promise with welcome data
   */
  static async getWelcomeData(parentId: string): Promise<{ name: string, upcomingSessions: number }> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/users/parent/${parentId}`, 
        { headers }
      );
      
      return {
        name: response.data.name || response.data.firstName + ' ' + response.data.lastName,
        upcomingSessions: response.data.upcomingSessions || 0
      };
    } catch (error) {
      console.error('Error fetching parent data:', error);
      // Fallback to mock data for development
      return {
        name: 'Mrs. Smith',
        upcomingSessions: 5
      };
    }
  }
}
