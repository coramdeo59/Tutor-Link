import { Injectable, Inject, NotFoundException, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import * as parentSchema from '../schema/parent-schema';
import * as userSchema from '../schema/User-schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { ParentDashboardDto, ChildSummaryDto, TutorSummaryDto, SessionSummaryDto, PaymentSummaryDto, ChildProgressDto } from './dtos/parent-dashboard.dto';
import * as subjectSchema from '../schema/SubjectGrade-schema';
import * as tutoringSchema from '../../tutoring/schema/tutoring-session.schema';
import * as tutorSchema from '../schema/Tutor-schema';

@Injectable()
export class ParentService {
  private parents: typeof parentSchema.parents;
  private children: typeof parentSchema.children;
  private users: typeof userSchema.users;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      parents: typeof parentSchema.parents;
      children: typeof parentSchema.children;
      users: typeof userSchema.users;
      tutoringSessions: typeof tutoringSchema.tutoringSessions;
      tutors: typeof tutoringSchema.tutors;
      tutor_profile: typeof tutorSchema.tutors;
      subjects: typeof subjectSchema.subjects;
      gradeLevels: typeof subjectSchema.gradeLevels;
      sessionProgress: typeof tutoringSchema.sessionProgress;
      learningHours: typeof tutoringSchema.learningHours;
      achievements: typeof tutoringSchema.achievements;
    }>,
  ) {
    this.parents = parentSchema.parents;
    this.children = parentSchema.children;
    this.users = userSchema.users;
  }

  /**
   * Create a parent record for a user
   * This is used when a parent user record exists but no parent record exists
   * Important: This fixes a data integrity issue where parent users were being created
   * in the users table but corresponding records were not being created in the parents table.
   */
  async createParentRecord(userId: number): Promise<boolean> {
    try {
      // Check if the user exists
      const users = await this.database
        .select()
        .from(this.users)
        .where(eq(this.users.userId, userId));

      if (users.length === 0) {
        console.error(`User with ID ${userId} not found`);
        return false;
      }

      // Check if parent record already exists
      const existingParent = await this.database
        .select()
        .from(this.parents)
        .where(eq(this.parents.parentId, userId));

      if (existingParent.length > 0) {
        // Parent record already exists
        return true;
      }

      // Create parent record
      const result = await this.database
        .insert(this.parents)
        .values({ parentId: userId })
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Error creating parent record:', error);
      return false;
    }
  }

  /**
   * Get the parent profile and dashboard data
   * @param parentId The ID of the parent (user ID)
   * @returns Complete dashboard data
   */
  async getParentDashboard(parentId: number): Promise<ParentDashboardDto> {
    // Verify parent exists
    await this.validateParent(parentId);
    
    // Get parent name from users table
    const userData = await this.database
      .select({
        firstName: this.users.firstName,
        lastName: this.users.lastName,
      })
      .from(this.users)
      .where(eq(this.users.userId, parentId));
    
    if (userData.length === 0) {
      throw new NotFoundException(`User data for parent ID ${parentId} not found`);
    }
    
    // Safely access properties with null checks
    const parentName = userData[0] ? 
      `${userData[0].firstName || ''} ${userData[0].lastName || ''}`.trim() : 
      'Parent';
    
    // Get children data
    const childrenData = await this.getParentChildren(parentId);
    
    // Get active tutors data
    const activeTutorsData = await this.getParentActiveTutors(parentId);
    
    // Get upcoming sessions data
    const upcomingSessionsData = await this.getParentUpcomingSessions(parentId);
    
    // Get payment/spending data
    const paymentData = await this.getParentPaymentSummary(parentId);
    
    // Get detailed children progress
    const childrenProgress = await this.getChildrenProgress(parentId);
    
    // Assemble dashboard data
    return {
      parentName,
      children: {
        count: childrenData.length,
        list: childrenData,
      },
      activeTutors: activeTutorsData,
      upcomingSessions: upcomingSessionsData,
      monthlySpending: paymentData,
      childrenProgress,
    };
  }
  
  /**
   * Get basic information about all children of a parent
   * @param parentId The ID of the parent
   * @returns Array of child summary data
   */
  async getParentChildren(parentId: number): Promise<ChildSummaryDto[]> {
    // Verify parent exists
    await this.validateParent(parentId);
    
    // Get children from database
    const childrenRecords = await this.database
      .select({
        childId: this.children.childId,
        firstName: this.children.firstName,
        lastName: this.children.lastName,
        gradeLevelId: this.children.gradeLevelId,
        dateOfBirth: this.children.dateOfBirth,
      })
      .from(this.children)
      .where(eq(this.children.parentId, parentId));
    
    // Get grade levels for children that have them
    const gradeLevelIds = childrenRecords
      .filter(child => child.gradeLevelId !== null)
      .map(child => child.gradeLevelId);
    
    const gradeLevels = gradeLevelIds.length > 0 
      ? await this.database
          .select()
          .from(subjectSchema.gradeLevels)
          .where(sql`${subjectSchema.gradeLevels.gradeId} IN (${gradeLevelIds.join(',')})`)
      : [];
    
    // Calculate ages from date of birth
    const now = new Date();
    
    // Create child summaries with grade information
    const childSummaries = await Promise.all(childrenRecords.map(async (child) => {
      // Calculate age if date of birth exists
      const age = child.dateOfBirth 
        ? Math.floor((now.getTime() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
        : undefined;
      
      // Find grade level name if grade level ID exists
      const gradeLevel = child.gradeLevelId 
        ? gradeLevels.find(gl => gl.gradeId === child.gradeLevelId)
        : undefined;
      
      // Get progress information for this child
      const progressData = await this.database
        .select({
          progressPercentage: tutoringSchema.sessionProgress.progressPercentage,
        })
        .from(tutoringSchema.sessionProgress)
        .where(eq(tutoringSchema.sessionProgress.childId, child.childId));
      
      // Calculate overall progress
      const overallProgress = progressData.length > 0
        ? Math.round(
            progressData.reduce(
              (acc, curr) => acc + (curr.progressPercentage || 0),
              0,
            ) / progressData.length,
          )
        : undefined;
      
      // Get next session for this child
      const nextSession = await this.getNextSessionForChild(child.childId);
      
      return {
        childId: child.childId,
        firstName: child.firstName,
        lastName: child.lastName,
        grade: gradeLevel?.gradeLevel,
        age,
        overallProgress,
        nextSession,
      };
    }));
    
    return childSummaries;
  }
  
  /**
   * Get a summary of active tutors for a parent's children
   * @param parentId The ID of the parent
   * @returns Tutor summary data
   */
  async getParentActiveTutors(parentId: number): Promise<TutorSummaryDto> {
    // Verify parent exists
    await this.validateParent(parentId);
    
    // Get children IDs for this parent
    const childrenIds = await this.getParentChildrenIds(parentId);
    
    if (childrenIds.length === 0) {
      return { count: 0, subjectCount: 0 };
    }
    
    // Get unique tutors with active sessions for these children
    const now = new Date();
    
    const tutors = await this.database
      .select({
        tutorId: tutoringSchema.tutoringSessions.tutorId,
        subjectId: tutoringSchema.tutoringSessions.subjectId,
      })
      .from(tutoringSchema.tutoringSessions)
      .where(
        and(
          sql`${tutoringSchema.tutoringSessions.childId} IN (${childrenIds.join(',')})`,
          gte(tutoringSchema.tutoringSessions.startTime, now),
          eq(tutoringSchema.tutoringSessions.cancelled, false),
        ),
      );
    
    // Count unique tutors and subjects
    const uniqueTutorIds = [...new Set(tutors.map(t => t.tutorId))];
    const uniqueSubjectIds = [...new Set(tutors.map(t => t.subjectId))];
    
    return {
      count: uniqueTutorIds.length,
      subjectCount: uniqueSubjectIds.length,
    };
  }
  
  /**
   * Get a summary of upcoming sessions for a parent's children
   * @param parentId The ID of the parent
   * @returns Session summary data
   */
  async getParentUpcomingSessions(parentId: number): Promise<SessionSummaryDto> {
    // Verify parent exists
    await this.validateParent(parentId);
    
    // Get children IDs for this parent
    const childrenIds = await this.getParentChildrenIds(parentId);
    
    if (childrenIds.length === 0) {
      return { count: 0 };
    }
    
    // Get upcoming sessions for these children
    const now = new Date();
    
    const sessions = await this.database
      .select({
        sessionId: tutoringSchema.tutoringSessions.sessionId,
        title: tutoringSchema.tutoringSessions.title,
        startTime: tutoringSchema.tutoringSessions.startTime,
        childId: tutoringSchema.tutoringSessions.childId,
        subjectId: tutoringSchema.tutoringSessions.subjectId,
      })
      .from(tutoringSchema.tutoringSessions)
      .where(
        and(
          sql`${tutoringSchema.tutoringSessions.childId} IN (${childrenIds.join(',')})`,
          gte(tutoringSchema.tutoringSessions.startTime, now),
          eq(tutoringSchema.tutoringSessions.cancelled, false),
        ),
      )
      .orderBy(tutoringSchema.tutoringSessions.startTime);
    
    // If no sessions, return empty summary
    if (sessions.length === 0) {
      return { count: 0 };
    }
    
    // Get subject and child info for the next (first) session
    const nextSession = sessions[0];
    if (!nextSession) {
      return { count: sessions.length };
    }
    
    const subjectInfo = await this.database
      .select()
      .from(subjectSchema.subjects)
      .where(eq(subjectSchema.subjects.subjectId, nextSession.subjectId));
    
    const childInfo = await this.database
      .select()
      .from(this.children)
      .where(eq(this.children.childId, nextSession.childId));
    
    // Extract required data safely
    const childName = childInfo.length > 0 && childInfo[0] ? childInfo[0].firstName || 'Child' : 'Child';
    const subjectName = subjectInfo.length > 0 && subjectInfo[0] ? subjectInfo[0].subjectName || 'Subject' : 'Subject';
    
    // Format next session info
    const nextSessionInfo = {
      dateTime: nextSession.startTime,
      info: `${childName}'s ${subjectName} at ${nextSession.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    
    return {
      count: sessions.length,
      nextSession: nextSessionInfo,
    };
  }
  
  /**
   * Get a summary of payment and spending for a parent
   * @param parentId The ID of the parent
   * @returns Payment summary data
   */
  async getParentPaymentSummary(parentId: number): Promise<PaymentSummaryDto> {
    // This is a mock implementation since we don't have actual payment data yet
    // In a real implementation, this would fetch from a payments table
    
    // Verify parent exists
    await this.validateParent(parentId);
    
    // Mock data based on the parent's children and their sessions
    const childrenIds = await this.getParentChildrenIds(parentId);
    
    if (childrenIds.length === 0) {
      return {
        monthlySpending: 0,
        sessionCount: 0,
        recentTransactions: [],
      };
    }
    
    // Get the current month's sessions
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const sessions = await this.database
      .select({
        sessionId: tutoringSchema.tutoringSessions.sessionId,
        tutorId: tutoringSchema.tutoringSessions.tutorId,
        subjectId: tutoringSchema.tutoringSessions.subjectId,
        startTime: tutoringSchema.tutoringSessions.startTime,
      })
      .from(tutoringSchema.tutoringSessions)
      .where(
        and(
          sql`${tutoringSchema.tutoringSessions.childId} IN (${childrenIds.join(',')})`,
          gte(tutoringSchema.tutoringSessions.startTime, firstDayOfMonth),
        ),
      );
    
    // Mock payment calculation ($40 per session)
    const sessionCount = sessions.length;
    const monthlySpending = sessionCount * 40;
    
    // Mock upcoming payment
    const upcomingPayment = sessionCount > 0 
      ? {
          amount: monthlySpending,
          dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), // First day of next month
        }
      : undefined;
    
    // Get tutor and subject info for recent transactions
    const recentTransactions = await Promise.all(
      sessions.slice(0, 3).map(async (session) => {
        const tutorInfo = await this.database
          .select({
            firstName: this.users.firstName,
            lastName: this.users.lastName,
          })
          .from(tutorSchema.tutors)
          .innerJoin(
            this.users,
            eq(tutorSchema.tutors.tutorId, this.users.userId),
          )
          .where(eq(tutorSchema.tutors.tutorId, session.tutorId));
        
        const subjectInfo = await this.database
          .select()
          .from(subjectSchema.subjects)
          .where(eq(subjectSchema.subjects.subjectId, session.subjectId));
        
        const firstName = tutorInfo[0]?.firstName || '';
        const lastName = tutorInfo[0]?.lastName || '';
        const tutorName = `${firstName} ${lastName}`.trim() || 'Unknown Tutor';
          
        const subjectName = subjectInfo[0]?.subjectName || 'Unknown Subject';
        
        return {
          tutorName: tutorName,
          subject: subjectName,
          amount: 40, // Fixed rate per session
          date: session.startTime,
        };
      }),
    );
    
    return {
      monthlySpending,
      sessionCount,
      upcomingPayment,
      recentTransactions,
    };
  }
  
  /**
   * Get detailed progress information for all children of a parent
   * @param parentId The ID of the parent
   * @returns Array of child progress data
   */
  async getChildrenProgress(parentId: number): Promise<ChildProgressDto[]> {
    // Verify parent exists
    await this.validateParent(parentId);
    
    // Get children basic info
    const childrenSummaries = await this.getParentChildren(parentId);
    
    // Enhance with detailed progress information
    const childrenProgress = await Promise.all(
      childrenSummaries.map(async (child) => {
        // Get progress information for this child from session progress
        const progressData = await this.database
          .select({
            progressId: tutoringSchema.sessionProgress.progressId,
            subjectId: tutoringSchema.sessionProgress.subjectId,
            progressPercentage: tutoringSchema.sessionProgress.progressPercentage,
            subjectName: subjectSchema.subjects.subjectName,
          })
          .from(tutoringSchema.sessionProgress)
          .innerJoin(
            subjectSchema.subjects,
            eq(tutoringSchema.sessionProgress.subjectId, subjectSchema.subjects.subjectId),
          )
          .where(eq(tutoringSchema.sessionProgress.childId, child.childId));
        
        // Calculate overall progress
        const overallProgress = progressData.length > 0
          ? Math.round(
              progressData.reduce(
                (acc, curr) => acc + (curr.progressPercentage || 0),
                0,
              ) / progressData.length,
            )
          : 0;
        
        // Get next session for this child with full details
        const nextSession = await this.getNextSessionForChild(child.childId);
        
        // Convert to proper format
        return {
          childId: child.childId,
          firstName: child.firstName,
          lastName: child.lastName,
          age: child.age || 0,
          grade: child.grade || 'Unknown',
          overallProgress,
          nextSession: nextSession ? {
            title: nextSession.title,
            dateTime: nextSession.dateTime,
            subject: nextSession.subject,
          } : undefined,
        };
      }),
    );
    
    return childrenProgress;
  }
  
  /**
   * Get the next upcoming session for a child
   * @param childId The ID of the child
   * @returns Next session data or undefined if none
   */
  private async getNextSessionForChild(childId: number) {
    const now = new Date();
    
    const sessions = await this.database
      .select({
        sessionId: tutoringSchema.tutoringSessions.sessionId,
        title: tutoringSchema.tutoringSessions.title,
        startTime: tutoringSchema.tutoringSessions.startTime,
        subjectId: tutoringSchema.tutoringSessions.subjectId,
      })
      .from(tutoringSchema.tutoringSessions)
      .where(
        and(
          eq(tutoringSchema.tutoringSessions.childId, childId),
          gte(tutoringSchema.tutoringSessions.startTime, now),
          eq(tutoringSchema.tutoringSessions.cancelled, false),
        ),
      )
      .orderBy(tutoringSchema.tutoringSessions.startTime)
      .limit(1);
    
    if (sessions.length === 0) {
      return undefined;
    }
    
    const session = sessions[0];
    if (!session) {
      return undefined;
    }
    
    // Get subject name
    const subjectInfo = await this.database
      .select()
      .from(subjectSchema.subjects)
      .where(eq(subjectSchema.subjects.subjectId, session.subjectId));
    
    const subjectName = subjectInfo.length > 0 && subjectInfo[0] ? 
      subjectInfo[0].subjectName || 'Unknown Subject' : 
      'Unknown Subject';
    
    return {
      sessionId: session.sessionId,
      title: session.title,
      dateTime: session.startTime,
      subject: subjectName,
    };
  }
  
  /**
   * Validate that a parent exists
   * @param parentId The ID of the parent to validate
   * @throws NotFoundException if the parent doesn't exist
   */
  private async validateParent(parentId: number) {
    const parent = await this.database
      .select()
      .from(this.parents)
      .where(eq(this.parents.parentId, parentId));
    
    if (parent.length === 0) {
      throw new NotFoundException(`Parent with ID ${parentId} not found`);
    }
    
    return parent[0];
  }
  
  /**
   * Get the IDs of all children for a parent
   * @param parentId The ID of the parent
   * @returns Array of child IDs
   */
  private async getParentChildrenIds(parentId: number): Promise<number[]> {
    const children = await this.database
      .select({
        childId: this.children.childId,
      })
      .from(this.children)
      .where(eq(this.children.parentId, parentId));
    
    return children.map(child => child.childId);
  }
  
  /**
   * Verify that a child belongs to a parent
   * @param parentId The ID of the parent
   * @param childId The ID of the child
   * @returns true if the child belongs to the parent, false otherwise
   * @throws NotFoundException if the child doesn't exist
   */
  async verifyParentChild(parentId: number, childId: number): Promise<boolean> {
    // Validate parent exists
    await this.validateParent(parentId);
    
    // Check if child exists
    const child = await this.database
      .select()
      .from(this.children)
      .where(eq(this.children.childId, childId));
    
    if (child.length === 0) {
      throw new NotFoundException(`Child with ID ${childId} not found`);
    }
    
    // Check if child belongs to parent
    if (!child[0]) {
      return false;
    }
    
    return child[0].parentId === parentId;
  }
  
  /**
   * Update a child's basic information
   * @param parentId The ID of the parent
   * @param childId The ID of the child
   * @param updateData Data to update for the child
   * @returns The updated child record
   * @throws UnauthorizedException if the child doesn't belong to the parent
   */
  async updateChildInfo(
    parentId: number, 
    childId: number, 
    updateData: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string | Date;
      gradeLevelId?: number;
    }
  ) {
    // Verify parent-child relationship
    const isParentOfChild = await this.verifyParentChild(parentId, childId);
    
    if (!isParentOfChild) {
      throw new UnauthorizedException('This child does not belong to you');
    }
    
    // Verify grade level exists if provided
    if (updateData.gradeLevelId) {
      const gradeLevel = await this.database
        .select()
        .from(subjectSchema.gradeLevels)
        .where(eq(subjectSchema.gradeLevels.gradeId, updateData.gradeLevelId));
      
      if (gradeLevel.length === 0) {
        throw new NotFoundException(`Grade level with ID ${updateData.gradeLevelId} not found`);
      }
    }
    
    // Prepare update data - ensure correct types for database
    const dbUpdateData: any = {
      updatedAt: new Date(),
    };
    
    if (updateData.firstName !== undefined) {
      dbUpdateData.firstName = updateData.firstName;
    }
    
    if (updateData.lastName !== undefined) {
      dbUpdateData.lastName = updateData.lastName;
    }
    
    if (updateData.dateOfBirth !== undefined) {
      // Convert to string format if it's a Date object
      dbUpdateData.dateOfBirth = typeof updateData.dateOfBirth === 'string' 
        ? updateData.dateOfBirth 
        : updateData.dateOfBirth.toISOString().split('T')[0];
    }
    
    if (updateData.gradeLevelId !== undefined) {
      dbUpdateData.gradeLevelId = updateData.gradeLevelId;
    }
    
    // Update child record
    const updatedChildren = await this.database
      .update(this.children)
      .set(dbUpdateData)
      .where(eq(this.children.childId, childId))
      .returning();
    
    if (!updatedChildren || updatedChildren.length === 0) {
      throw new NotFoundException(`Failed to update child with ID ${childId}`);
    }
    
    const updatedChild = updatedChildren[0];
    
    // Remove sensitive information if present
    const safeChildData = updatedChild ? { ...updatedChild } : {};
    if ('password' in safeChildData) {
      delete safeChildData.password;
    }
    
    return safeChildData;
  }
  
  /**
   * Get detailed information about a specific child
   * @param parentId The ID of the parent
   * @param childId The ID of the child
   * @returns Detailed child information
   * @throws UnauthorizedException if the child doesn't belong to the parent
   */
  async getChildDetails(parentId: number, childId: number) {
    // Verify parent-child relationship
    const isParentOfChild = await this.verifyParentChild(parentId, childId);
    
    if (!isParentOfChild) {
      throw new UnauthorizedException('This child does not belong to you');
    }
    
    // Get child basic info
    const childResults = await this.database
      .select()
      .from(this.children)
      .where(eq(this.children.childId, childId));
    
    if (!childResults || childResults.length === 0) {
      throw new NotFoundException(`Child with ID ${childId} not found`);
    }
    
    const child = childResults[0];
    
    // Create a safe copy without sensitive information
    const childData = { ...child };
    // Delete password property if it exists
    if ('password' in childData) {
      delete childData.password;
    }
    
    // Get grade level info
    let gradeLevel: string | undefined = undefined;
    if (childData.gradeLevelId) {
      const gradeLevels = await this.database
        .select()
        .from(subjectSchema.gradeLevels)
        .where(eq(subjectSchema.gradeLevels.gradeId, childData.gradeLevelId));
      
      if (gradeLevels.length > 0 && gradeLevels[0]) {
        gradeLevel = gradeLevels[0].gradeLevel;
      }
    }
    
    // Get tutoring sessions
    const now = new Date();
    
    // Get upcoming sessions
    const upcomingSessions = await this.database
      .select({
        sessionId: tutoringSchema.tutoringSessions.sessionId,
        title: tutoringSchema.tutoringSessions.title,
        description: tutoringSchema.tutoringSessions.description,
        startTime: tutoringSchema.tutoringSessions.startTime,
        endTime: tutoringSchema.tutoringSessions.endTime,
        tutorId: tutoringSchema.tutoringSessions.tutorId,
        subjectId: tutoringSchema.tutoringSessions.subjectId,
        subjectName: subjectSchema.subjects.subjectName,
      })
      .from(tutoringSchema.tutoringSessions)
      .innerJoin(
        subjectSchema.subjects,
        eq(tutoringSchema.tutoringSessions.subjectId, subjectSchema.subjects.subjectId)
      )
      .where(
        and(
          eq(tutoringSchema.tutoringSessions.childId, childId),
          gte(tutoringSchema.tutoringSessions.startTime, now),
          eq(tutoringSchema.tutoringSessions.cancelled, false)
        )
      )
      .orderBy(tutoringSchema.tutoringSessions.startTime);
    
    // Get past sessions for history
    const pastSessions = await this.database
      .select({
        sessionId: tutoringSchema.tutoringSessions.sessionId,
        title: tutoringSchema.tutoringSessions.title,
        startTime: tutoringSchema.tutoringSessions.startTime,
        endTime: tutoringSchema.tutoringSessions.endTime,
        completed: tutoringSchema.tutoringSessions.completed,
        subjectName: subjectSchema.subjects.subjectName,
      })
      .from(tutoringSchema.tutoringSessions)
      .innerJoin(
        subjectSchema.subjects,
        eq(tutoringSchema.tutoringSessions.subjectId, subjectSchema.subjects.subjectId)
      )
      .where(
        and(
          eq(tutoringSchema.tutoringSessions.childId, childId),
          sql`${tutoringSchema.tutoringSessions.startTime} < ${now}`
        )
      )
      .orderBy(desc(tutoringSchema.tutoringSessions.startTime))
      .limit(10);
    
    // Get learning hours data
    const learningHours = await this.database
      .select({
        totalHours: sql`SUM(CAST(${tutoringSchema.learningHours.hoursSpent} AS DECIMAL))`.as('total_hours'),
      })
      .from(tutoringSchema.learningHours)
      .where(eq(tutoringSchema.learningHours.childId, childId));
    
    const totalHours = Number(learningHours[0]?.totalHours || 0);
    
    // Get achievements
    const achievements = await this.database
      .select()
      .from(tutoringSchema.achievements)
      .where(eq(tutoringSchema.achievements.childId, childId))
      .orderBy(desc(tutoringSchema.achievements.earnedDate))
      .limit(5);
    
    // Calculate age if DOB exists
    const age = childData.dateOfBirth 
      ? Math.floor((now.getTime() - new Date(childData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
      : null;
    
    // Return comprehensive child data
    return {
      ...childData,
      age,
      grade: gradeLevel,
      upcomingSessions,
      upcomingSessionCount: upcomingSessions.length,
      pastSessions,
      totalLearningHours: totalHours,
      recentAchievements: achievements,
      achievementCount: achievements.length,
    };
  }
  
  /**
   * Update a child's account username and password
   * @param parentId The ID of the parent
   * @param childId The ID of the child
   * @param updateData New credentials for the child
   * @returns Success message
   * @throws UnauthorizedException if the child doesn't belong to the parent
   */
  async updateChildCredentials(
    parentId: number,
    childId: number,
    updateData: {
      username?: string;
      password?: string;
    },
    hashingService: any
  ) {
    // Verify parent-child relationship
    const isParentOfChild = await this.verifyParentChild(parentId, childId);
    
    if (!isParentOfChild) {
      throw new UnauthorizedException('This child does not belong to you');
    }
    
    // Check if username already exists if changing username
    if (updateData.username) {
      const existingUsername = await this.database
        .select()
        .from(this.children)
        .where(
          and(
            eq(this.children.username, updateData.username),
            sql`${this.children.childId} != ${childId}`
          )
        );
      
      if (existingUsername.length > 0) {
        throw new ConflictException(`Username '${updateData.username}' is already in use by another child`);
      }
    }
    
    // Prepare update data
    const updateFields: any = {};
    
    if (updateData.username) {
      updateFields.username = updateData.username;
    }
    
    if (updateData.password) {
      // Hash the new password
      updateFields.password = await hashingService.hash(updateData.password);
    }
    
    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestException('No fields to update');
    }
    
    // Update child credentials
    await this.database
      .update(this.children)
      .set({
        ...updateFields,
        updatedAt: new Date(),
      })
      .where(eq(this.children.childId, childId));
    
    return { 
      success: true, 
      message: 'Child credentials updated successfully',
      updatedFields: Object.keys(updateFields)
    };
  }
  
  /**
   * Get all tutoring sessions for all children of a parent
   * @param parentId The ID of the parent
   * @param filterOptions Options to filter the sessions
   * @returns List of tutoring sessions with child and tutor info
   */
  async getAllChildrenSessions(
    parentId: number,
    filterOptions: {
      upcoming?: boolean; // true for upcoming, false for past
      childId?: number;   // filter by specific child
      limit?: number;     // limit number of results
    } = {}
  ) {
    // Verify parent exists
    await this.validateParent(parentId);
    
    // Get children IDs for this parent
    let childrenIds: number[];
    
    if (filterOptions.childId) {
      // Verify this child belongs to parent
      const isParentOfChild = await this.verifyParentChild(parentId, filterOptions.childId);
      
      if (!isParentOfChild) {
        throw new UnauthorizedException('This child does not belong to you');
      }
      
      childrenIds = [filterOptions.childId];
    } else {
      // Get all children for this parent
      childrenIds = await this.getParentChildrenIds(parentId);
    }
    
    if (childrenIds.length === 0) {
      return [];
    }
    
    // Build query for sessions
    const now = new Date();
    
    // Start building query conditions
    let conditions = sql`${tutoringSchema.tutoringSessions.childId} IN (${childrenIds.join(',')})`;
    
    // Add time filter if specified
    if (filterOptions.upcoming !== undefined) {
      const timeCondition = filterOptions.upcoming 
        ? sql`${tutoringSchema.tutoringSessions.startTime} >= ${now}`
        : sql`${tutoringSchema.tutoringSessions.startTime} < ${now}`;
      
      conditions = sql`${conditions} AND ${timeCondition}`;
    }
    
    // For upcoming sessions, exclude cancelled ones
    if (filterOptions.upcoming) {
      conditions = sql`${conditions} AND ${tutoringSchema.tutoringSessions.cancelled} = false`;
    }
    
    // Get sessions with child and tutor names
    const query = this.database
      .select({
        sessionId: tutoringSchema.tutoringSessions.sessionId,
        title: tutoringSchema.tutoringSessions.title,
        description: tutoringSchema.tutoringSessions.description,
        startTime: tutoringSchema.tutoringSessions.startTime,
        endTime: tutoringSchema.tutoringSessions.endTime,
        topic: tutoringSchema.tutoringSessions.topic,
        completed: tutoringSchema.tutoringSessions.completed,
        cancelled: tutoringSchema.tutoringSessions.cancelled,
        childId: tutoringSchema.tutoringSessions.childId,
        childFirstName: this.children.firstName,
        childLastName: this.children.lastName,
        tutorId: tutoringSchema.tutoringSessions.tutorId,
        subjectId: tutoringSchema.tutoringSessions.subjectId,
        subjectName: subjectSchema.subjects.subjectName,
      })
      .from(tutoringSchema.tutoringSessions)
      .innerJoin(
        this.children,
        eq(tutoringSchema.tutoringSessions.childId, this.children.childId)
      )
      .innerJoin(
        subjectSchema.subjects,
        eq(tutoringSchema.tutoringSessions.subjectId, subjectSchema.subjects.subjectId)
      )
      .where(conditions);
    
    // Add order and limit
    const orderedQuery = filterOptions.upcoming
      ? query.orderBy(tutoringSchema.tutoringSessions.startTime)
      : query.orderBy(desc(tutoringSchema.tutoringSessions.startTime));
    
    const limitedQuery = filterOptions.limit
      ? orderedQuery.limit(filterOptions.limit)
      : orderedQuery;
    
    // Execute query
    const sessions = await limitedQuery;
    
    // Enhance with tutor names via separate queries (to avoid multiple joins)
    const tutorIds = [...new Set(sessions.map(session => session.tutorId))];
    
    const tutors = tutorIds.length > 0
      ? await this.database
          .select({
            tutorId: tutorSchema.tutors.tutorId,
            firstName: this.users.firstName,
            lastName: this.users.lastName,
          })
          .from(tutorSchema.tutors)
          .innerJoin(
            this.users,
            eq(tutorSchema.tutors.tutorId, this.users.userId)
          )
          .where(sql`${tutorSchema.tutors.tutorId} IN (${tutorIds.join(',')})`)
      : [];
    
    // Create map of tutorId -> tutorName
    const tutorMap = new Map();
    tutors.forEach(tutor => {
      const firstName = tutor.firstName || '';
      const lastName = tutor.lastName || '';
      tutorMap.set(tutor.tutorId, `${firstName} ${lastName}`.trim() || 'Unknown Tutor');
    });
    
    // Add tutor names to sessions
    const enrichedSessions = sessions.map(session => ({
      ...session,
      tutorName: tutorMap.get(session.tutorId) || 'Unknown Tutor',
    }));
    
    return enrichedSessions;
  }
}
