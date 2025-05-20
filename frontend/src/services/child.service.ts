import axios from 'axios';

export interface CreateChildRequest {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  photo?: string;
  dateOfBirth?: string | Date;
  gradeLevelId?: number;
}

export interface ChildDto {
  childId: number;
  parentId: number;
  firstName: string;
  lastName: string;
  username: string;
  photo: string | null;
  dateOfBirth: string | null;
  gradeLevelId: number | null;
  overallProgress?: number;
  createdAt: Date;
  updatedAt: Date;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Child Service
 * Handles all API calls related to children
 */
export class ChildService {
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
   * Fetch all children for the current authenticated parent
   * @returns Promise with array of child data
   */
  static async getChildren(): Promise<ChildDto[]> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/users/children`, 
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching children:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific child by ID
   * @param childId The ID of the child to fetch
   * @returns Promise with child data
   */
  static async getChildById(childId: string | number): Promise<ChildDto> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/users/children/${childId}`, 
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching child with ID ${childId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate age from date of birth
   * @param dateOfBirth Date of birth string
   * @returns Age in years
   */
  static calculateAge(dateOfBirth: string | null): number {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get grade name based on grade level ID
   * @param gradeLevelId Grade level ID
   * @returns Grade name string
   */
  static getGradeName(gradeLevelId: number | null): string {
    if (!gradeLevelId) return 'N/A';
    
    const gradeMap: Record<number, string> = {
      1: 'Preschool',
      2: 'Kindergarten',
      3: '1st Grade',
      4: '2nd Grade',
      5: '3rd Grade',
      6: '4th Grade',
      7: '5th Grade',
      8: '6th Grade',
      9: '7th Grade',
      10: '8th Grade',
      11: '9th Grade',
      12: '10th Grade',
      13: '11th Grade',
      14: '12th Grade',
    };
    
    return gradeMap[gradeLevelId] || `Grade ${gradeLevelId}`;
  }

  /**
   * Create a new child for the authenticated parent
   * @param childData The child data to create
   * @returns Promise with the created child data
   */
  static async createChild(childData: CreateChildRequest): Promise<ChildDto> {
    try {
      const headers = this.getAuthHeaders();
      
      // Format date properly for the API if it's a Date object
      const formattedData = { ...childData };
      if (formattedData.dateOfBirth instanceof Date) {
        formattedData.dateOfBirth = formattedData.dateOfBirth.toISOString().split('T')[0];
      }
      
      const response = await axios.post(
        `${API_URL}/users/children`,
        formattedData,
        { headers }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating child:', error);
      // Provide more specific error messages based on server response if available
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }
}
