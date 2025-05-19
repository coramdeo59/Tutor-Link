import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Interface for payment request
export interface CreatePaymentRequest {
  amount: number;
  description: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  invoiceId?: number;
  userId?: number;
}

// Interface for payment response
export interface PaymentResponse {
  id: number;
  amount: string;
  currency: string;
  description: string;
  txRef: string;
  status: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  redirectUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for payment verification
export interface VerifyPaymentResponse {
  status: string;
  message: string;
  data: {
    status: string;
    tx_ref: string;
    transaction_id: string;
    currency: string;
    amount: number;
    [key: string]: any;
  } | null;
}

/**
 * Service for handling payment-related API requests
 */
class PaymentService {
  private static instance: PaymentService;
  private authToken: string | null = null;

  private constructor() {
    // Initialize auth token from localStorage if available
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('authToken');
    }
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
      
      // Initialize with token from localStorage if available
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
          PaymentService.instance.setAuthToken(token);
        }
      }
    }
    return PaymentService.instance;
  }

  public setAuthToken(token: string | null): void {
    this.authToken = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Skip token handling during SSR
    if (typeof window === 'undefined') {
      return headers;
    }
    
    // Get the latest token from localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // Update the instance token
      this.authToken = token;
      
      // Verify token is valid (not expired)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (!isExpired) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          console.warn('Token has expired. Please log in again.');
          // Optionally trigger a token refresh here
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    } else {
      console.warn('No access token found. User may not be authenticated.');
    }
    
    return headers;
  }

  /**
   * Creates a new payment
   * @param paymentData The payment data
   * @returns Promise with the payment response
   */
  public async createPayment(paymentData: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Sending payment request to:', `${API_URL}/payments`);
      console.log('Request payload:', paymentData);
      
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('You must be logged in to make a payment. Please log in and try again.');
      }
      
      // Verify token is not expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          throw new Error('Your session has expired. Please log in again.');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        throw new Error('Invalid authentication token. Please log in again.');
      }
      
      const response = await axios.post<PaymentResponse>(
        `${API_URL}/payments`,
        paymentData,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000, // 30 seconds timeout
          withCredentials: true, // Important for cookies/sessions
        }
      );

      console.log('Payment response:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('Error creating payment:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
        },
      });

      // Handle 401 Unauthorized specifically
      if (error.response?.status === 401) {
        // Clear invalid token
        localStorage.removeItem('accessToken');
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // If we have a response from the server, throw the server's error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // Handle network errors
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      
      if (typeof window !== 'undefined' && !window.navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      
      // Default error message
      throw new Error('Failed to process payment. Please try again.');
    }
  }

  /**
   * Verifies a payment status
   * @param txRef The transaction reference
   * @returns Promise with the payment verification response
   */
  public async verifyPayment(txRef: string): Promise<VerifyPaymentResponse> {
    try {
      const response = await axios.get<VerifyPaymentResponse>(
        `${API_URL}/payments/verify/${txRef}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to verify payment. Please try again.'
      );
    }
  }

  /**
   * Gets payment history for a user
   * @param userId The user ID
   * @returns Promise with the payment history
   */
  public async getPaymentHistory(userId: number): Promise<PaymentResponse[]> {
    try {
      const response = await axios.get<PaymentResponse[]>(
        `${API_URL}/payments/user/${userId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch payment history. Please try again.'
      );
    }
  }
}

export default PaymentService.getInstance();
