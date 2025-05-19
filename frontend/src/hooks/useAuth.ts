import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
        
        // For now, we'll just parse the JWT token payload to get basic user info
        // In a production app, you would make an API call to validate the token
        
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Check if token is expired
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('accessToken');
            setUser(null);
            setIsAuthenticated(false);
            return;
          }
          
          setUser({
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            firstName: payload.firstName,
            lastName: payload.lastName
          });
          
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing token:', error);
          localStorage.removeItem('accessToken');
          setUser(null);
          setIsAuthenticated(false);
        }
        
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('Failed to authenticate. Please try logging in again.');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    logout
  };
};
