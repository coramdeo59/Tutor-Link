import { Injectable, Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../core/database-connection';
import * as userSchema from '../users/schema/User-schema';
import * as tutorSchema from '../users/schema/Tutor-schema';
import * as tutorSubjectSchema from '../users/schema/TutorSubject-schema';
import * as parentSchema from '../users/schema/parent-schema';
import * as tutoringSchema from '../tutoring/schema/tutoring-session.schema';
import * as subjectSchema from '../users/schema/SubjectGrade-schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      users: typeof userSchema.users;
      tutors: typeof tutorSchema.tutors;
      tutor_subjects: typeof tutorSubjectSchema.tutorSubjects;
      parents: typeof parentSchema.parents;
      children: typeof parentSchema.children;
      tutoringSessions: typeof tutoringSchema.tutoringSessions;
      subjects: typeof subjectSchema.subjects;
    }>,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Get dashboard statistics for admin
   * @returns Dashboard statistics including user counts, revenue, and session data
   */
  async getDashboardStats() {
    try {
      // Get total users count
      const usersResult = await this.database
        .select({ count: sql`count(*)` })
        .from(userSchema.users);
      
      const totalUsers = Number(usersResult[0]?.count || 0);
      
      // Get users registered in the last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const newUsersResult = await this.database
        .select({ count: sql`count(*)` })
        .from(userSchema.users)
        .where(gte(userSchema.users.createdAt, lastMonth));
      
      const newUsers = Number(newUsersResult[0]?.count || 0);
      const userGrowthPercentage = totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0;
      
      // Get pending tutor approvals count
      const pendingApprovalsResult = await this.database
        .select({ count: sql`count(*)` })
        .from(tutorSchema.tutors)
        .where(eq(tutorSchema.tutors.isVerified, false));
      
      const pendingApprovals = Number(pendingApprovalsResult[0]?.count || 0);
      
      // Get active sessions count
      const now = new Date();
      const activeSessions = await this.database
        .select({ count: sql`count(*)` })
        .from(tutoringSchema.tutoringSessions)
        .where(
          and(
            gte(tutoringSchema.tutoringSessions.endTime, now),
            eq(tutoringSchema.tutoringSessions.cancelled, false),
            eq(tutoringSchema.tutoringSessions.completed, false),
          ),
        );
      
      const activeSessionCount = Number(activeSessions[0]?.count || 0);
      
      // In a real app, we would calculate actual revenue from payments table
      // This is a mock implementation based on completed sessions
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      previousMonth.setDate(1); // First day of previous month
      
      const currentMonth = new Date();
      currentMonth.setDate(1); // First day of current month
      
      // Completed sessions this month
      const completedSessionsResult = await this.database
        .select({ count: sql`count(*)` })
        .from(tutoringSchema.tutoringSessions)
        .where(
          and(
            gte(tutoringSchema.tutoringSessions.startTime, currentMonth),
            eq(tutoringSchema.tutoringSessions.completed, true),
          ),
        );
      
      const completedSessions = Number(completedSessionsResult[0]?.count || 0);
      
      // Completed sessions last month
      const lastMonthSessionsResult = await this.database
        .select({ count: sql`count(*)` })
        .from(tutoringSchema.tutoringSessions)
        .where(
          and(
            gte(tutoringSchema.tutoringSessions.startTime, previousMonth),
            sql`${tutoringSchema.tutoringSessions.startTime} < ${currentMonth}`,
            eq(tutoringSchema.tutoringSessions.completed, true),
          ),
        );
      
      const lastMonthSessions = Number(lastMonthSessionsResult[0]?.count || 0);
      
      // Mock revenue calculation ($40 per completed session)
      const revenue = completedSessions * 40;
      const lastMonthRevenue = lastMonthSessions * 40;
      const revenueGrowthPercentage = lastMonthRevenue > 0 
        ? Math.round(((revenue - lastMonthRevenue) / lastMonthRevenue) * 100) 
        : 0;
      
      // Mock peak hours reduction
      const peakHoursChange = -25; // -25% from peak hours (mock data)
      
      return {
        userStats: {
          totalUsers,
          growthPercentage: userGrowthPercentage
        },
        approvalStats: {
          pendingApprovals,
          requiresAttention: pendingApprovals > 0
        },
        revenueStats: {
          totalRevenue: revenue,
          growthPercentage: revenueGrowthPercentage
        },
        sessionStats: {
          activeSessions: activeSessionCount,
          peakHoursChange
        },
        asOf: new Date()
      };
    } catch (error) {
      console.error('Error getting admin dashboard stats:', error);
      throw new Error(`Failed to get dashboard statistics: ${error.message}`);
    }
  }

  /**
   * Get pending tutor approval requests
   * @returns List of tutors awaiting approval with their details
   */
  async getPendingTutorApprovals() {
    try {
      // Get tutors that are not yet approved
      const tutors = await this.database
        .select({
          tutorId: tutorSchema.tutors.tutorId,
          applicationDate: tutorSchema.tutors.createdAt,
          isVerified: tutorSchema.tutors.isVerified,
          backgroundCheckStatus: tutorSchema.tutors.backgroundCheckStatus,
          documentVerified: tutorSchema.tutors.documentVerified,
          interviewScheduled: tutorSchema.tutors.interviewScheduled,
          // Join with users table to get personal information
          firstName: userSchema.users.firstName,
          lastName: userSchema.users.lastName,
          email: userSchema.users.email,
          photo: userSchema.users.photo, // Using photo field instead of profilePictureUrl
        })
        .from(tutorSchema.tutors)
        .innerJoin(
          userSchema.users,
          eq(tutorSchema.tutors.tutorId, userSchema.users.userId),
        )
        .where(eq(tutorSchema.tutors.isVerified, false))
        .orderBy(tutorSchema.tutors.createdAt);

      // For each tutor, get their subjects
      const enhancedTutors = await Promise.all(
        tutors.map(async (tutor) => {
          const tutorSubjects = await this.database
            .select({
              subjectId: tutorSubjectSchema.tutorSubjects.subjectId,
              subjectName: subjectSchema.subjects.subjectName,
            })
            .from(tutorSubjectSchema.tutorSubjects)
            .innerJoin(
              subjectSchema.subjects,
              eq(tutorSubjectSchema.tutorSubjects.subjectId, subjectSchema.subjects.subjectId),
            )
            .where(eq(tutorSubjectSchema.tutorSubjects.tutorId, tutor.tutorId));

          const subjects = tutorSubjects.map(s => ({
            subjectId: s.subjectId,
            name: s.subjectName,
          }));

          // Determine verification status details
          let verificationNotes = 'Complete';
          let pendingVerification: string | null = null;

          if (!tutor.backgroundCheckStatus || tutor.backgroundCheckStatus === 'pending') {
            verificationNotes = 'Incomplete';
            pendingVerification = 'Background Check Pending';
          } else if (!tutor.documentVerified) {
            verificationNotes = 'Incomplete';
            pendingVerification = 'Document Verification Pending';
          } else if (!tutor.interviewScheduled) {
            verificationNotes = 'Incomplete';
            pendingVerification = 'Interview Scheduled';
          }

          return {
            tutorId: tutor.tutorId,
            name: `${tutor.firstName} ${tutor.lastName}`,
            email: tutor.email,
            subjects: subjects,
            applicationDate: tutor.applicationDate,
            photo: tutor.photo || null, // Using photo instead of profilePictureUrl
            verificationStatus: {
              status: verificationNotes,
              pendingStep: pendingVerification,
              backgroundCheckStatus: tutor.backgroundCheckStatus || 'pending',
              documentVerified: tutor.documentVerified || false,
              interviewScheduled: tutor.interviewScheduled || false,
            },
          };
        }),
      );

      return enhancedTutors;
    } catch (error) {
      console.error('Error getting pending tutor approvals:', error);
      throw new Error(`Failed to get pending tutor approvals: ${error.message}`);
    }
  }

  /**
   * Approve a tutor application
   * @param tutorId The ID of the tutor to approve
   * @returns The updated tutor record
   */
  async approveTutor(tutorId: number) {
    try {
      // Check if tutor exists and is not already approved
      const existingTutors = await this.database
        .select()
        .from(tutorSchema.tutors)
        .where(
          and(
            eq(tutorSchema.tutors.tutorId, tutorId),
            eq(tutorSchema.tutors.isVerified, false),
          ),
        );

      if (existingTutors.length === 0) {
        throw new NotFoundException(`Tutor with ID ${tutorId} not found or already approved`);
      }

      // Update tutor record to approved
      const updatedTutors = await this.database
        .update(tutorSchema.tutors)
        .set({
          isVerified: true,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(tutorSchema.tutors.tutorId, tutorId))
        .returning();

      const updatedTutor = updatedTutors[0];

      if (!updatedTutor) {
        return { success: false, message: 'Failed to update tutor record' };
      }

      // Get tutor's user information
      const userInfo = await this.database
        .select({
          firstName: userSchema.users.firstName,
          lastName: userSchema.users.lastName,
          email: userSchema.users.email,
        })
        .from(userSchema.users)
        .where(eq(userSchema.users.userId, tutorId));

      // Send approval notification to the tutor
      try {
        await this.notificationService.sendTutorApprovalNotification(tutorId);
      } catch (error) {
        console.error('Error sending tutor approval notification:', error);
        // Continue execution even if notification fails
      }
      
      if (userInfo.length === 0) {
        return {
          tutorId: updatedTutor.tutorId,
          isVerified: updatedTutor.isVerified,
          // Using isVerified instead of verificationStatus which doesn't exist in DB
          approvedAt: updatedTutor.approvedAt,
        };
      }

      // Make sure userInfo has data - this should always be true at this point
      // Using non-null assertion since we've checked userInfo length above
      const userDetails = userInfo[0]!;
      return {
        tutorId: updatedTutor.tutorId,
        name: `${userDetails.firstName} ${userDetails.lastName}`,
        email: userDetails.email,
        isVerified: updatedTutor.isVerified,
        // Using isVerified as the status indicator
        approvedAt: updatedTutor.approvedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error approving tutor:', error);
      throw new Error(`Failed to approve tutor: ${error.message}`);
    }
  }

  /**
   * Reject a tutor application
   * @param tutorId The ID of the tutor to reject
   * @param reason Optional reason for rejection
   * @returns Confirmation of rejection
   */
  async rejectTutor(tutorId: number, reason?: string) {
    try {
      // Check if tutor exists and is not already approved/rejected
      const existingTutor = await this.database
        .select()
        .from(tutorSchema.tutors)
        .where(
          and(
            eq(tutorSchema.tutors.tutorId, tutorId),
            eq(tutorSchema.tutors.isVerified, false),
          ),
        );

      if (existingTutor.length === 0) {
        throw new NotFoundException(`Tutor with ID ${tutorId} not found or already processed`);
      }

      // Update tutor record to rejected
      const [updatedTutor] = await this.database
        .update(tutorSchema.tutors)
        .set({
          // We'll maintain the rejected status through the rejection reason field
          isVerified: false,
          rejectionReason: reason || 'Application rejected by administrator',
          updatedAt: new Date(),
        })
        .where(eq(tutorSchema.tutors.tutorId, tutorId))
        .returning();

      // Send rejection notification to the tutor
      try {
        await this.notificationService.sendTutorRejectionNotification(tutorId, reason);
      } catch (error) {
        console.error('Error sending tutor rejection notification:', error);
        // Continue execution even if notification fails
      }

      // Get tutor's user information
      const userInfo = await this.database
        .select({
          firstName: userSchema.users.firstName,
          lastName: userSchema.users.lastName,
          email: userSchema.users.email,
        })
        .from(userSchema.users)
        .where(eq(userSchema.users.userId, tutorId));

      if (!updatedTutor) {
        return { success: false, message: 'Failed to update tutor record' };
      }
      
      if (userInfo.length === 0) {
        return {
          tutorId: updatedTutor.tutorId,
          status: 'rejected',
          reason: updatedTutor.rejectionReason,
        };
      }

      // Make sure userInfo has data - this should always be true at this point
      if (userInfo[0]) {
        return {
          tutorId: updatedTutor.tutorId,
          name: `${userInfo[0].firstName} ${userInfo[0].lastName}`,
          email: userInfo[0].email,
          status: 'rejected',
          reason: updatedTutor.rejectionReason,
        };
      }
      
      // Return a default response if we couldn't retrieve user info
      return { success: false, message: 'Failed to retrieve complete tutor data after rejection' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error rejecting tutor:', error);
      throw new Error(`Failed to reject tutor: ${error.message}`);
    }
  }

  /**
   * Get detailed platform analytics
   * @returns Platform analytics including user metrics, session metrics, and support tickets
   */
  async getPlatformAnalytics() {
    try {
      // Get active users count (users who have logged in within the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsersResult = await this.database
        .select({ count: sql`count(*)` })
        .from(userSchema.users)
      
      const activeUsers = Number(activeUsersResult[0]?.count || 0);
      
      // Get user growth percentage (mock data for demonstration)
      const userGrowthPercentage = 12;
      
      // Get session completion rate
      const completedSessionsResult = await this.database
        .select({ count: sql`count(*)` })
        .from(tutoringSchema.tutoringSessions)
        .where(eq(tutoringSchema.tutoringSessions.completed, true));
      
      const cancelledSessionsResult = await this.database
        .select({ count: sql`count(*)` })
        .from(tutoringSchema.tutoringSessions)
        .where(eq(tutoringSchema.tutoringSessions.cancelled, true));
      
      const totalSessions = await this.database
        .select({ count: sql`count(*)` })
        .from(tutoringSchema.tutoringSessions);
      
      const completedSessions = Number(completedSessionsResult[0]?.count || 0);
      const cancelledSessions = Number(cancelledSessionsResult[0]?.count || 0);
      const allSessions = Number(totalSessions[0]?.count || 0);
      
      // Calculate completion rate (completed / (total - cancelled))
      const sessionsExcludingCancelled = allSessions - cancelledSessions;
      const sessionCompletionRate = sessionsExcludingCancelled > 0 
        ? (completedSessions / sessionsExcludingCancelled) * 100 
        : 0;
      
      // Round to 1 decimal place
      const roundedCompletionRate = Math.round(sessionCompletionRate * 10) / 10;
      
      // Get session completion rate growth (mock data for demonstration)
      const sessionCompletionRateGrowth = 2.3;
      
      // Calculate average session duration
      // In a real app, we would calculate this from actual session durations
      // This is a mock implementation with fixed values for demonstration
      const avgSessionDuration = 52; // minutes
      const sessionDurationGrowth = 5; // +5 minutes compared to previous period
      
      // Get support tickets count (mock data for demonstration)
      // In a real app, we would get this from a support tickets table
      const supportTickets = 28;
      const supportTicketsChange = -15; // -15% compared to previous period
      
      return {
        userMetrics: {
          activeUsers,
          growthPercentage: userGrowthPercentage
        },
        sessionMetrics: {
          completionRate: roundedCompletionRate,
          completionRateGrowth: sessionCompletionRateGrowth,
          averageDuration: avgSessionDuration,
          durationGrowth: sessionDurationGrowth
        },
        supportMetrics: {
          openTickets: supportTickets,
          ticketsChangePercentage: supportTicketsChange
        },
        asOf: new Date()
      };
    } catch (error) {
      console.error('Error getting platform analytics:', error);
      throw new Error(`Failed to get platform analytics: ${error.message}`);
    }
  }
}
