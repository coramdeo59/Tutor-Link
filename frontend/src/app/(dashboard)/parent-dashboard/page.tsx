"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { DashboardService } from "@/services/dashboard.service"

// Import individual dashboard components to match the screenshot layout
import WelcomeBanner from "@/components/dashboard/WelcomeBanner"
import DashboardStats from "@/components/dashboard/DashboardStats"
import ChildrenOverview from "@/components/dashboard/ChildrenOverview"
import PaymentSummary from "@/components/dashboard/PaymentSummary"
import { ChildrenData, ParentStats, PaymentData } from "@/lib/types"

// Mock data for visual matching with screenshot when API is unavailable
const mockData = {
  welcome: {
    name: "Mrs. Smith",
    upcomingSessions: 5
  },
  stats: {
    children: { count: 2, names: "Melkamu Elias" },
    tutors: { count: 3, description: "Across 4 subjects" },
    sessions: { count: 5, description: "Next: Today at 4 PM" },
    spending: { value: 320, formatted: "$320", description: "8 sessions this month" }
  },
  children: {
    children: [
      {
        id: "1",
        name: "Melkamu Elias",
        age: 14,
        grade: "9th Grade",
        progress: 72,
        nextSession: "Today, 4:00 PM - Mathematics"
      },
      {
        id: "2",
        name: "Mekdes Tadesse",
        age: 10,
        grade: "5th Grade",
        progress: 85,
        nextSession: "Tomorrow, 3:30 PM - English"
      }
    ]
  },
  payments: {
    upcomingPayment: {
      amount: 120,
      dueDate: "2025-05-15"
    },
    transactions: [
      {
        id: "1",
        tutorName: "Mr. Diata",
        subject: "Mathematics",
        amount: 80,
        date: "2025-05-05"
      },
      {
        id: "2",
        tutorName: "Ms. Gizachew",
        subject: "Science",
        amount: 90,
        date: "2025-05-03"
      },
      {
        id: "3",
        tutorName: "Mr. Gemechis",
        subject: "English",
        amount: 80,
        date: "2025-04-28"
      }
    ]
  }
};

/**
 * Parent Dashboard Page
 * This component implements the dashboard with real data from the backend when possible
 */
export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  
  // State for welcome banner data
  const [welcomeData, setWelcomeData] = useState<{name: string; upcomingSessions: number}>(mockData.welcome);
  const [welcomeLoading, setWelcomeLoading] = useState(true);
  
  // State for dashboard stats
  const [statsData, setStatsData] = useState<ParentStats>(mockData.stats);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // State for children data
  const [childrenData, setChildrenData] = useState<ChildrenData | null>(null);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [childrenError, setChildrenError] = useState<string | null>(null);
  
  // State for payment data
  const [paymentData, setPaymentData] = useState(mockData.payments);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Determine whether to use mock data based on authentication status
  const [useMockData, setUseMockData] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setUseMockData(false); // Use real data when authenticated
    } else {
      setUseMockData(true); // Use mock data when not authenticated
    }
  }, [loading, isAuthenticated, user]);
  
  // Fetch children data from backend
  useEffect(() => {
    const fetchChildrenData = async () => {
      if (loading) return;
      
      try {
        setChildrenLoading(true);
        
        if (useMockData || !user?.id) {
          // Use mock data if not authenticated or explicitly set to use mock data
          setChildrenData(mockData.children);
        } else {
          // Fetch real data from backend
          const data = await DashboardService.getChildrenOverview(String(user.id));
          setChildrenData(data);
        }
        
        setChildrenError(null);
      } catch (error) {
        console.error('Error fetching children data:', error);
        setChildrenError('Failed to load children data');
        setChildrenData(mockData.children); // Fallback to mock data
      } finally {
        setChildrenLoading(false);
      }
    };
    
    fetchChildrenData();
  }, [user, loading, useMockData]);
  
  // Fetch dashboard stats from backend
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (loading) return;
      
      try {
        setStatsLoading(true);
        
        if (useMockData || !user?.id) {
          // Use mock data if not authenticated
          setStatsData(mockData.stats);
        } else {
          // Fetch real data from backend
          const data = await DashboardService.getParentStats(String(user.id));
          setStatsData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStatsData(mockData.stats); // Fallback to mock data
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, [user, loading, useMockData]);
  
  // Fetch welcome data from backend
  useEffect(() => {
    const fetchWelcomeData = async () => {
      if (loading) return;
      
      try {
        setWelcomeLoading(true);
        
        if (useMockData || !user?.id) {
          // Use mock data if not authenticated
          setWelcomeData(mockData.welcome);
        } else {
          // In a real app, you would fetch this from the backend
          // For now, we'll use a customized version of the mock data with the user's email
          const name = user.email ? user.email.split('@')[0] : 'Parent';
          setWelcomeData({
            name: name,
            upcomingSessions: mockData.welcome.upcomingSessions
          });
        }
      } catch (error) {
        console.error('Error setting welcome data:', error);
        setWelcomeData(mockData.welcome); // Fallback to mock data
      } finally {
        setWelcomeLoading(false);
      }
    };
    
    fetchWelcomeData();
  }, [user, loading, useMockData]);

  // Handlers for buttons
  const handleFindTutors = () => {
    router.push("/parent-dashboard/tutor-search");
  };

  const handleScheduleSession = () => {
    router.push("/parent-dashboard/session-management");
  };

  const handleViewChildDetails = (childId: string) => {
    router.push(`/parent-dashboard/children-management?childId=${childId}`);
  };

  const handlePayNow = () => {
    router.push("/parent-dashboard/payment-center");
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-md mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-md"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-80 bg-gray-200 rounded-md"></div>
          <div className="h-80 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Parent Dashboard</h1>
      
      {/* Welcome Banner */}
      <WelcomeBanner 
        parentName={welcomeData.name}
        upcomingSessions={welcomeData.upcomingSessions}
        onFindTutors={handleFindTutors}
        onScheduleSession={handleScheduleSession}
      />
      
      {/* Dashboard Stats */}
      <DashboardStats 
        stats={statsData}
        isLoading={statsLoading}
      />
      
      {/* Main content grid - Children Overview and Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ChildrenOverview 
            data={childrenData}
            loading={childrenLoading}
            error={childrenError}
            onViewDetails={handleViewChildDetails}
          />
        </div>
        <div className="lg:col-span-2">
          <PaymentSummary 
            data={paymentData}
            loading={paymentLoading}
            error={paymentError}
            onPayNow={handlePayNow}
          />
        </div>
      </div>
    </div>
  );
}