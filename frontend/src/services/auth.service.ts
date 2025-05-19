import axios from 'axios';
import { Subject, GradeLevel } from './tutor.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Type for tutor registration data
export interface TutorSignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  bio: string;
  hourlyRate: number;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  subjects: string[];
  gradeLevels: string[];
  role: string;
}

// Type for parent registration data
export interface ParentSignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: string;
  state: string;
  preferredSubjects: string;
  preferred_communication: string;
  role: string;
}

// Type for sign-in credentials
export interface SignInCredentials {
  email: string;
  password: string;
}

// Type for authentication response
export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Service for handling authentication-related API requests
 */
class AuthService {
  /**
   * Register a new tutor account
   * @param tutorData The tutor registration data
   * @returns Promise with the API response
   */
  async registerTutor(tutorData: TutorSignUpData): Promise<any> {
    try {
      const response = await axios.post(
        '/api/auth/sign-up/tutor',
        tutorData
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Register a new parent account
   * @param parentData The parent registration data
   * @returns Promise with the API response
   */
  async registerParent(parentData: ParentSignUpData): Promise<any> {
    try {
      const response = await axios.post(
        '/api/auth/sign-up/parent',
        parentData
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Sign in with credentials
   * @param credentials The user credentials
   * @returns Promise with auth response
   */
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(
        '/api/auth/sign-in',
        credentials
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Sign out the current user
   * @returns Promise with API response
   */
  async signOut(): Promise<any> {
    try {
      const response = await axios.post('/api/auth/sign-out');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get the current authenticated user
   * @returns Promise with user data
   */
  async getCurrentUser(): Promise<any> {
    try {
      const response = await axios.get('/api/users/me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Fetch available subjects for tutor selection
   * @returns Promise with subjects data
   */
  async getAvailableSubjects(): Promise<Subject[]> {
    try {
      const response = await axios.get(`${API_URL}/reference/subjects`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Fetch available grade levels for tutor selection
   * @returns Promise with grade levels data
   */
  async getAvailableGradeLevels(): Promise<GradeLevel[]> {
    try {
      const response = await axios.get(`${API_URL}/reference/grade-levels`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}

export default new AuthService();
