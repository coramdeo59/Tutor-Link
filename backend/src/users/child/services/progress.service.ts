import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../../core/database-connection';
import { and, eq, gt, count, sum, desc } from 'drizzle-orm';
import {  minutesToHours, safeGet } from '../helpers/type-helpers';

// Import schemas
import {
  subjects,
  childSubjects,
  sessions, // This is now referencing the child_sessions table
  progressAssessments,
} from '../schema/progress.schema';
import { children } from '../../parent/schema/parent.schema';

// Import DTOs
import {
  ChildProgressDto,
  SubjectProgressDto,
  SubjectDetailDto,
  AssessmentDto,
} from '../dto/progress/child-progress.dto';
import {
  UpcomingSessionsDto,
  UpcomingSessionDto,
  SessionHistoryDto,
  SessionHistoryItemDto,
  SessionQueryDto,
  SessionStatus,
} from '../dto/progress/session.dto';

// Import enums
// import { SessionStatus } from '../enum/session-status.enum';

@Injectable()
export class ProgressService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<{
      children: typeof children;
      subjects: typeof subjects;
      childSubjects: typeof childSubjects;
      sessions: typeof sessions;
      progressAssessments: typeof progressAssessments;
    }>,
  ) {
    // Validate database connection on service initialization
    if (!db) {
      console.error('Database connection not established');
    }
  }

  /**
   * Verify that a child belongs to a parent
   * @param childId The child ID
   * @param parentId The parent ID
   * @returns True if the child belongs to the parent, false otherwise
   */
  async verifyChildBelongsToParent(
    childId: number,
    parentId: number,
  ): Promise<boolean> {
    try {
      const child = await this.db.query.children.findFirst({
        where: and(
          eq(children.childId, childId),
          eq(children.parentId, parentId),
        ),
      });

      return !!child;
    } catch (error) {
      console.error('Error verifying child belongs to parent:', error);
      throw new InternalServerErrorException(
        'Failed to verify child belongs to parent',
      );
    }
  }

  /**
   * Get a child's overall progress
   * @param childId The child ID
   * @param parentId The parent ID
   * @returns Child progress data
   */
  async getChildProgress(
    childId: number,
    parentId: number,
  ): Promise<ChildProgressDto> {
    // Verify child belongs to parent
    const childExists = await this.verifyChildBelongsToParent(childId, parentId);
    if (!childExists) {
      throw new NotFoundException('Child not found or does not belong to parent');
    }

    try {
      // Get subject progress data
      const subjectProgress = await this.getSubjectProgressForChild(childId);
      
      // Calculate total sessions, hours, and upcoming sessions
      const totalSessions = await this.getTotalSessionCount(childId);
      const totalHours = await this.getTotalSessionHours(childId);
      const upcomingSessions = await this.getUpcomingSessionCount(childId);

      // Calculate overall progress as weighted average
      let overallProgress = 0;
      if (subjectProgress.length > 0) {
        const totalWeight = subjectProgress.reduce((sum, subject) => sum + subject.sessionCount, 0);
        if (totalWeight > 0) {
          const weightedSum = subjectProgress.reduce(
            (sum, subject) => sum + subject.progress * subject.sessionCount,
            0,
          );
          overallProgress = Math.round(weightedSum / totalWeight);
        } else {
          overallProgress = Math.round(
            subjectProgress.reduce((sum, subject) => sum + subject.progress, 0) / subjectProgress.length
          );
        }
      }

      return {
        childId,
        overallProgress,
        totalSessions,
        totalHours,
        upcomingSessions,
        subjectProgress,
      };
    } catch (error) {
      console.error('Error getting child progress:', error);
      throw new InternalServerErrorException('Failed to get child progress');
    }
  }

  /**
   * Get subject progress for a child
   * @param childId The child ID
   * @returns Array of subject progress data
   */
  private async getSubjectProgressForChild(
    childId: number,
  ): Promise<SubjectProgressDto[]> {
    try {
      // Get subject enrollments for the child
      const enrollments = await this.db.query.childSubjects.findMany({
        where: eq(childSubjects.childId, childId),
        with: {
          subject: true,
        },
      });

      if (enrollments.length === 0) {
        return [];
      }

      // For each subject, get session count and progress data
      const results: SubjectProgressDto[] = [];

      for (const enrollment of enrollments) {
        // Get completed sessions for this subject
        const completedSessions = await this.db.select({
          count: count(),
          totalMinutes: sum(sessions.durationMinutes),
        })
        .from(sessions)
        .where(and(
          eq(sessions.childId, childId),
          eq(sessions.subjectId, enrollment.subjectId),
          eq(sessions.status, SessionStatus.COMPLETED),
        ))
        .execute();

        // Get the latest progress assessment if available
        const latestAssessment = await this.db.query.progressAssessments.findFirst({
          where: and(
            eq(progressAssessments.childId, childId),
            eq(progressAssessments.subjectId, enrollment.subjectId),
          ),
          orderBy: [desc(progressAssessments.assessmentDate)],
        });

        // Use the latest assessment or the enrollment's current progress
        const progress = latestAssessment 
          ? latestAssessment.progressPercentage 
          : enrollment.currentProgress;

        // Calculate hours spent, safely handling potential null values
        const hoursSpent = minutesToHours(completedSessions[0]?.totalMinutes);

        results.push({
          subjectId: enrollment.subjectId,
          name: safeGet(enrollment, 'subject.name', 'Unknown Subject'),
          progress,
          sessionCount: completedSessions[0]?.count || 0,
          hoursSpent,
        });
      }

      return results;
    } catch (error) {
      console.error('Error getting subject progress for child:', error);
      throw new InternalServerErrorException('Failed to get subject progress');
    }
  }

  /**
   * Get the total number of completed sessions for a child
   * @param childId The child ID
   * @returns Total session count
   */
  private async getTotalSessionCount(childId: number): Promise<number> {
    try {
      const result = await this.db.select({ count: count() })
        .from(sessions)
        .where(and(
          eq(sessions.childId, childId),
          eq(sessions.status, SessionStatus.COMPLETED),
        ))
        .execute();

      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting total session count:', error);
      throw new InternalServerErrorException('Failed to get total session count');
    }
  }

  /**
   * Get the total hours spent in sessions for a child
   * @param childId The child ID
   * @returns Total hours (rounded to 1 decimal)
   */
  private async getTotalSessionHours(childId: number): Promise<number> {
    try {
      const result = await this.db.select({
        totalMinutes: sum(sessions.durationMinutes),
      })
      .from(sessions)
      .where(and(
        eq(sessions.childId, childId),
        eq(sessions.status, SessionStatus.COMPLETED),
      ))
      .execute();

      // Safely calculate hours using our helper function
      return minutesToHours(result[0]?.totalMinutes);
    } catch (error) {
      console.error('Error getting total session hours:', error);
      throw new InternalServerErrorException('Failed to get total session hours');
    }
  }

  /**
   * Get the number of upcoming sessions for a child
   * @param childId The child ID
   * @returns Upcoming session count
   */
  private async getUpcomingSessionCount(childId: number): Promise<number> {
    try {
      const result = await this.db.select({ count: count() })
        .from(sessions)
        .where(and(
          eq(sessions.childId, childId),
          eq(sessions.status, SessionStatus.SCHEDULED),
          gt(sessions.startTime, new Date()),
        ))
        .execute();

      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting upcoming session count:', error);
      throw new InternalServerErrorException('Failed to get upcoming session count');
    }
  }

  /**
   * Get upcoming sessions for a child
   * @param childId The child ID
   * @param parentId The parent ID
   * @param limit Maximum number of sessions to return
   * @returns Upcoming sessions data
   */
  async getUpcomingSessions(
    childId: number,
    parentId: number,
    limit: number = 5,
  ): Promise<UpcomingSessionsDto> {
    // Verify child belongs to parent
    const childExists = await this.verifyChildBelongsToParent(childId, parentId);
    if (!childExists) {
      throw new NotFoundException('Child not found or does not belong to parent');
    }

    try {
      // Get upcoming sessions for the child
      const upcomingSessions = await this.db.query.sessions.findMany({
        where: and(
          eq(sessions.childId, childId),
          eq(sessions.status, SessionStatus.SCHEDULED),
          gt(sessions.startTime, new Date()),
        ),
        with: {
          subject: true,
        },
        orderBy: [sessions.startTime],
        limit,
      });

      // Map sessions to DTOs
      const sessionDtos: UpcomingSessionDto[] = upcomingSessions.map(session => ({
        sessionId: session.sessionId,
        subject: session.subject || 'Unknown Subject',
        tutorName: 'TBD', // We'll need to fetch tutor info once tutor table is available
        startTime: session.startTime,
        endTime: session.endTime,
        durationMinutes: session.durationMinutes,
      }));

      return {
        childId,
        upcomingSessions: sessionDtos,
      };
    } catch (error) {
      console.error('Error getting upcoming sessions:', error);
      throw new InternalServerErrorException('Failed to get upcoming sessions');
    }
  }

  /**
   * Get detailed subject progress for a child
   * @param childId The child ID
   * @param parentId The parent ID
   * @param subjectId The subject ID
   * @returns Subject detail data
   */
  async getSubjectProgress(
    childId: number,
    parentId: number,
    subjectId: number,
  ): Promise<SubjectDetailDto> {
    // Verify child belongs to parent
    const childExists = await this.verifyChildBelongsToParent(childId, parentId);
    if (!childExists) {
      throw new NotFoundException('Child not found or does not belong to parent');
    }

    try {
      // Check if subject exists
      const subject = await this.db.query.subjects.findFirst({
        where: eq(subjects.subjectId, subjectId),
      });

      if (!subject) {
        throw new NotFoundException('Subject not found');
      }

      // Check if child is enrolled in the subject
      const enrollment = await this.db.query.childSubjects.findFirst({
        where: and(
          eq(childSubjects.childId, childId),
          eq(childSubjects.subjectId, subjectId),
        ),
      });

      if (!enrollment) {
        throw new NotFoundException('Child is not enrolled in this subject');
      }

      // Get completed sessions for this subject
      const completedSessions = await this.db.select({
        count: count(),
        totalMinutes: sum(sessions.durationMinutes),
      })
      .from(sessions)
      .where(and(
        eq(sessions.childId, childId),
        eq(sessions.subjectId, subjectId),
        eq(sessions.status, SessionStatus.COMPLETED),
      ))
      .execute();

      // Get recent assessments
      const recentAssessments = await this.db.query.progressAssessments.findMany({
        where: and(
          eq(progressAssessments.childId, childId),
          eq(progressAssessments.subjectId, subjectId),
        ),
        orderBy: [desc(progressAssessments.assessmentDate)],
        limit: 5,
      });

      // Calculate progress from assessments or use enrollment progress
      let progress = enrollment.currentProgress;
      if (recentAssessments.length > 0) {
        // Calculate weighted average of recent assessments
        let totalWeight = 0;
        let weightedSum = 0;
        
        recentAssessments.forEach((assessment, index) => {
          const weight = recentAssessments.length - index; // Most recent has highest weight
          totalWeight += weight;
          weightedSum += assessment.progressPercentage * weight;
        });
        
        progress = Math.round(weightedSum / totalWeight);
      }

      // Map assessments to DTOs
      const assessmentDtos: AssessmentDto[] = recentAssessments.map(item => ({
        assessmentId: item.assessmentId,
        score: item.progressPercentage,
        date: item.assessmentDate,
        tutorName: 'TBD', // We'll need to fetch tutor info once tutor table is available
        notes: item.tutorNotes || undefined,
      }));

      // Calculate total hours spent using our helper function
      const totalHoursSpent = minutesToHours(completedSessions[0]?.totalMinutes);

      return {
        childId,
        subjectId,
        subjectName: subject.name,
        progress,
        sessionCount: completedSessions[0]?.count || 0,
        totalHoursSpent,
        recentAssessments: assessmentDtos,
      };
    } catch (error) {
      console.error('Error getting subject progress:', error);
      throw new InternalServerErrorException('Failed to get subject progress');
    }
  }

  /**
   * Get session history for a child
   * @param childId The child ID
   * @param parentId The parent ID
   * @param options Query options
   * @returns Session history data
   */
  async getSessionHistory(
    childId: number,
    parentId: number,
    options: SessionQueryDto,
  ): Promise<SessionHistoryDto> {
    // Verify child belongs to parent
    const childExists = await this.verifyChildBelongsToParent(childId, parentId);
    if (!childExists) {
      throw new NotFoundException('Child not found or does not belong to parent');
    }

    try {
      const { page = 1, pageSize = 10, subjectId, status } = options;
      const offset = (page - 1) * pageSize;

      // Build query conditions
      let conditions = and(eq(sessions.childId, childId));
      
      if (subjectId) {
        conditions = and(conditions, eq(sessions.subjectId, subjectId));
      }
      
      if (status) {
        conditions = and(conditions, eq(sessions.status, status));
      }

      // Count total matching sessions
      const totalResult = await this.db.select({ count: count() })
        .from(sessions)
        .where(conditions)
        .execute();

      const totalSessions = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(totalSessions / pageSize);

      // Get paginated sessions
      const sessionResults = await this.db.query.sessions.findMany({
        where: conditions,
        with: {
          subject: true,
        },
        orderBy: [desc(sessions.startTime)],
        offset,
        limit: pageSize,
      });

      // Map sessions to DTOs
      const sessionDtos: SessionHistoryItemDto[] = sessionResults.map(session => ({
        sessionId: session.sessionId,
        subject: session.subject || 'Unknown Subject',
        tutorName: 'TBD', // We'll need to fetch tutor info once tutor table is available
        startTime: session.startTime,
        endTime: session.endTime,
        durationMinutes: session.durationMinutes,
        status: session.status as SessionStatus,
        notes: session.notes || undefined,
      }));

      return {
        childId,
        totalSessions,
        totalPages,
        currentPage: page,
        sessions: sessionDtos,
      };
    } catch (error) {
      console.error('Error getting session history:', error);
      throw new InternalServerErrorException('Failed to get session history');
    }
  }
}
