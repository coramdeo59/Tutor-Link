import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * DTO for tutor rejection requests
 */
export class RejectTutorDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'If provided, reason cannot be empty' })
  reason?: string;
}

/**
 * Response DTO for dashboard statistics
 */
export class DashboardStatsDto {
  userStats: {
    totalUsers: number;
    growthPercentage: number;
  };

  approvalStats: {
    pendingApprovals: number;
    requiresAttention: boolean;
  };

  revenueStats: {
    totalRevenue: number;
    growthPercentage: number;
  };

  sessionStats: {
    activeSessions: number;
    peakHoursChange: number;
  };

  asOf: Date;
}

/**
 * Response DTO for pending tutor approvals
 */
export class PendingTutorDto {
  tutorId: number;
  name: string;
  email: string;
  subjects: {
    subjectId: number;
    name: string;
  }[];
  applicationDate: Date;
  photo: string | null; // Using photo instead of profilePictureUrl
  verificationStatus: {
    status: string;
    pendingStep: string | null;
    backgroundCheckStatus: string;
    documentVerified: boolean;
    interviewScheduled: boolean;
  };
}

/**
 * Response DTO for platform analytics
 */
export class PlatformAnalyticsDto {
  userMetrics: {
    activeUsers: number;
    growthPercentage: number;
  };

  sessionMetrics: {
    completionRate: number;
    completionRateGrowth: number;
    averageDuration: number;
    durationGrowth: number;
  };

  supportMetrics: {
    openTickets: number;
    ticketsChangePercentage: number;
  };

  asOf: Date;
} 