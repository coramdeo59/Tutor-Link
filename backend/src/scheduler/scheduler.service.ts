import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../core/database-connection';
import { and, eq, gte, lte, ne, or } from 'drizzle-orm';
import * as schedulerSchema from './schema/scheduler.schema';
import * as parentSchema from '../users/parent/schema/parent.schema';
import * as tutorSchema from '../users/tutors/schema/tutor.schema';
import { CreateSessionDto, UpdateSessionDto, CancelSessionDto } from './dto/session.dto';
import { CreateAvailabilitySlotDto, CreateUnavailableDateDto, UpdateAvailabilitySlotDto } from './dto/availability.dto';
import { SessionStatus } from './schema/scheduler.schema';
// import { PaymentService } from '../payment/payment.service'; // Added for payment integration

@Injectable()
export class SchedulerService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<{
      tutoringSessions: typeof schedulerSchema.tutoringSessions;
      tutorAvailability: typeof schedulerSchema.tutorAvailability;
      tutorUnavailableDates: typeof schedulerSchema.tutorUnavailableDates;
      children: typeof parentSchema.children;
      tutors: typeof tutorSchema.tutors;
    }>,
  ) {}

  // ============ SESSION MANAGEMENT ============

  /**
   * Create a new tutoring session
   * @param createSessionDto - Session details
   * @param parentId - ID of the parent creating the session
   */
  async createSession(
    createSessionDto: CreateSessionDto,
    parentId: number,
  ): Promise<schedulerSchema.TutoringSession> {
    try {
      // Verify child belongs to parent
      const childBelongsToParent = await this.db.query.children.findFirst({
        where: and(
          eq(parentSchema.children.childId, createSessionDto.childId),
          eq(parentSchema.children.parentId, parentId)
        ),
      });
      
      if (!childBelongsToParent) {
        throw new ForbiddenException('You can only schedule sessions for your own children');
      }

      // Verify the tutor exists and is active
      const tutorExists = await this.db.query.tutors.findFirst({
        where: eq(tutorSchema.tutors.tutorId, createSessionDto.tutorId),
      });
      
      if (!tutorExists) {
        throw new NotFoundException('Tutor not found');
      }
      
      // Verify the date and time logic is correct
      if (new Date(createSessionDto.date) < new Date()) {
        throw new BadRequestException('Session date must be in the future');
      }

      if (new Date(createSessionDto.endTime) <= new Date(createSessionDto.startTime)) {
        throw new BadRequestException('End time must be after start time');
      }

      // Check for tutor availability during the requested slot
      const isAvailable = await this.checkTutorAvailability(
        createSessionDto.tutorId,
        createSessionDto.date,
        createSessionDto.startTime,
        createSessionDto.endTime,
      );

      if (!isAvailable) {
        throw new ConflictException('Tutor is not available during this time slot');
      }

      // Check for existing sessions (double booking)
      const existingSessions = await this.db.query.tutoringSessions.findMany({
        where: and(
          eq(schedulerSchema.tutoringSessions.tutorId, createSessionDto.tutorId),
          eq(schedulerSchema.tutoringSessions.date, new Date(createSessionDto.date)),
          or(
            // Check if new session starts during an existing session
            and(
              gte(schedulerSchema.tutoringSessions.startTime, new Date(createSessionDto.startTime)),
              lte(schedulerSchema.tutoringSessions.startTime, new Date(createSessionDto.endTime))
            ),
            // Check if new session ends during an existing session
            and(
              gte(schedulerSchema.tutoringSessions.endTime, new Date(createSessionDto.startTime)),
              lte(schedulerSchema.tutoringSessions.endTime, new Date(createSessionDto.endTime))
            ),
            // Check if new session completely encompasses an existing session
            and(
              lte(schedulerSchema.tutoringSessions.startTime, new Date(createSessionDto.startTime)),
              gte(schedulerSchema.tutoringSessions.endTime, new Date(createSessionDto.endTime))
            )
          ),
          ne(schedulerSchema.tutoringSessions.status, SessionStatus.CANCELLED)
        ),
      });

      if (existingSessions.length > 0) {
        throw new ConflictException('Tutor already has a session booked during this time');
      }

      // Validate subject and grade level info
      if (!createSessionDto.subjectName) {
        throw new BadRequestException('Subject name is required for session creation');
      }
      
      // Check if subject ID is provided but subject name is missing or vice versa
      if (createSessionDto.subjectId && !createSessionDto.subjectName) {
        throw new BadRequestException('Subject name is required when subject ID is provided');
      }
      
      // Same for grade level
      if (createSessionDto.gradeLevelId && !createSessionDto.gradeLevelName) {
        throw new BadRequestException('Grade level name is required when grade level ID is provided');
      }
      
      // Create the session with validated information
      const result = await this.db
        .insert(schedulerSchema.tutoringSessions)
        .values({
          tutorId: createSessionDto.tutorId,
          childId: createSessionDto.childId,
          // parentId: parentId,
          subjectId: createSessionDto.subjectId || null,
          subjectName: createSessionDto.subjectName,
          gradeLevelId: createSessionDto.gradeLevelId || null,
          gradeLevelName: createSessionDto.gradeLevelName || null,
          date: new Date(createSessionDto.date),
          startTime: new Date(createSessionDto.startTime),
          endTime: new Date(createSessionDto.endTime),
          durationMinutes: createSessionDto.durationMinutes,
          notes: createSessionDto.notes || '',
          status: SessionStatus.REQUESTED,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to create session');
      }
      
      return result[0] as schedulerSchema.TutoringSession;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error('Error creating session:', error);
      throw new InternalServerErrorException('Failed to create tutoring session');
    }
  }

  /**
   * Get a single tutoring session by ID
   * @param id - Session ID
   */
  async getSessionById(id: number): Promise<schedulerSchema.TutoringSession> {
    try {
      const session = await this.db.query.tutoringSessions.findFirst({
        where: eq(schedulerSchema.tutoringSessions.id, id),
      });

      if (!session) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      return session;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error fetching session ${id}:`, error);
      throw new InternalServerErrorException(`Failed to fetch session ${id}`);
    }
  }

  /**
   * Get all sessions for a tutor
   * @param tutorId - ID of the tutor
   */
  async getSessionsByTutor(tutorId: number): Promise<schedulerSchema.TutoringSession[]> {
    try {
      return await this.db.query.tutoringSessions.findMany({
        where: eq(schedulerSchema.tutoringSessions.tutorId, tutorId),
        orderBy: [schedulerSchema.tutoringSessions.date, schedulerSchema.tutoringSessions.startTime],
      });
    } catch (error) {
      console.error(`Error fetching sessions for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to fetch sessions for tutor ${tutorId}`);
    }
  }

  /**
   * Get all sessions for a child
   * @param childId - ID of the child
   */
  async getSessionsByChild(childId: number): Promise<schedulerSchema.TutoringSession[]> {
    try {
      return await this.db.query.tutoringSessions.findMany({
        where: eq(schedulerSchema.tutoringSessions.childId, childId),
        orderBy: [schedulerSchema.tutoringSessions.date, schedulerSchema.tutoringSessions.startTime],
      });
    } catch (error) {
      console.error(`Error fetching sessions for child ${childId}:`, error);
      throw new InternalServerErrorException(`Failed to fetch sessions for child ${childId}`);
    }
  }

  /**
   * Get all sessions for a parent (across all their children)
   * @param parentId - ID of the parent
   */
  async getSessionsByParent(parentId: number): Promise<schedulerSchema.TutoringSession[]> {
    try {
      return await this.db.query.tutoringSessions.findMany({
        // where: eq(schedulerSchema.tutoringSessions.parentId, parentId),
        orderBy: [schedulerSchema.tutoringSessions.date, schedulerSchema.tutoringSessions.startTime],
      });
    } catch (error) {
      console.error(`Error fetching sessions for parent ${parentId}:`, error);
      throw new InternalServerErrorException(`Failed to fetch sessions for parent ${parentId}`);
    }
  }

  /**
   * Update a tutoring session
   * @param id - Session ID
   * @param updateSessionDto - Updated session details
   */
  async updateSession(
    id: number,
    updateSessionDto: UpdateSessionDto,
  ): Promise<schedulerSchema.TutoringSession> {
    try {
      // Check if session exists
      const session = await this.getSessionById(id);

      // If updating date, start time or end time, check for conflicts
      if (
        updateSessionDto.date || 
        updateSessionDto.startTime || 
        updateSessionDto.endTime
      ) {
        const date = updateSessionDto.date || session.date;
        const startTime = updateSessionDto.startTime || session.startTime;
        const endTime = updateSessionDto.endTime || session.endTime;

        // Verify the date and time logic is correct
        if (new Date(date) < new Date()) {
          throw new BadRequestException('Session date must be in the future');
        }

        if (new Date(endTime) <= new Date(startTime)) {
          throw new BadRequestException('End time must be after start time');
        }

        // Check for tutor availability during the requested slot
        const isAvailable = await this.checkTutorAvailability(
          updateSessionDto.tutorId || session.tutorId,
          date,
          startTime,
          endTime,
        );

        if (!isAvailable) {
          throw new ConflictException('Tutor is not available during this time slot');
        }

        // Check for existing sessions (double booking)
        const existingSessions = await this.db.query.tutoringSessions.findMany({
          where: and(
            eq(schedulerSchema.tutoringSessions.tutorId, updateSessionDto.tutorId || session.tutorId),
            eq(schedulerSchema.tutoringSessions.date, new Date(date)),
            ne(schedulerSchema.tutoringSessions.id, id), // Exclude the current session
            or(
              // Check if session starts during an existing session
              and(
                gte(schedulerSchema.tutoringSessions.startTime, new Date(startTime)),
                lte(schedulerSchema.tutoringSessions.startTime, new Date(endTime))
              ),
              // Check if session ends during an existing session
              and(
                gte(schedulerSchema.tutoringSessions.endTime, new Date(startTime)),
                lte(schedulerSchema.tutoringSessions.endTime, new Date(endTime))
              ),
              // Check if session completely encompasses an existing session
              and(
                lte(schedulerSchema.tutoringSessions.startTime, new Date(startTime)),
                gte(schedulerSchema.tutoringSessions.endTime, new Date(endTime))
              )
            ),
            ne(schedulerSchema.tutoringSessions.status, SessionStatus.CANCELLED)
          ),
        });

        if (existingSessions.length > 0) {
          throw new ConflictException('Tutor already has a session booked during this time');
        }
      }

      // Update the session
      const result = await this.db
        .update(schedulerSchema.tutoringSessions)
        .set({
          ...updateSessionDto,
          updatedAt: new Date(),
        })
        .where(eq(schedulerSchema.tutoringSessions.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException(`Failed to update session ${id}`);
      }
      
      return result[0] as schedulerSchema.TutoringSession;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error(`Error updating session ${id}:`, error);
      throw new InternalServerErrorException(`Failed to update session ${id}`);
    }
  }

  /**
   * Cancel a tutoring session
   * @param id - Session ID
   * @param cancelSessionDto - Cancellation details
   * @param userId - ID of the user cancelling the session
   */
  async cancelSession(
    id: number,
    cancelSessionDto: CancelSessionDto,
    userId: number,
  ): Promise<schedulerSchema.TutoringSession> {
    try {
      // Check if session exists
      await this.getSessionById(id);

      // Update the session status to cancelled
      const result = await this.db
        .update(schedulerSchema.tutoringSessions)
        .set({
          status: SessionStatus.CANCELLED,
          cancelledBy: userId,
          cancellationReason: cancelSessionDto.cancellationReason,
          updatedAt: new Date(),
        })
        .where(eq(schedulerSchema.tutoringSessions.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException(`Failed to cancel session ${id}`);
      }
      
      return result[0] as schedulerSchema.TutoringSession;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error cancelling session ${id}:`, error);
      throw new InternalServerErrorException(`Failed to cancel session ${id}`);
    }
  }

  // ============ AVAILABILITY MANAGEMENT ============

  /**
   * Add a new availability slot for a tutor
   * @param tutorId - ID of the tutor
   * @param createAvailabilityDto - Availability details
   */
  async addAvailabilitySlot(
    tutorId: number,
    createAvailabilityDto: CreateAvailabilitySlotDto,
  ): Promise<schedulerSchema.TutorAvailability[]> {
    try {
      // Validate time range
      const startTime = new Date(createAvailabilityDto.startTime);
      const endTime = new Date(createAvailabilityDto.endTime);

      if (startTime >= endTime) {
        throw new BadRequestException(
          'Start time must be earlier than end time',
        );
      }

      const createdSlots: schedulerSchema.TutorAvailability[] = [];

      // Create availability slots for each day of the week
      for (const dayOfWeek of createAvailabilityDto.daysOfWeek) {
        const result = await this.db
          .insert(schedulerSchema.tutorAvailability)
          .values({
            tutorId,
            dayOfWeek,
            startTime: new Date(createAvailabilityDto.startTime),
            endTime: new Date(createAvailabilityDto.endTime),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        if (!result || result.length === 0) {
          throw new InternalServerErrorException(`Failed to add availability for tutor ${tutorId} on ${dayOfWeek}`);
        }
        
        createdSlots.push(result[0] as schedulerSchema.TutorAvailability);
      }
      
      return createdSlots;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error adding availability for tutor', tutorId, ':', error);
      throw new InternalServerErrorException(
        `Failed to add availability for tutor ${tutorId}`,
      );
    }
  }

  /**
   * Update an existing availability slot
   * @param id - Availability slot ID
   * @param updateAvailabilityDto - Updated availability details
   */
  async updateAvailabilitySlot(
    id: number,
    updateAvailabilityDto: UpdateAvailabilitySlotDto,
  ): Promise<schedulerSchema.TutorAvailability> {
    try {
      // Check if availability slot exists
      const availability = await this.db.query.tutorAvailability.findFirst({
        where: eq(schedulerSchema.tutorAvailability.id, id),
      });

      if (!availability) {
        throw new NotFoundException(`Availability slot with ID ${id} not found`);
      }

      // If updating start or end time, verify the logic is correct
      if (updateAvailabilityDto.startTime || updateAvailabilityDto.endTime) {
        const startTime = updateAvailabilityDto.startTime || availability.startTime;
        const endTime = updateAvailabilityDto.endTime || availability.endTime;

        if (new Date(endTime) <= new Date(startTime)) {
          throw new BadRequestException('End time must be after start time');
        }
      }

      // Update the availability slot
      const result = await this.db
        .update(schedulerSchema.tutorAvailability)
        .set({
          ...updateAvailabilityDto,
          updatedAt: new Date(),
        })
        .where(eq(schedulerSchema.tutorAvailability.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException(`Failed to update availability slot ${id}`);
      }
      
      // Type assertion to handle potential undefined
      return result[0] as schedulerSchema.TutorAvailability;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.error(`Error updating availability slot ${id}:`, error);
      throw new InternalServerErrorException(`Failed to update availability slot ${id}`);
    }
  }

  /**
   * Delete an availability slot
   * @param id - Availability slot ID
   */
  async deleteAvailabilitySlot(id: number): Promise<{ message: string }> {
    try {
      // Check if availability slot exists
      const availability = await this.db.query.tutorAvailability.findFirst({
        where: eq(schedulerSchema.tutorAvailability.id, id),
      });

      if (!availability) {
        throw new NotFoundException(`Availability slot with ID ${id} not found`);
      }

      // Delete the availability slot
      await this.db
        .delete(schedulerSchema.tutorAvailability)
        .where(eq(schedulerSchema.tutorAvailability.id, id));

      return { message: 'Availability slot deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error deleting availability slot ${id}:`, error);
      throw new InternalServerErrorException(`Failed to delete availability slot ${id}`);
    }
  }

  /**
   * Get all availability slots for a tutor
   * @param tutorId - ID of the tutor
   */
  async getAvailabilityByTutor(tutorId: number): Promise<schedulerSchema.TutorAvailability[]> {
    try {
      return await this.db.query.tutorAvailability.findMany({
        where: eq(schedulerSchema.tutorAvailability.tutorId, tutorId),
      });
    } catch (error) {
      console.error(`Error fetching availability for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to fetch availability for tutor ${tutorId}`);
    }
  }

  /**
   * Add a new unavailable date for a tutor
   * @param tutorId - ID of the tutor
   * @param createUnavailableDateDto - Unavailable date details
   */
  async addUnavailableDate(
    tutorId: number,
    createUnavailableDateDto: CreateUnavailableDateDto,
  ): Promise<schedulerSchema.TutorUnavailableDate> {
    try {
      // Create the unavailable date entry
      const result = await this.db
        .insert(schedulerSchema.tutorUnavailableDates)
        .values({
          tutorId,
          date: new Date(createUnavailableDateDto.date),
          reason: createUnavailableDateDto.reason,
          createdAt: new Date(),
        })
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException(`Failed to add unavailable date for tutor ${tutorId}`);
      }
      
      // Type assertion to handle potential undefined
      return result[0] as schedulerSchema.TutorUnavailableDate;
    } catch (error) {
      console.error(`Error adding unavailable date for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to add unavailable date for tutor ${tutorId}`);
    }
  }

  /**
   * Delete an unavailable date
   * @param id - Unavailable date ID
   */
  async deleteUnavailableDate(id: number): Promise<{ message: string }> {
    try {
      // Check if unavailable date exists
      const unavailableDate = await this.db.query.tutorUnavailableDates.findFirst({
        where: eq(schedulerSchema.tutorUnavailableDates.id, id),
      });

      if (!unavailableDate) {
        throw new NotFoundException(`Unavailable date with ID ${id} not found`);
      }

      // Delete the unavailable date
      await this.db
        .delete(schedulerSchema.tutorUnavailableDates)
        .where(eq(schedulerSchema.tutorUnavailableDates.id, id));

      return { message: 'Unavailable date deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error deleting unavailable date ${id}:`, error);
      throw new InternalServerErrorException(`Failed to delete unavailable date ${id}`);
    }
  }

  /**
   * Get all unavailable dates for a tutor
   * @param tutorId - ID of the tutor
   */
  async getUnavailableDatesByTutor(tutorId: number): Promise<schedulerSchema.TutorUnavailableDate[]> {
    try {
      return await this.db.query.tutorUnavailableDates.findMany({
        where: eq(schedulerSchema.tutorUnavailableDates.tutorId, tutorId),
      });
    } catch (error) {
      console.error(`Error fetching unavailable dates for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to fetch unavailable dates for tutor ${tutorId}`);
    }
  }

  // ============ HELPER METHODS ============

  /**
   * Check if a tutor is available during a specific time slot
   * This checks both recurring availability and specific unavailable dates
   * @param tutorId - ID of the tutor
   * @param date - Date of the session
   * @param startTime - Start time of the session
   * @param endTime - End time of the session
   */
  private async checkTutorAvailability(
    tutorId: number,
    date: Date | string,
    startTime: Date | string,
    endTime: Date | string,
  ): Promise<boolean> {
    try {
      const sessionDate = new Date(date);
      const sessionStartTime = new Date(startTime);
      const sessionEndTime = new Date(endTime);

      if (
        isNaN(sessionDate.getTime()) ||
        isNaN(sessionStartTime.getTime()) ||
        isNaN(sessionEndTime.getTime())
      ) {
        console.error(
          `Invalid date/time string received in checkTutorAvailability. TutorId: ${tutorId}`,
          { date, startTime, endTime },
        );
        throw new BadRequestException(
          'Invalid date or time format provided for session scheduling.',
        );
      }
      
      // Convert date to day of week (Monday, Tuesday, etc.)
      const dayOfWeek = sessionDate.toLocaleDateString('en-US', { weekday: 'long' });
      console.log(`Checking availability for tutor ${tutorId} on ${dayOfWeek}`);

      // 1. Check if the tutor has marked this specific date as unavailable
      const formattedDate = sessionDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      console.log(`Checking unavailable dates for ${formattedDate}`);
      
      const unavailableDates = await this.db.query.tutorUnavailableDates.findMany({
        where: eq(schedulerSchema.tutorUnavailableDates.tutorId, tutorId),
      });
      
      for (const unavailableDate of unavailableDates) {
        const unavailableDateFormatted = new Date(unavailableDate.date).toISOString().split('T')[0];
        if (unavailableDateFormatted === formattedDate) {
          console.log(`Tutor ${tutorId} has marked ${formattedDate} as unavailable`);
          return false;
        }
      }

      // 2. Check if the tutor has availability slots that cover this time
      console.log(`Looking for availability slots on ${dayOfWeek}`);
      const availabilitySlots = await this.db.query.tutorAvailability.findMany({
        where: and(
          eq(schedulerSchema.tutorAvailability.tutorId, tutorId),
          eq(schedulerSchema.tutorAvailability.dayOfWeek, dayOfWeek),
        ),
      });
      
      console.log(`Found ${availabilitySlots.length} availability slots`);
      
      if (availabilitySlots.length === 0) {
        return false; // No availability slots for this day of week
      }

      // Convert session times to minutes since midnight for easier comparison
      const sessionStartMinutes = sessionStartTime.getHours() * 60 + sessionStartTime.getMinutes();
      const sessionEndMinutes = sessionEndTime.getHours() * 60 + sessionEndTime.getMinutes();
      
      // Check if any availability slot covers the requested time
      for (const slot of availabilitySlots) {
        // Convert slot times to minutes since midnight
        const slotStartMinutes = slot.startTime.getHours() * 60 + slot.startTime.getMinutes();
        const slotEndMinutes = slot.endTime.getHours() * 60 + slot.endTime.getMinutes();
        
        console.log(`Checking slot: ${slotStartMinutes}-${slotEndMinutes} against session: ${sessionStartMinutes}-${sessionEndMinutes}`);
        
        // Check if the slot fully contains the requested session time
        if (slotStartMinutes <= sessionStartMinutes && slotEndMinutes >= sessionEndMinutes) {
          console.log(`Found matching availability slot`);
          return true; // Tutor is available during this time
        }
      }

      console.log(`No suitable availability slot found for tutor ${tutorId}`);
      return false; // No suitable availability slot found
    } catch (error) {
      console.error(`Error checking tutor ${tutorId} availability:`, error);
      throw new InternalServerErrorException(`Failed to check tutor ${tutorId} availability`);
    }
  }
}
