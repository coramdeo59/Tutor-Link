import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import * as tutoringSchema from './schema/tutoring-session.schema';
import * as parentSchema from '../users/schema/parent-schema';
import * as subjectSchema from '../users/schema/SubjectGrade-schema';
import * as tutorSchema from '../users/schema/Tutor-schema';
import { and, eq, gte } from 'drizzle-orm';
import { desc, sql } from 'drizzle-orm';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { RecordLearningHoursDto } from './dto/record-learning-hours.dto';
import { DashboardSettingsDto } from './dto/dashboard-settings.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

// Add User-schema import
import * as userSchema from '../users/schema/User-schema';

@Injectable()
export class TutoringService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      tutoringSessions: typeof tutoringSchema.tutoringSessions;
      tutors: typeof tutoringSchema.tutors;
      tutor_profile: typeof tutorSchema.tutors;
      tutor_availability: typeof tutorSchema.tutorAvailabilitySlots;
      subjects: typeof subjectSchema.subjects;
      children: typeof parentSchema.children;
      sessionProgress: typeof tutoringSchema.sessionProgress;
      achievements: typeof tutoringSchema.achievements;
      learningHours: typeof tutoringSchema.learningHours;
      users: typeof userSchema.users;
    }>,
  ) {}

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
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

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
          tutorSchema.tutors,
          eq(
            tutoringSchema.tutoringSessions.tutorId,
            tutorSchema.tutors.tutorId,
          ),
        )
        // Join with users table to get first name and last name
        .innerJoin(
          userSchema.users,
          eq(tutorSchema.tutors.tutorId, userSchema.users.userId),
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
      throw new Error(`Failed to fetch upcoming sessions: ${error.message}`);
    }
  }

  /**
   * Get total learning hours for a child in the current week
   * @param childId The ID of the child
   * @returns Total learning hours for the current week
   */
  // Fix for the getWeeklyLearningHoursSummary method

  async getWeeklyLearningHoursSummary(childId: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

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
        throw new Error(`Failed to create weekly learning hours summary: ${error.message}`);
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
      throw new Error(`Failed to fetch learning hours: ${error.message}`);
    }
  }

  /**
   * Get subjects the child is learning
   * @param childId The ID of the child
   * @returns List of subjects
   */
  async getChildSubjects(childId: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Get subjects from sessions
      const subjects = await this.database
        .select({
          subjectId: subjectSchema.subjects.subjectId,
          subjectName: subjectSchema.subjects.subjectName,
        })
        .from(tutoringSchema.tutoringSessions)
        .innerJoin(
          subjectSchema.subjects,
          eq(
            tutoringSchema.tutoringSessions.subjectId,
            subjectSchema.subjects.subjectId,
          ),
        )
        .where(eq(tutoringSchema.tutoringSessions.childId, childId))
        .groupBy(
          subjectSchema.subjects.subjectId,
          subjectSchema.subjects.subjectName,
        );

      return subjects;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching child subjects:', error);
      throw new Error(`Failed to fetch child subjects: ${error.message}`);
    }
  }

  /**
   * Get progress summary for each subject
   * @param childId The ID of the child
   * @returns Progress for each subject
   */
  async getProgressSummary(childId: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Get progress data
      const progress = await this.database
        .select({
          subjectId: tutoringSchema.sessionProgress.subjectId,
          subjectName: subjectSchema.subjects.subjectName,
          progressPercentage: tutoringSchema.sessionProgress.progressPercentage,
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

      return progress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching progress summary:', error);
      throw new Error(`Failed to fetch progress summary: ${error.message}`);
    }
  }

  /**
   * Get recent achievements for a child
   * @param childId The ID of the child
   * @returns List of recent achievements
   */
  async getRecentAchievements(childId: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Get recent achievements
      const achievements = await this.database
        .select()
        .from(tutoringSchema.achievements)
        .where(eq(tutoringSchema.achievements.childId, childId))
        .orderBy(desc(tutoringSchema.achievements.earnedDate))
        .limit(5);

      return achievements;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching recent achievements:', error);
      throw new Error(`Failed to fetch recent achievements: ${error.message}`);
    }
  }

  /**
   * Get achievement statistics and categorize them for a child
   * @param childId The ID of the child
   * @returns Achievement statistics and counts by category
   */
  async getAchievementStats(childId: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Get all achievements for the child
      const achievements = await this.database
        .select()
        .from(tutoringSchema.achievements)
        .where(eq(tutoringSchema.achievements.childId, childId))
        .orderBy(desc(tutoringSchema.achievements.earnedDate));

      // Define achievement category type
      type AchievementCategory = {
        name: string;
        description: string;
        count: number;
        achievements: any[];
      };

      // Define achievement categories
      const categories: Record<string, AchievementCategory> = {
        progress: {
          name: 'Learning Progress',
          description: 'Achievements earned by making progress in subjects',
          count: 0,
          achievements: [],
        },
        hours: {
          name: 'Learning Hours',
          description: 'Achievements earned by accumulating study hours',
          count: 0,
          achievements: [],
        },
        sessions: {
          name: 'Tutoring Sessions',
          description: 'Achievements related to completing tutoring sessions',
          count: 0,
          achievements: [],
        },
        special: {
          name: 'Special Achievements',
          description: 'Special recognition for outstanding performance',
          count: 0,
          achievements: [],
        },
      };

      // Helper function to categorize achievements based on name/description
      const categorizeAchievement = (achievement: any) => {
        const name = achievement.name.toLowerCase();
        const description = achievement.description?.toLowerCase() || '';

        if (
          name.includes('master') ||
          name.includes('proficiency') ||
          description.includes('progress') ||
          description.includes('proficiency')
        ) {
          if (categories.progress) {
            categories.progress.achievements.push(achievement);
            categories.progress.count++;
          }
        } else if (
          name.includes('hours') ||
          name.includes('learner') ||
          name.includes('dedicated') ||
          name.includes('expert') ||
          name.includes('enthusiast') ||
          name.includes('beginner') ||
          name.includes('centurion') ||
          name.includes('scholar') ||
          description.includes('hours') ||
          description.includes('studying') ||
          description.includes('study time')
        ) {
          if (categories.hours) {
            categories.hours.achievements.push(achievement);
            categories.hours.count++;
          }
        } else if (
          name.includes('session') ||
          description.includes('session') ||
          description.includes('sessions') ||
          description.includes('tutoring')
        ) {
          if (categories.sessions) {
            categories.sessions.achievements.push(achievement);
            categories.sessions.count++;
          }
        } else {
          if (categories.special) {
            categories.special.achievements.push(achievement);
            categories.special.count++;
          }
        }
      };

      // Categorize all achievements
      achievements.forEach(categorizeAchievement);

      // Get the total count
      const totalCount = achievements.length;

      // Get achievement earned dates by month for the chart
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyAchievements = achievements
        .filter((a) => new Date(a.earnedDate) >= sixMonthsAgo)
        .reduce<Record<string, number>>((acc, achievement) => {
          const date = new Date(achievement.earnedDate);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

          if (!acc[monthYear]) {
            acc[monthYear] = 0;
          }
          acc[monthYear]++;

          return acc;
        }, {});

      // Convert to array for chart data
      const monthlyAchievementData = Object.entries(monthlyAchievements).map(
        ([month, count]) => ({
          month,
          count,
        }),
      );

      // Return the achievement statistics
      return {
        totalAchievements: totalCount,
        mostRecentAchievement: achievements.length > 0 ? achievements[0] : null,
        categorizedAchievements: categories,
        recentAchievements: achievements.slice(0, 5),
        monthlyAchievementData,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching achievement statistics:', error);
      throw new Error(
        `Failed to fetch achievement statistics: ${error.message}`,
      );
    }
  }

  /**
   * Update a child's progress in a subject
   * This can be triggered after completing a session or assessment
   * @param updateProgressDto Data for updating the progress
   * @returns The updated progress record
   */
  async updateProgress(updateProgressDto: UpdateProgressDto) {
    try {
      const { childId, subjectId, progressPercentage, sessionId } =
        updateProgressDto;

      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Verify the subject exists
      const subject = await this.database
        .select()
        .from(subjectSchema.subjects)
        .where(eq(subjectSchema.subjects.subjectId, subjectId));

      if (subject.length === 0) {
        throw new NotFoundException(`Subject with ID ${subjectId} not found`);
      }

      // Check if progress record already exists for this child-subject pair
      const existingProgress = await this.database
        .select()
        .from(tutoringSchema.sessionProgress)
        .where(
          and(
            eq(tutoringSchema.sessionProgress.childId, childId),
            eq(tutoringSchema.sessionProgress.subjectId, subjectId),
          ),
        );

      let result;

      if (existingProgress.length > 0) {
        // Update existing progress record
        const [updated] = await this.database
          .update(tutoringSchema.sessionProgress)
          .set({
            progressPercentage,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(tutoringSchema.sessionProgress.childId, childId),
              eq(tutoringSchema.sessionProgress.subjectId, subjectId),
            ),
          )
          .returning();

        result = updated;
      } else {
        // Create new progress record
        const [newProgress] = await this.database
          .insert(tutoringSchema.sessionProgress)
          .values({
            childId,
            subjectId,
            progressPercentage,
            updatedAt: new Date(),
          })
          .returning();

        result = newProgress;
      }

      // If this update is related to a session, we can update the session as completed
      if (sessionId) {
        await this.database
          .update(tutoringSchema.tutoringSessions)
          .set({
            completed: true,
            updatedAt: new Date(),
          })
          .where(eq(tutoringSchema.tutoringSessions.sessionId, sessionId));
      }

      // If progress is 100%, create an achievement for mastering the subject
      if (progressPercentage === 100) {
        const subjectName = subject[0]?.subjectName || 'Subject';

        // Check if this achievement already exists
        const existingAchievement = await this.database
          .select()
          .from(tutoringSchema.achievements)
          .where(
            and(
              eq(tutoringSchema.achievements.childId, childId),
              eq(tutoringSchema.achievements.name, `${subjectName} Master`),
            ),
          );

        if (existingAchievement.length === 0) {
          // Create the achievement
          await this.database.insert(tutoringSchema.achievements).values({
            childId,
            name: `${subjectName} Master`,
            description: `Mastered ${subjectName} with 100% proficiency!`,
            earnedDate: new Date(),
          });
        }
      }

      // If progress is 75% or above, create a 'Quick Learner' achievement if not exists
      if (progressPercentage >= 75) {
        const existingAchievement = await this.database
          .select()
          .from(tutoringSchema.achievements)
          .where(
            and(
              eq(tutoringSchema.achievements.childId, childId),
              eq(tutoringSchema.achievements.name, 'Quick Learner'),
            ),
          );

        if (existingAchievement.length === 0) {
          // Create the achievement
          await this.database.insert(tutoringSchema.achievements).values({
            childId,
            name: 'Quick Learner',
            description:
              'Achieved at least 75% proficiency in a subject quickly!',
            earnedDate: new Date(),
          });
        }
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating progress:', error);
      throw new Error(`Failed to update progress: ${error.message}`);
    }
  }

  /**
   * Get detailed progress data for a child across all subjects
   * @param childId The ID of the child
   * @returns Detailed progress data with subject information
   */
  async getDetailedProgressSummary(childId: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

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

      // Get all existing subjects to include ones without progress data
      const allSubjects = await this.database
        .select()
        .from(subjectSchema.subjects);

      // Create a map of subject progress
      const progressBySubject = new Map();

      progress.forEach((item) => {
        progressBySubject.set(item.subjectId, item);
      });

      // Create a comprehensive list including subjects with no progress
      const fullProgressList = allSubjects.map((subject) => {
        if (progressBySubject.has(subject.subjectId)) {
          return progressBySubject.get(subject.subjectId);
        } else {
          return {
            progressId: null,
            childId,
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            progressPercentage: 0,
            updatedAt: null,
          };
        }
      });

      // Get the child's sessions by subject
      const sessionsBySubject = await this.database
        .select({
          subjectId: tutoringSchema.tutoringSessions.subjectId,
          count: sql`count(*)`.as('count'),
          completedCount:
            sql`sum(case when ${tutoringSchema.tutoringSessions.completed} = true then 1 else 0 end)`.as(
              'completed_count',
            ),
        })
        .from(tutoringSchema.tutoringSessions)
        .where(eq(tutoringSchema.tutoringSessions.childId, childId))
        .groupBy(tutoringSchema.tutoringSessions.subjectId);

      // Create a map of session counts by subject
      const sessionCountMap = new Map();
      sessionsBySubject.forEach((item) => {
        sessionCountMap.set(item.subjectId, {
          totalSessions: Number(item.count) || 0,
          completedSessions: Number(item.completedCount) || 0,
        });
      });

      // Combine progress with session count data
      const enrichedProgressData = fullProgressList.map((item) => {
        const sessionData = sessionCountMap.get(item.subjectId) || {
          totalSessions: 0,
          completedSessions: 0,
        };
        return {
          ...item,
          ...sessionData,
        };
      });

      return {
        progress: enrichedProgressData,
        totalSubjects: allSubjects.length,
        subjectsWithProgress: progress.length,
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
      console.error('Error fetching detailed progress summary:', error);
      throw new Error(
        `Failed to fetch detailed progress summary: ${error.message}`,
      );
    }
  }

  /**
   * Get a specific session by ID
   * @param sessionId The ID of the session to retrieve
   * @returns The session details or null if not found
   */
  async getSessionById(sessionId: number) {
    try {
      const sessions = await this.database
        .select()
        .from(tutoringSchema.tutoringSessions)
        .where(eq(tutoringSchema.tutoringSessions.sessionId, sessionId));

      return sessions.length > 0 ? sessions[0] : null;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  /**
   * Record learning hours for a child in a specific subject
   * @param recordLearningHoursDto Data for recording learning hours
   * @returns The recorded learning hours entry
   */
  async recordLearningHours(recordLearningHoursDto: RecordLearningHoursDto) {
    try {
      const { childId, subjectId, hoursSpent, sessionId, description } =
        recordLearningHoursDto;

      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Verify the subject exists
      const subject = await this.database
        .select()
        .from(subjectSchema.subjects)
        .where(eq(subjectSchema.subjects.subjectId, subjectId));

      if (subject.length === 0) {
        throw new NotFoundException(`Subject with ID ${subjectId} not found`);
      }

      // If sessionId is provided, verify it exists and belongs to this child
      if (sessionId) {
        const session = await this.getSessionById(sessionId);
        if (!session) {
          throw new NotFoundException(`Session with ID ${sessionId} not found`);
        }

        if (session.childId !== childId) {
          throw new BadRequestException(
            'Session does not belong to this child',
          );
        }
      }
      const hoursSpentString = hoursSpent.toString();
      // Record the learning hours
      const [learningHoursRecord] = await this.database
        .insert(tutoringSchema.learningHours)
        .values({
          childId,
          subjectId,
          hoursSpent: hoursSpentString, // Convert number to string
          sessionId: sessionId || sql`NULL`, // Use sql`NULL` for null values
          description: description || null,
          recordedDate: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Check if child has accumulated significant learning hours for achievements
      await this.checkAndCreateLearningHoursAchievements(childId, subjectId);

      return learningHoursRecord;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error recording learning hours:', error);
      throw new Error(`Failed to record learning hours: ${error.message}`);
    }
  }

  /**
   * Get learning hours for a child, optionally filtered by subject
   * @param childId The ID of the child
   * @param subjectId Optional ID of the subject to filter by
   * @returns Summary of learning hours with detailed records
   */
  async getLearningHours(childId: number, subjectId?: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Build the query base
      let query = this.database
        .select({
          id: tutoringSchema.learningHours.id,
          childId: tutoringSchema.learningHours.childId,
          subjectId: tutoringSchema.learningHours.subjectId,
          subjectName: subjectSchema.subjects.subjectName,
          hoursSpent: tutoringSchema.learningHours.hoursSpent,
          sessionId: tutoringSchema.learningHours.sessionId,
          description: tutoringSchema.learningHours.description,
          recordedDate: tutoringSchema.learningHours.recordedDate,
        })
        .from(tutoringSchema.learningHours)
        .innerJoin(
          subjectSchema.subjects,
          eq(
            tutoringSchema.learningHours.subjectId,
            subjectSchema.subjects.subjectId,
          ),
        )
        .where(
          subjectId
            ? and(
                eq(tutoringSchema.learningHours.childId, childId),
                eq(tutoringSchema.learningHours.subjectId, subjectId),
              )
            : eq(tutoringSchema.learningHours.childId, childId),
        );

      // Execute the query with ordering
      const learningHoursRecords = await query.orderBy(
        desc(tutoringSchema.learningHours.recordedDate),
      );

      // Get total hours by subject
      const totalHoursBySubject = await this.database
        .select({
          subjectId: tutoringSchema.learningHours.subjectId,
          subjectName: subjectSchema.subjects.subjectName,
          totalHours: sql`SUM(${tutoringSchema.learningHours.hoursSpent})`.as(
            'total_hours',
          ),
        })
        .from(tutoringSchema.learningHours)
        .innerJoin(
          subjectSchema.subjects,
          eq(
            tutoringSchema.learningHours.subjectId,
            subjectSchema.subjects.subjectId,
          ),
        )
        .where(eq(tutoringSchema.learningHours.childId, childId))
        .groupBy(
          tutoringSchema.learningHours.subjectId,
          subjectSchema.subjects.subjectName,
        );

      // Calculate total hours across all subjects
      const totalHours = totalHoursBySubject.reduce(
        (sum, subject) => sum + Number(subject.totalHours),
        0,
      );

      // Create summary with detailed records
      return {
        totalHours,
        hoursBySubject: totalHoursBySubject,
        recentRecords: learningHoursRecords.slice(0, 10), // Return only the 10 most recent records
        recordCount: learningHoursRecords.length,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching learning hours:', error);
      throw new Error(`Failed to fetch learning hours: ${error.message}`);
    }
  }

  /**
   * Check and create achievements based on accumulated learning hours
   * @param childId The ID of the child
   * @param subjectId The ID of the subject
   */
  private async checkAndCreateLearningHoursAchievements(
    childId: number,
    subjectId: number,
  ) {
    try {
      // Get subject information
      const subject = await this.database
        .select()
        .from(subjectSchema.subjects)
        .where(eq(subjectSchema.subjects.subjectId, subjectId));

      if (subject.length === 0) return; // Subject not found, skip achievement check

      const subjectName = subject[0]?.subjectName || 'Unknown Subject';

      // Calculate total hours for this subject
      const totalHoursResult = await this.database
        .select({
          totalHours: sql`SUM(${tutoringSchema.learningHours.hoursSpent})`.as(
            'total_hours',
          ),
        })
        .from(tutoringSchema.learningHours)
        .where(
          and(
            eq(tutoringSchema.learningHours.childId, childId),
            eq(tutoringSchema.learningHours.subjectId, subjectId),
          ),
        );

      const totalHours = Number(totalHoursResult[0]?.totalHours || 0);

      // Define achievement thresholds
      const achievements = [
        {
          hours: 50,
          name: `${subjectName} Expert`,
          description: `Spent over 50 hours studying ${subjectName}!`,
        },
        {
          hours: 25,
          name: `${subjectName} Enthusiast`,
          description: `Spent over 25 hours studying ${subjectName}!`,
        },
        {
          hours: 10,
          name: `${subjectName} Dedicated Learner`,
          description: `Spent over 10 hours studying ${subjectName}!`,
        },
        {
          hours: 5,
          name: `${subjectName} Beginner`,
          description: `Started the journey with 5 hours of ${subjectName}!`,
        },
      ];

      // Check each achievement threshold and create if eligible
      for (const achievement of achievements) {
        if (totalHours >= achievement.hours) {
          // Check if this achievement already exists
          const existingAchievement = await this.database
            .select()
            .from(tutoringSchema.achievements)
            .where(
              and(
                eq(tutoringSchema.achievements.childId, childId),
                eq(tutoringSchema.achievements.name, achievement.name),
              ),
            );

          if (existingAchievement.length === 0) {
            // Create the achievement
            await this.database.insert(tutoringSchema.achievements).values({
              childId,
              name: achievement.name,
              description: achievement.description,
              earnedDate: new Date(),
            });
          }
        }
      }

      // Also check for all-subject milestones
      const allSubjectsTotalHoursResult = await this.database
        .select({
          totalHours: sql`SUM(${tutoringSchema.learningHours.hoursSpent})`.as(
            'total_hours',
          ),
        })
        .from(tutoringSchema.learningHours)
        .where(eq(tutoringSchema.learningHours.childId, childId));

      const allSubjectsTotalHours = Number(
        allSubjectsTotalHoursResult[0]?.totalHours || 0,
      );

      // Define all-subjects achievement thresholds
      const allSubjectsAchievements = [
        {
          hours: 100,
          name: 'Learning Centurion',
          description:
            'Completed 100 hours of total study time across all subjects!',
        },
        {
          hours: 50,
          name: 'Dedicated Scholar',
          description:
            'Completed 50 hours of total study time across all subjects!',
        },
        {
          hours: 25,
          name: 'Committed Learner',
          description:
            'Completed 25 hours of total study time across all subjects!',
        },
        {
          hours: 10,
          name: 'Learning Journey Begins',
          description:
            'Completed 10 hours of total study time across all subjects!',
        },
      ];

      // Check each all-subjects achievement threshold and create if eligible
      for (const achievement of allSubjectsAchievements) {
        if (allSubjectsTotalHours >= achievement.hours) {
          // Check if this achievement already exists
          const existingAchievement = await this.database
            .select()
            .from(tutoringSchema.achievements)
            .where(
              and(
                eq(tutoringSchema.achievements.childId, childId),
                eq(tutoringSchema.achievements.name, achievement.name),
              ),
            );

          if (existingAchievement.length === 0) {
            // Create the achievement
            await this.database.insert(tutoringSchema.achievements).values({
              childId,
              name: achievement.name,
              description: achievement.description,
              earnedDate: new Date(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking learning hours achievements:', error);
      // Don't throw here, just log the error as this is a background process
    }
  }

  /**
   * Create a new tutoring session
   * @param createSessionDto Data for creating the session
   * @returns The created session
   */
  /**
   * Get dashboard settings for a child
   * @param childId The ID of the child
   * @returns The child's dashboard settings or default settings if none exist
   */
  async getDashboardSettings(childId: number) {
    try {
      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Get dashboard settings
      const settings = await this.database
        .select()
        .from(tutoringSchema.dashboardSettings)
        .where(eq(tutoringSchema.dashboardSettings.childId, childId));

      // If settings exist, return them
      if (settings.length > 0) {
        return settings[0];
      }

      // If no settings exist, create default settings
      return this.createDefaultDashboardSettings(childId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching dashboard settings:', error);
      throw new Error(`Failed to fetch dashboard settings: ${error.message}`);
    }
  }

  /**
   * Update dashboard settings for a child
   * @param dashboardSettingsDto The settings to update
   * @returns The updated dashboard settings
   */
  async updateDashboardSettings(dashboardSettingsDto: DashboardSettingsDto) {
    try {
      const {
        childId,
        preferredSubjectIds,
        widgetPreferences,
        displayPreferences,
        pinnedItems,
      } = dashboardSettingsDto;

      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Check if settings exist for this child
      const existingSettings = await this.database
        .select()
        .from(tutoringSchema.dashboardSettings)
        .where(eq(tutoringSchema.dashboardSettings.childId, childId));

      let result;

      if (existingSettings.length > 0) {
        // Update existing settings
        // Create an update object with only the fields that are provided
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (preferredSubjectIds !== undefined) {
          updateData.preferredSubjectIds = preferredSubjectIds;
        }

        if (widgetPreferences !== undefined) {
          updateData.widgetPreferences = widgetPreferences;
        }

        if (displayPreferences !== undefined) {
          updateData.displayPreferences = displayPreferences;
        }

        if (pinnedItems !== undefined) {
          updateData.pinnedItems = pinnedItems;
        }

        const [updated] = await this.database
          .update(tutoringSchema.dashboardSettings)
          .set(updateData)
          .where(eq(tutoringSchema.dashboardSettings.childId, childId))
          .returning();

        result = updated;
      } else {
        // Create new settings
        const [newSettings] = await this.database
          .insert(tutoringSchema.dashboardSettings)
          .values({
            childId,
            preferredSubjectIds: preferredSubjectIds || [],
            widgetPreferences: widgetPreferences || {
              showUpcomingSessions: true,
              showRecentAchievements: true,
              showProgressSummary: true,
              showLearningHours: true,
            },
            displayPreferences: displayPreferences || {
              colorTheme: 'light',
              layout: 'standard',
            },
            pinnedItems: pinnedItems || [],
            updatedAt: new Date(),
          })
          .returning();

        result = newSettings;
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating dashboard settings:', error);
      throw new Error(`Failed to update dashboard settings: ${error.message}`);
    }
  }

  /**
   * Create default dashboard settings for a child
   * @param childId The ID of the child
   * @returns The created default dashboard settings
   */
  private async createDefaultDashboardSettings(childId: number) {
    try {
      // Get all subjects to set as default preferred subjects
      const subjects = await this.database
        .select()
        .from(subjectSchema.subjects);

      const defaultSubjectIds = subjects.map((subject) => subject.subjectId);

      // Create default settings
      const [defaultSettings] = await this.database
        .insert(tutoringSchema.dashboardSettings)
        .values({
          childId,
          preferredSubjectIds: defaultSubjectIds,
          widgetPreferences: {
            showUpcomingSessions: true,
            showRecentAchievements: true,
            showProgressSummary: true,
            showLearningHours: true,
          },
          displayPreferences: {
            colorTheme: 'light',
            layout: 'standard',
          },
          pinnedItems: [],
          updatedAt: new Date(),
        })
        .returning();

      return defaultSettings;
    } catch (error) {
      console.error('Error creating default dashboard settings:', error);
      throw new Error(
        `Failed to create default dashboard settings: ${error.message}`,
      );
    }
  }

  /**
   * Create a new tutoring session
   * @param createSessionDto Data for creating the session
   * @returns The created session
   */
  async createSession(createSessionDto: CreateSessionDto) {
    try {
      const { childId, tutorId, subjectId, startTime, endTime } =
        createSessionDto;

      if (childId === undefined) {
        throw new BadRequestException('childId is required');
      }

      // Verify the child exists
      const child = await this.database
        .select()
        .from(parentSchema.children)
        .where(eq(parentSchema.children.childId, childId));

      if (child.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      // Verify the tutor exists in the tutor profile table
      const tutor = await this.database
        .select()
        .from(tutorSchema.tutors)
        .where(eq(tutorSchema.tutors.tutorId, tutorId));

      if (tutor.length === 0) {
        throw new NotFoundException(`Tutor with ID ${tutorId} not found`);
      }

      // Verify the subject exists
      const subject = await this.database
        .select()
        .from(subjectSchema.subjects)
        .where(eq(subjectSchema.subjects.subjectId, subjectId));

      if (subject.length === 0) {
        throw new NotFoundException(`Subject with ID ${subjectId} not found`);
      }
      // Validate session times
      const start = startTime ? new Date(startTime) : undefined;
      const end = endTime ? new Date(endTime) : undefined;

      if (!start || !end) {
        throw new BadRequestException('Start time and end time are required');
      }

      if (start >= end) {
        throw new BadRequestException(
          'Session end time must be after start time',
        );
      }

      // Check if the session time overlaps with existing sessions for this child
      const childOverlappingSessions = await this.database
        .select()
        .from(tutoringSchema.tutoringSessions)
        .where(
          and(
            eq(tutoringSchema.tutoringSessions.childId, childId),
            eq(tutoringSchema.tutoringSessions.cancelled, false),
            gte(tutoringSchema.tutoringSessions.endTime, start),
            eq(tutoringSchema.tutoringSessions.startTime, end),
          ),
        );

      if (childOverlappingSessions.length > 0) {
        throw new ConflictException(
          'This time slot overlaps with an existing session for this child',
        );
      }

      // Check if the session time overlaps with existing sessions for this tutor
      const tutorOverlappingSessions = await this.database
        .select()
        .from(tutoringSchema.tutoringSessions)
        .where(
          and(
            eq(tutoringSchema.tutoringSessions.tutorId, tutorId),
            eq(tutoringSchema.tutoringSessions.cancelled, false),
            gte(tutoringSchema.tutoringSessions.endTime, start),
            eq(tutoringSchema.tutoringSessions.startTime, end),
          ),
        );

      if (tutorOverlappingSessions.length > 0) {
        throw new ConflictException(
          'This time slot overlaps with an existing session for this tutor',
        );
      }

      // Check if tutor is available during this time slot
      // Extract day of week from the startTime
      const daysOfWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const dayOfWeek = daysOfWeek[start.getDay()];

      // Extract time portions for comparison
      const sessionStartHour = start.getHours();
      const sessionStartMinute = start.getMinutes();
      const sessionEndHour = end.getHours();
      const sessionEndMinute = end.getMinutes();

      // Find tutor availability slots for this day
      const availabilitySlots = await this.database
        .select()
        .from(tutorSchema.tutorAvailabilitySlots)
        .where(eq(tutorSchema.tutorAvailabilitySlots.tutorId, tutorId));

      // In the createSession method, around line 1420, replace the existing isAvailable check with this:

      const isAvailable = availabilitySlots.some((slot) => {
        // Check if the slot's dayOfWeek array includes the day we need
        if (
          !slot.dayOfWeek ||
          !Array.isArray(slot.dayOfWeek) ||
          !dayOfWeek ||
          !slot.dayOfWeek.includes(dayOfWeek as any)
        ) {
          return false;
        }

        // Parse time strings like '09:00:00' to compare with session times
        const slotStartParts = (slot.startTime?.toString() || '').split(':');
        const slotEndParts = (slot.endTime?.toString() || '').split(':');

        // Make sure we have valid parts before parsing
        if (
          !slotStartParts[0] ||
          !slotStartParts[1] ||
          !slotEndParts[0] ||
          !slotEndParts[1]
        ) {
          return false;
        }

        const slotStartHour = parseInt(slotStartParts[0], 10);
        const slotStartMinute = parseInt(slotStartParts[1], 10);
        const slotEndHour = parseInt(slotEndParts[0], 10);
        const slotEndMinute = parseInt(slotEndParts[1], 10);

        // Convert to total minutes for easier comparison
        const slotStartTotalMinutes = slotStartHour * 60 + slotStartMinute;
        const slotEndTotalMinutes = slotEndHour * 60 + slotEndMinute;
        const sessionStartTotalMinutes =
          sessionStartHour * 60 + sessionStartMinute;
        const sessionEndTotalMinutes = sessionEndHour * 60 + sessionEndMinute;

        // Debug logging
        console.log(
          `Availability slot: ${dayOfWeek} ${slotStartHour}:${slotStartMinute} - ${slotEndHour}:${slotEndMinute}`,
        );
        console.log(
          `Requested session: ${dayOfWeek} ${sessionStartHour}:${sessionStartMinute} - ${sessionEndHour}:${sessionEndMinute}`,
        );
        console.log(
          `In minutes: Slot ${slotStartTotalMinutes}-${slotEndTotalMinutes}, Session ${sessionStartTotalMinutes}-${sessionEndTotalMinutes}`,
        );

        // Check for proper overlap: session must be fully contained within the slot
        return (
          sessionStartTotalMinutes >= slotStartTotalMinutes &&
          sessionEndTotalMinutes <= slotEndTotalMinutes
        );
      });

      // Add debugging to show all availability slots when there's an error
      if (!isAvailable) {
        console.log(
          'No matching availability found. All tutor availability slots:',
        );
        availabilitySlots.forEach((slot) => {
          console.log(
            `- Days: ${slot.dayOfWeek}, Time: ${slot.startTime} - ${slot.endTime}`,
          );
        });

        // Option 1: Create a temporary feature flag to bypass the check
        if (createSessionDto.skipAvailabilityCheck) {
          console.log('Skipping availability check per request parameter');
          // Continue with session creation
        } else {
          throw new BadRequestException({
            message: "This session time is outside of the tutor's availability",
            tutorId,
            sessionTime: {
              day: dayOfWeek,
              start: `${sessionStartHour}:${sessionStartMinute.toString().padStart(2, '0')}`,
              end: `${sessionEndHour}:${sessionEndMinute.toString().padStart(2, '0')}`,
            },
            availableSlots: availabilitySlots.map((slot) => ({
              days: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
          });
        }
      }

      if (childId === undefined) {
        throw new BadRequestException('childId is required');
      }

      if (tutorId === undefined) {
        throw new BadRequestException('tutorId is required');
      }

      if (subjectId === undefined) {
        throw new BadRequestException('subjectId is required');
      }
      // Create the session
      const result = await this.database
        .insert(tutoringSchema.tutoringSessions)
        .values({
          childId,
          tutorId,
          subjectId,
          title: createSessionDto.title,
          description: createSessionDto.description,
          startTime: start,
          endTime: end,
          topic: createSessionDto.topic,
          cancelled: createSessionDto.cancelled ?? false,
          completed: createSessionDto.completed ?? false,
        })
        .returning();

      return result[0];
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error creating tutoring session:', error);
      throw new Error(`Failed to create tutoring session: ${error.message}`);
    }
  }

  /**
   * Update an existing tutoring session
   * @param updateSessionDto Data for updating the session
   * @returns The updated session
   */
  async updateSession(updateSessionDto: UpdateSessionDto) {
    try {
      const { sessionId, ...updateFields } = updateSessionDto;

      // Verify the session exists
      const session = await this.getSessionById(sessionId);
      if (!session) {
        throw new NotFoundException(`Session with ID ${sessionId} not found`);
      }

      // Prepare update data with proper data types
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Only include fields that were provided in the DTO
      if (updateFields.title !== undefined) {
        updateData.title = updateFields.title;
      }
      if (updateFields.description !== undefined) {
        updateData.description = updateFields.description;
      }
      if (updateFields.topic !== undefined) {
        updateData.topic = updateFields.topic;
      }
      if (updateFields.cancelled !== undefined) {
        updateData.cancelled = updateFields.cancelled;
      }
      if (updateFields.completed !== undefined) {
        updateData.completed = updateFields.completed;
      }
      if (updateFields.startTime !== undefined) {
        updateData.startTime = new Date(updateFields.startTime);
      }
      if (updateFields.endTime !== undefined) {
        updateData.endTime = new Date(updateFields.endTime);
      }

      // Update the session
      const [updatedSession] = await this.database
        .update(tutoringSchema.tutoringSessions)
        .set(updateData)
        .where(eq(tutoringSchema.tutoringSessions.sessionId, sessionId))
        .returning();

      return updatedSession;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating tutoring session:', error);
      throw new Error(`Failed to update tutoring session: ${error.message}`);
    }
  }

  /**
   * Cancel a session
   * @param sessionId The ID of the session to cancel
   * @returns The updated session
   */
  async cancelSession(sessionId: number) {
    try {
      // Verify the session exists
      const session = await this.getSessionById(sessionId);
      if (!session) {
        throw new NotFoundException(`Session with ID ${sessionId} not found`);
      }

      // Cancel the session
      const [updatedSession] = await this.database
        .update(tutoringSchema.tutoringSessions)
        .set({
          cancelled: true,
          updatedAt: new Date(),
        })
        .where(eq(tutoringSchema.tutoringSessions.sessionId, sessionId))
        .returning();

      return updatedSession;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error cancelling session:', error);
      throw new Error(`Failed to cancel session: ${error.message}`);
    }
  }

  /**
   * Mark a session as completed
   * This will update the session as completed and can trigger additional actions
   * like recording achievements or updating progress
   * @param sessionId The ID of the session to mark as completed
   * @param progressPercentage Optional progress percentage to update
   * @returns The updated session
   */
  async completeSession(sessionId: number, progressPercentage?: number) {
    try {
      // Verify the session exists
      const session = await this.getSessionById(sessionId);
      if (!session) {
        throw new NotFoundException(`Session with ID ${sessionId} not found`);
      }

      // Mark session as completed
      const [updatedSession] = await this.database
        .update(tutoringSchema.tutoringSessions)
        .set({
          completed: true,
          updatedAt: new Date(),
        })
        .where(eq(tutoringSchema.tutoringSessions.sessionId, sessionId))
        .returning();
        
      // Calculate session duration in hours
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // Round to 1 decimal place
      const roundedDuration = Math.round(durationHours * 10) / 10;
      
      // Convert duration to string for the database
      // const hoursSpentString = roundedDuration.toString();
      
      // Record learning hours for this session
      await this.recordLearningHours({
        childId: session.childId,
        subjectId: session.subjectId,
        hoursSpent: roundedDuration,
        sessionId: session.sessionId,
        description: `Completed session: ${session.title}`,
      });
      
      // If progress percentage is provided, update progress
      if (progressPercentage !== undefined) {
        await this.updateProgress({
          childId: session.childId,
          subjectId: session.subjectId,
          progressPercentage,
          sessionId: session.sessionId,
        });
      }

      return updatedSession;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error completing session:', error);
      throw new Error(`Failed to complete session: ${error.message}`);
    }
  }
}
