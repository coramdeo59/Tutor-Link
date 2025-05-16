// This file defines the DTOs (Data Transfer Objects) for parent dashboard data

// Basic child info for summaries
export class ChildSummaryDto {
  childId: number;
  firstName: string;
  lastName: string;
  grade?: string;
  age?: number;
  overallProgress?: number;
  nextSession?: {
    sessionId: number;
    title: string;
    dateTime: Date;
    subject: string;
  };
}

// Summary of tutors for this parent's children
export class TutorSummaryDto {
  count: number;
  subjectCount: number;
}

// Summary of upcoming sessions
export class SessionSummaryDto {
  count: number;
  nextSession?: {
    dateTime: Date;
    info: string;
  };
}

// Payment summary information
export class PaymentSummaryDto {
  monthlySpending: number;
  sessionCount: number;
  upcomingPayment?: {
    amount: number;
    dueDate: Date;
  };
  recentTransactions: {
    tutorName: string;
    subject: string;
    amount: number;
    date: Date;
  }[];
}

// Child progress information for dashboard
export class ChildProgressDto {
  childId: number;
  firstName: string;
  lastName: string;
  age: number;
  grade: string;
  overallProgress: number;
  nextSession?: {
    title: string;
    dateTime: Date;
    subject: string;
  };
}

// Complete parent dashboard data
export class ParentDashboardDto {
  parentName: string;
  children: {
    count: number;
    list: ChildSummaryDto[];
  };
  activeTutors: TutorSummaryDto;
  upcomingSessions: SessionSummaryDto;
  monthlySpending: PaymentSummaryDto;
  childrenProgress: ChildProgressDto[];
} 