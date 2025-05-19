import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Interface for tutor data
export interface TutorSubject {
  id: number;
  tutorId: number;
  subjectName: string;
  subjectId?: number;
  createdAt?: string;
}

export interface TutorGrade {
  id: number;
  tutorId: number;
  gradeName: string;
  gradeLevelId?: number;
  createdAt?: string;
}

export interface TutorAvailability {
  id: number;
  tutorId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TutorVerification {
  id: number;
  tutorId: number;
  status: string;
  verificationDate?: string;
  approved: boolean;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Other verification fields
}

export interface Tutor {
  tutorId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  photo?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  bio?: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  // Related data
  subjects?: TutorSubject[];
  grades?: TutorGrade[];
  availability?: TutorAvailability[];
  verifications?: TutorVerification[];
}

// Interface for reference data (subjects and grade levels)
export interface Subject {
  id: number;
  name: string;
}

export interface GradeLevel {
  id: number;
  name: string;
}

/**
 * Service for handling tutor-related API requests
 */
export class TutorService {
  /**
   * Fetches all tutors
   * @returns Promise with tutor data
   */
  static async getAllTutors(): Promise<Tutor[]> {
    try {
      console.log('=== DIAGNOSTIC INFO ===');
      console.log('API URL:', API_URL);
      console.log('Requesting from:', `${API_URL}/users/tutors`);
      
      // Get token from localStorage if available
      const token = localStorage.getItem('accessToken');
      
      // Set up headers
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Using auth token for request');
      } else {
        console.log('No auth token available');
      }
      
      // Make API request to backend - use a timeout to avoid hanging requests
      const response = await axios.get<Tutor[]>(
        `${API_URL}/users/tutors`, 
        { 
          headers,
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log('Response status:', response.status);
      console.log('Response data length:', response.data.length);
      // Log the first tutor and any related data if it exists
      if (response.data.length > 0) {
        const firstTutor = response.data[0];
        console.log('First tutor:', {
          id: firstTutor.tutorId,
          name: `${firstTutor.firstName} ${firstTutor.lastName}`,
          subjects: firstTutor.subjects?.length || 0,
          grades: firstTutor.grades?.length || 0
        });
      } else {
        console.log('Warning: API returned empty array of tutors');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching tutors:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Error message:', error.message);
        console.error('Is this a CORS issue?', error.message.includes('CORS'));
      }
      
      // Return empty array if we couldn't get data from API
      return [];
    }
  }
  
  /**
   * Fetches a single tutor by ID
   * @param tutorId The ID of the tutor
   * @returns Promise with tutor data
   */
  static async getTutorById(tutorId: number): Promise<Tutor | null> {
    try {
      const response = await axios.get<Tutor>(`${API_URL}/users/tutors/${tutorId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tutor ${tutorId}:`, error);
      return null;
    }
  }

  /**
   * Fetches all available subjects from the reference data
   * @returns Promise with subjects data
   */
  static async getAllSubjects(): Promise<Subject[]> {
    try {
      const token = localStorage.getItem('accessToken');
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Fetching subjects from:', `${API_URL}/users/tutors/reference/subjects`);
      const response = await axios.get<Subject[]>(
        `${API_URL}/users/tutors/reference/subjects`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  }

  /**
   * Fetches all available grade levels from the reference data
   * @returns Promise with grade levels data
   */
  static async getAllGradeLevels(): Promise<GradeLevel[]> {
    try {
      const token = localStorage.getItem('accessToken');
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Fetching grade levels from:', `${API_URL}/users/tutors/reference/grade-levels`);
      const response = await axios.get<GradeLevel[]>(
        `${API_URL}/users/tutors/reference/grade-levels`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching grade levels:', error);
      return [];
    }
  }

  /**
   * Selects subjects from reference data for the current tutor
   * @param subjectIds Array of subject IDs to select
   * @returns Promise with the API response
   */
  static async selectSubjectsFromReference(subjectIds: number[]): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const response = await axios.post(
        `${API_URL}/users/tutors/select/subjects`,
        { subjectIds },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error selecting tutor subjects:', error);
      throw error;
    }
  }

  /**
   * Selects grade levels from reference data for the current tutor
   * @param gradeLevelIds Array of grade level IDs to select
   * @returns Promise with the API response
   */
  static async selectGradeLevelsFromReference(gradeLevelIds: number[]): Promise<any> {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const response = await axios.post(
        `${API_URL}/users/tutors/select/grade-levels`,
        { gradeLevelIds },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error selecting tutor grade levels:', error);
      throw error;
    }
  }
  
  /**
   * Gets the subjects for the current tutor
   * @returns Promise with the tutor's subjects
   */
  static async getTutorSubjects(): Promise<any[]> {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const response = await axios.get(
        `${API_URL}/users/tutors/subjects/me`,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting tutor subjects:', error);
      return [];
    }
  }

  /**
   * Gets the grade levels for the current tutor
   * @returns Promise with the tutor's grade levels
   */
  static async getTutorGrades(): Promise<any[]> {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const response = await axios.get(
        `${API_URL}/users/tutors/grades/me`,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting tutor grades:', error);
      return [];
    }
  }
}
