/**
 * Dashboard types for Tutor-Link application
 * These types define the data structures used in the dashboard components
 */

export interface Session {
  id: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  sessionId?: string;
  tutorName?: string;
  subject?: string;
}

export interface ChildProgress {
  subject: string;
  progressPercentage: number;
  lastSessionDate?: string;
}

export interface ChildDashboardData {
  id: string;
  name: string;
  age?: number;
  grade?: string;
  photo?: string;
  overallProgress: number;
  upcomingSessions?: Session[];
  sessions?: Session[];
  payments?: Payment[];
  progress?: ChildProgress[];
}

export interface DashboardStats {
  childrenCount: number;
  activeTutors: number;
  upcomingSessions: number; 
  monthlySpending: number;
}

export interface ParentDashboardData {
  children: ChildDashboardData[];
  stats: DashboardStats;
}
