import { useState, useEffect } from 'react';
import { 
  ChildrenData,
  ParentStats,
  PaymentData
} from '../lib/types';

/**
 * A hook for testing the dashboard with mock data
 * This is useful for development and testing before API integration
 */
export const useMockDashboard = () => {
  // Mock welcome data
  const [welcomeData, setWelcomeData] = useState<{ name: string; upcomingSessions: number }>({
    name: 'Mrs. Smith',
    upcomingSessions: 5
  });
  
  // Mock stats data
  const [stats, setStats] = useState<ParentStats>({
    children: { count: 2, names: 'Emma & Jack' },
    tutors: { count: 3, description: 'Across 4 subjects' },
    sessions: { count: 5, description: 'Next: Today at 4 PM' },
    spending: { value: 320, formatted: '$320', description: '8 sessions this month' }
  });
  
  // Mock children data
  const [childrenData, setChildrenData] = useState<ChildrenData>({
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
  });
  
  // Mock payment data
  const [paymentData, setPaymentData] = useState<PaymentData>({
    upcomingPayment: {
      amount: 120,
      dueDate: '2025-05-15'
    },
    transactions: [
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
    ]
  });
  
  // Simulate loading states
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return {
    welcomeData,
    stats,
    childrenData,
    paymentData,
    loading,
    // Mock action handlers
    handleFindTutors: () => console.log('Find tutors clicked'),
    handleScheduleSession: () => console.log('Schedule session clicked'),
    handleViewChildDetails: (childId: string) => console.log(`View child ${childId} details clicked`),
    handlePayNow: () => console.log('Pay now clicked'),
  };
};

export default useMockDashboard;
