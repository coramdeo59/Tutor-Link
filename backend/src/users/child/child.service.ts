import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateChildDto } from '../parent/dtos/create-child.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import * as parentSchema from '../schema/parent-schema';
import * as userSchema from '../schema/User-schema';
import * as subjectSchema from '../schema/SubjectGrade-schema';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { AuthenticationService } from 'src/auth/authentication/authentication.service';
import { and, eq, gte } from 'drizzle-orm';
import { ChildLoginDto } from '../parent/dtos/child-login.dto';
import { Role } from 'src/users/enums/role-enums';
import * as tutoringSchema from '../../tutoring/schema/tutoring-session.schema';
import { desc, sql } from 'drizzle-orm';

@Injectable()
export class ChildService {
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
      subjects: typeof subjectSchema.subjects;
      gradeLevels: typeof subjectSchema.gradeLevels;
    }>,
    private readonly hashingService: HashingService,
    private readonly authenticationService: AuthenticationService,
  ) {
    this.parents = parentSchema.parents;
    this.children = parentSchema.children;
    this.users = userSchema.users;
  }

  /**
   * Create a parent record for a user if it doesn't exist
   * This is used when a parent user record exists but no parent record exists
   * Important: This fixes a data integrity issue where parent users existed without parent records
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
   * Add a child to a parent
   * This creates a child record with direct login capability using username and password.
   */
  async addChild(createChildDto: CreateChildDto) {
    const {
      parentId,
      firstName,
      lastName,
      username,
      password: rawPassword,
      dateOfBirth,
      gradeLevelId,
    } = createChildDto;

    try {
      // Validate parentId
      if (!parentId || typeof parentId !== 'number' || isNaN(parentId)) {
        throw new BadRequestException('A valid parent ID is required');
      }

      console.log(
        'Service received parentId:',
        parentId,
        'type:',
        typeof parentId,
      );

      // Check if parent exists using direct database query
      const parents = await this.database
        .select()
        .from(this.parents)
        .where(eq(this.parents.parentId, parentId));

      if (parents.length === 0) {
        // Try to create the parent record if it doesn't exist
        const parentCreated = await this.createParentRecord(parentId);
        if (!parentCreated) {
          throw new NotFoundException(`Parent with ID ${parentId} not found`);
        }
      }

      // Check if username is already in use by another child
      const existingChildren = await this.database
        .select()
        .from(this.children)
        .where(eq(this.children.username, username));

      if (existingChildren.length > 0) {
        throw new ConflictException(
          `Username '${username}' is already in use.`,
        );
      }

      if (!rawPassword) {
        throw new BadRequestException(
          'Password is required for the child account.',
        );
      }
      const hashedPassword = await this.hashingService.hash(rawPassword);

      // Insert the new child record
      const childValues = {
        parentId,
        firstName,
        lastName,
        username,
        password: hashedPassword,
        dateOfBirth: dateOfBirth ? dateOfBirth.toString() : null,
        gradeLevelId: gradeLevelId || null,
      };

      const result = await this.database
        .insert(this.children)
        .values(childValues)
        .returning();

      if (result.length === 0) {
        throw new InternalServerErrorException('Failed to create child record');
      }

      // Return the child data without the password
      const childRecord = result[0];

      // TypeScript safety check
      if (!childRecord) {
        throw new InternalServerErrorException('Invalid child record returned');
      }

      // Destructure and remove password from the returned data
      const { password: _, ...childData } = childRecord;
      return childData;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error creating child record:', error);
      throw new InternalServerErrorException(
        `Failed to create child record: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Authenticate a child login using username and password, then generate tokens.
   */
  async loginChild(childLoginDto: ChildLoginDto) {
    const { username, password: inputPassword } = childLoginDto;
    try {
      // Find the child by username
      const children = await this.database
        .select()
        .from(this.children)
        .where(eq(this.children.username, username));

      if (children.length === 0) {
        throw new NotFoundException(
          `Child with username '${username}' not found`,
        );
      }

      // Get the first matching child and ensure it's not undefined
      const child = children[0];

      // TypeScript safety check
      if (!child) {
        throw new NotFoundException('Child record is invalid');
      }

      if (!child.password) {
        throw new BadRequestException(
          'Child account has no password set and cannot log in.',
        );
      }

      // Verify the password
      const isPasswordValid = await this.hashingService.compare(
        inputPassword,
        child.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password for child account.');
      }

      // Construct the payload for AuthenticationService.generateTokens
      const tokenGenerationPayload = {
        id: child.childId,
        name: `${child.firstName} ${child.lastName}`.trim(),
        email: child.username, // Pass username as 'email' to satisfy generateTokens parameter
        password: child.password, // Pass hashed password, though generateTokens might not use it directly for payload
        role: Role.Child, // Use the enum value for child_account
      };

      return this.authenticationService.generateTokens(tokenGenerationPayload);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error authenticating child:', error);
      throw new InternalServerErrorException(
        `Failed to authenticate child: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get a child's profile with upcoming tutoring sessions
   * @param childId The ID of the child
   * @returns Child profile with upcoming sessions
   */
  async getChildProfile(childId: number) {
    try {
      // Get the child's basic info
      const children = await this.database
        .select()
        .from(this.children)
        .where(eq(this.children.childId, childId));

      if (children.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      const child = children[0];
      if (!child) {
        throw new NotFoundException('Child record is invalid');
      }

      // Remove sensitive data
      const { password, ...childData } = child;

      // Get the child's grade level info
      let gradeLevel = null;
      if (child.gradeLevelId) {
        const gradeLevels = await this.database
          .select()
          .from(subjectSchema.gradeLevels)
          .where(eq(subjectSchema.gradeLevels.gradeId, child.gradeLevelId));

        if (gradeLevels.length > 0 && gradeLevels[0]) {
          // Explicitly cast to avoid null/undefined type mismatch
          gradeLevel = gradeLevels[0] as any;
        }
      }

      // Get child's parent info
      const parents = await this.database
        .select({
          parentId: this.parents.parentId,
          userId: this.users.userId,
          email: this.users.email,
          firstName: this.users.firstName,
          lastName: this.users.lastName,
        })
        .from(this.parents)
        .innerJoin(this.users, eq(this.parents.parentId, this.users.userId))
        .where(eq(this.parents.parentId, child.parentId));

      const parent = parents.length > 0 ? parents[0] : null;

      // Get upcoming tutoring sessions for this child
      const now = new Date();
      const upcomingSessions = await this.database
        .select({
          sessionId: tutoringSchema.tutoringSessions.sessionId,
          title: tutoringSchema.tutoringSessions.title,
          description: tutoringSchema.tutoringSessions.description,
          startTime: tutoringSchema.tutoringSessions.startTime,
          endTime: tutoringSchema.tutoringSessions.endTime,
          topic: tutoringSchema.tutoringSessions.topic,
          tutorId: tutoringSchema.tutors.tutorId,
          subjectId: tutoringSchema.tutoringSessions.subjectId,
          subjectName: subjectSchema.subjects.subjectName,
        })
        .from(tutoringSchema.tutoringSessions)
        .innerJoin(
          tutoringSchema.tutors,
          eq(
            tutoringSchema.tutoringSessions.tutorId,
            tutoringSchema.tutors.tutorId,
          ),
        )
        .innerJoin(
          subjectSchema.subjects,
          eq(
            tutoringSchema.tutoringSessions.subjectId,
            subjectSchema.subjects.subjectId,
          ),
        )
        .where(
          and(
            eq(tutoringSchema.tutoringSessions.childId, childId),
            gte(tutoringSchema.tutoringSessions.startTime, now),
            eq(tutoringSchema.tutoringSessions.cancelled, false),
          ),
        )
        .orderBy(tutoringSchema.tutoringSessions.startTime);

      // Return the child's profile with related information
      return {
        childProfile: childData,
        parent,
        gradeLevel,
        upcomingSessions,
        sessionCount: upcomingSessions.length,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving child profile:', error);
      throw new InternalServerErrorException(
        `Failed to retrieve child profile: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get upcoming tutoring sessions for a child
   * @param childId The ID of the child
   * @returns List of upcoming tutoring sessions
   */
  async getUpcomingSessions(childId: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(this.children)
        .where(eq(this.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Get current date/time
      const now = new Date();

      // Get upcoming sessions by joining with users table to get tutor names
      const upcomingSessions = await this.database
        .select({
          sessionId: tutoringSchema.tutoringSessions.sessionId,
          title: tutoringSchema.tutoringSessions.title,
          startTime: tutoringSchema.tutoringSessions.startTime,
          endTime: tutoringSchema.tutoringSessions.endTime,
          topic: tutoringSchema.tutoringSessions.topic,
          // Get tutor names from the users table
          tutorFirstName: userSchema.users.firstName,
          tutorLastName: userSchema.users.lastName,
          subjectName: subjectSchema.subjects.subjectName,
        })
        .from(tutoringSchema.tutoringSessions)
        .innerJoin(
          tutoringSchema.tutors,
          eq(
            tutoringSchema.tutoringSessions.tutorId,
            tutoringSchema.tutors.tutorId,
          ),
        )
        // Join with users table to get first name and last name
        .innerJoin(
          userSchema.users,
          eq(tutoringSchema.tutors.tutorId, userSchema.users.userId),
        )
        .innerJoin(
          subjectSchema.subjects,
          eq(
            tutoringSchema.tutoringSessions.subjectId,
            subjectSchema.subjects.subjectId,
          ),
        )
        .where(
          and(
            eq(tutoringSchema.tutoringSessions.childId, childId),
            gte(tutoringSchema.tutoringSessions.startTime, now),
            eq(tutoringSchema.tutoringSessions.cancelled, false),
            eq(tutoringSchema.tutoringSessions.completed, false),
          ),
        )
        .orderBy(tutoringSchema.tutoringSessions.startTime);

      return upcomingSessions;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching upcoming sessions:', error);
      throw new InternalServerErrorException(
        `Failed to fetch upcoming sessions: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Get total learning hours for a child in the current week
   * @param childId The ID of the child
   * @returns Total learning hours for the current week
   */
  async getWeeklyLearningHoursSummary(childId: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(this.children)
        .where(eq(this.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Get current date/time
      const now = new Date();
      // Get start of week (Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      // Check if there's an existing entry for this week
      const weekHours = await this.database
        .select()
        .from(tutoringSchema.learningHours)
        .where(
          and(
            eq(tutoringSchema.learningHours.childId, childId),
            eq(tutoringSchema.learningHours.weekStartDate, startOfWeek),
          ),
        );

      if (weekHours.length > 0 && weekHours[0]) {
        return {
          totalHours:
            (weekHours[0].totalHours ? Number(weekHours[0].totalHours) : 0) /
            10, // Convert from 10th of hours to hours
          weekStartDate: weekHours[0].weekStartDate || new Date(),
        };
      }

      // If no entry for this week, calculate from completed sessions
      const completedSessions = await this.database
        .select({
          startTime: tutoringSchema.tutoringSessions.startTime,
          endTime: tutoringSchema.tutoringSessions.endTime,
        })
        .from(tutoringSchema.tutoringSessions)
        .where(
          and(
            eq(tutoringSchema.tutoringSessions.childId, childId),
            gte(tutoringSchema.tutoringSessions.startTime, startOfWeek),
            eq(tutoringSchema.tutoringSessions.completed, true),
          ),
        );

      let totalHours = 0;
      completedSessions.forEach((session) => {
        const durationHours =
          (session.endTime.getTime() - session.startTime.getTime()) /
          (1000 * 60 * 60);
        totalHours += durationHours;
      });

      // Round to 1 decimal place
      totalHours = Math.round(totalHours * 10) / 10;

      // Convert totalHours to string for storage (since hoursSpent expects a string)
      const hoursString = totalHours.toString();

      // Get a valid subject ID for the learning hours record
      let subjectId: number | undefined;
      
      try {
        // Try to find the most frequently used subject for this child
        const mostUsedSubjects = await this.database
          .select({
            subjectId: tutoringSchema.tutoringSessions.subjectId,
            count: sql`count(*)`.as('count'),
          })
          .from(tutoringSchema.tutoringSessions)
          .where(eq(tutoringSchema.tutoringSessions.childId, childId))
          .groupBy(tutoringSchema.tutoringSessions.subjectId)
          .orderBy(desc(sql`count(*)`))
          .limit(1);
  
        // Check if we found a subject the child uses
        if (mostUsedSubjects.length > 0) {
          const firstSubject = mostUsedSubjects[0];
          if (firstSubject && 'subjectId' in firstSubject && 
              typeof firstSubject.subjectId === 'number') {
            subjectId = firstSubject.subjectId;
            console.log(`Using child's most used subject ID: ${subjectId}`);
          }
        }
  
        // If no subject found from child's history, get any available subject
        if (subjectId === undefined) {
          const allSubjects = await this.database
            .select()
            .from(subjectSchema.subjects)
            .limit(1);
  
          if (allSubjects.length > 0) {
            const firstAvailableSubject = allSubjects[0]; 
            if (firstAvailableSubject && 'subjectId' in firstAvailableSubject && 
                typeof firstAvailableSubject.subjectId === 'number') {
              subjectId = firstAvailableSubject.subjectId;
              console.log(`Using first available subject ID: ${subjectId}`);
            }
          }
        }
  
        // If still no subject, try to use or create a "General" subject
        if (subjectId === undefined) {
          try {
            // First check if "General" subject already exists
            const generalSubjects = await this.database
              .select()
              .from(subjectSchema.subjects)
              .where(eq(subjectSchema.subjects.subjectName, 'General'))
              .limit(1);
  
            if (generalSubjects.length > 0) {
              const generalSubject = generalSubjects[0];
              if (generalSubject && 'subjectId' in generalSubject && 
                  typeof generalSubject.subjectId === 'number') {
                subjectId = generalSubject.subjectId;
                console.log(`Using existing "General" subject ID: ${subjectId}`);
              }
            } else {
              // Create a new "General" subject
              console.log('Creating default "General" subject');
              const newSubjects = await this.database
                .insert(subjectSchema.subjects)
                .values({ subjectName: 'General' })
                .returning();
  
              if (newSubjects.length > 0) {
                const newSubject = newSubjects[0];
                if (newSubject && 'subjectId' in newSubject && 
                    typeof newSubject.subjectId === 'number') {
                  subjectId = newSubject.subjectId;
                  console.log(`Created new "General" subject with ID: ${subjectId}`);
                }
              }
            }
          } catch (error) {
            console.error('Error handling General subject:', error);
          }
        }
  
        // Final check - if we still don't have a subject ID, we can't proceed
        if (subjectId === undefined) {
          throw new Error('Could not determine a valid subject ID for learning hours record');
        }
  
        // Now that we have a valid subject ID, create the learning hours entry
        await this.database
          .insert(tutoringSchema.learningHours)
          .values({
            childId,
            subjectId, // Now guaranteed to be a number
            hoursSpent: hoursString,
            sessionId: sql`NULL`, // Use sql`NULL` for null values
            description: `Weekly summary for week of ${startOfWeek.toLocaleDateString()}`,
            weekStartDate: startOfWeek,
            recordedDate: new Date(),
            updatedAt: new Date(),
            totalHours: hoursString,
          })
          .returning();
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        console.error('Error creating weekly learning hours summary:', error);
        throw new InternalServerErrorException(
          `Failed to create weekly learning hours summary: ${error.message || 'Unknown error'}`
        );
      }

      return {
        totalHours,
        weekStartDate: startOfWeek,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching learning hours:', error);
      throw new InternalServerErrorException(
        `Failed to fetch learning hours: ${error.message || 'Unknown error'}`
      );
    }
  }
  
  /**
   * Get detailed progress summary for a child across all subjects
   * @param childId The ID of the child
   * @returns Detailed progress data with subject information
   */
  async getChildLearningProgress(childId: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(this.children)
        .where(eq(this.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Get progress data with subject names
      const progress = await this.database
        .select({
          progressId: tutoringSchema.sessionProgress.progressId,
          childId: tutoringSchema.sessionProgress.childId,
          subjectId: tutoringSchema.sessionProgress.subjectId,
          subjectName: subjectSchema.subjects.subjectName,
          progressPercentage: tutoringSchema.sessionProgress.progressPercentage,
          updatedAt: tutoringSchema.sessionProgress.updatedAt,
        })
        .from(tutoringSchema.sessionProgress)
        .innerJoin(
          subjectSchema.subjects,
          eq(
            tutoringSchema.sessionProgress.subjectId,
            subjectSchema.subjects.subjectId,
          ),
        )
        .where(eq(tutoringSchema.sessionProgress.childId, childId));

      // Return the child's progress summary
      return {
        childId,
        progress,
        totalSubjects: progress.length,
        averageProgress:
          progress.length > 0
            ? Math.round(
                progress.reduce(
                  (acc, curr) => acc + (curr.progressPercentage || 0),
                  0,
                ) / progress.length,
              )
            : 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving child learning progress:', error);
      throw new InternalServerErrorException(
        `Failed to retrieve child learning progress: ${error.message || 'Unknown error'}`
      );
    }
  }
  
  /**
   * Get recent achievements for a child
   * @param childId The ID of the child
   * @returns List of recent achievements
   */
  async getChildAchievements(childId: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(this.children)
        .where(eq(this.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Get recent achievements
      const achievements = await this.database
        .select()
        .from(tutoringSchema.achievements)
        .where(eq(tutoringSchema.achievements.childId, childId))
        .orderBy(desc(tutoringSchema.achievements.earnedDate));

      return {
        childId,
        achievements,
        totalAchievements: achievements.length,
        recentAchievements: achievements.slice(0, 5), // Return 5 most recent
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving child achievements:', error);
      throw new InternalServerErrorException(
        `Failed to retrieve child achievements: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Get a complete dashboard view for a child with all learning data
   * @param childId The ID of the child
   * @returns Complete dashboard data including profile, upcoming sessions, learning hours, progress, and achievements
   */
  async getChildDashboard(childId: number) {
    try {
      // Fetch child profile data
      const { childProfile, parent, gradeLevel } = await this.getChildProfile(childId);
      
      // Get upcoming sessions
      const upcomingSessions = await this.getUpcomingSessions(childId);
      
      // Get learning hours
      const learningHours = await this.getWeeklyLearningHoursSummary(childId);
      
      // Get learning progress
      const learningProgress = await this.getChildLearningProgress(childId);
      
      // Get achievements
      const achievements = await this.getChildAchievements(childId);
      
      // Return complete dashboard data
      return {
        childProfile,
        parent,
        gradeLevel,
        upcomingSessions,
        learningHours,
        learningProgress,
        achievements: achievements.recentAchievements,
        totalAchievements: achievements.totalAchievements,
        sessionCount: upcomingSessions.length,
        dashboardLastUpdated: new Date()
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving child dashboard:', error);
      throw new InternalServerErrorException(
        `Failed to retrieve child dashboard: ${error.message || 'Unknown error'}`
      );
    }
  }
}
