import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { sessionStatus, tutoringSessions } from './schema/sessions.schema';
import { eq,} from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../../core/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

// Define interface for session objects
export interface TutoringSession {
  id: number;
  tutorId: number;
  childId: number;
  childName?: string;       // Added for frontend display
  subjectId: number;
  subject?: string;         // Added for frontend display
  title: string;
  notes?: string | null;    // Allow null value to match DB type
  status: typeof sessionStatus[number];
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<{
      tutoring_sessions: typeof tutoringSessions;
    }>,
  ) {}

  // Create a new tutoring session
  async createSession(tutorId: number, createSessionDto: CreateSessionDto): Promise<TutoringSession> {
    this.logger.log(`Creating new session for tutor ${tutorId}`);

    // Validate time logic
    const startTime = new Date(createSessionDto.startTime);
    const endTime = new Date(createSessionDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Calculate duration in minutes
    const durationMinutes = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    try {
      // Insert the new session into the database
      const result = await this.db
        .insert(tutoringSessions)
        .values({
          tutorId,
          childId: createSessionDto.childId,
          subjectId: createSessionDto.subjectId,
          title: createSessionDto.title,
          notes: createSessionDto.notes,
          status: createSessionDto.status || 'scheduled',
          startTime,
          endTime,
          durationMinutes,
        })
        .returning();
      
      // Check if we have a result
      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to create session - no result returned');
      }
      
      const newSession = result[0]!;  // Add non-null assertion
      this.logger.log(`Successfully created session with ID ${newSession.id}`);
      
      // Map to the expected return interface
      return {
        id: newSession.id,
        tutorId: newSession.tutorId,
        childId: newSession.childId,
        subjectId: newSession.subjectId,
        title: newSession.title,
        notes: newSession.notes,
        status: newSession.status as typeof sessionStatus[number],
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        durationMinutes: newSession.durationMinutes,
        createdAt: newSession.createdAt,
        updatedAt: newSession.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create session: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create tutoring session');
    }
  }

  // Get all sessions for a tutor
  async getSessionsByTutor(tutorId: number): Promise<TutoringSession[]> {
    try {
      const sessions = await this.db
        .select()
        .from(tutoringSessions)
        .where(eq(tutoringSessions.tutorId, tutorId));

      return sessions.map((session) => ({
        id: session.id,
        tutorId: session.tutorId,
        childId: session.childId,
        subjectId: session.subjectId,
        title: session.title,
        notes: session.notes,
        status: session.status as typeof sessionStatus[number],
        startTime: session.startTime,
        endTime: session.endTime,
        durationMinutes: session.durationMinutes,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch sessions for tutor ${tutorId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch tutor sessions');
    }
  }

  // Get all sessions for a specific child
  async getSessionsForChild(childId: number): Promise<TutoringSession[]> {
    try {
      const sessions = await this.db
        .select()
        .from(tutoringSessions)
        .where(eq(tutoringSessions.childId, childId));

      return sessions.map((session) => ({
        id: session.id,
        tutorId: session.tutorId,
        childId: session.childId,
        subjectId: session.subjectId,
        title: session.title,
        notes: session.notes,
        status: session.status as typeof sessionStatus[number],
        startTime: session.startTime,
        endTime: session.endTime,
        durationMinutes: session.durationMinutes,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch sessions for child ${childId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch child sessions');
    }
  }

  // Get a specific session by ID with child and subject details
  async getSessionById(id: number): Promise<TutoringSession> {
    try {
      const [session] = await this.db
        .select()
        .from(tutoringSessions)
        .where(eq(tutoringSessions.id, id));

      if (!session) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }
      
      // Get child details
      let childName: string | undefined = undefined;
      try {
        // Fetch child details from database - in real implementation
        // Here we're hardcoding for the demo
        childName = session.childId === 1 ? 'Student One' : `Student ${session.childId}`;
      } catch (error) {
        this.logger.warn(`Could not fetch child details for ID ${session.childId}: ${error.message}`);
      }
      
      // Get subject details
      let subjectName: string | undefined = undefined;
      try {
        // Fetch subject details - in real implementation
        // Here we're hardcoding for the demo
        const subjectMap: Record<number, string> = {
          1: 'Amharic',
          2: 'Mathematics',
          3: 'English',
          4: 'Physics',
          5: 'Chemistry'
        };
        subjectName = subjectMap[session.subjectId] || `Subject ${session.subjectId}`;
      } catch (error) {
        this.logger.warn(`Could not fetch subject details for ID ${session.subjectId}: ${error.message}`);
      }
      
      return {
        id: session.id,
        tutorId: session.tutorId,
        childId: session.childId,
        childName: childName,  // Include child name
        subjectId: session.subjectId,
        subject: subjectName,   // Include subject name
        title: session.title,
        notes: session.notes,
        status: session.status as typeof sessionStatus[number],
        startTime: session.startTime,
        endTime: session.endTime,
        durationMinutes: session.durationMinutes,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch session ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch session');
    }
  }

  // Update an existing session
  async updateSession(id: number, tutorId: number, updateSessionDto: UpdateSessionDto): Promise<TutoringSession> {
    try {
      const [session] = await this.db
        .select()
        .from(tutoringSessions)
        .where(eq(tutoringSessions.id, id));

      if (!session) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      // Ensure the tutor is the owner of this session
      if (session.tutorId !== tutorId) {
        throw new BadRequestException('You can only update your own sessions');
      }

      // Handle time updates if provided
      let startTime = session.startTime;
      let endTime = session.endTime;
      let durationMinutes = session.durationMinutes;

      if (updateSessionDto.startTime) {
        startTime = new Date(updateSessionDto.startTime);
      }

      if (updateSessionDto.endTime) {
        endTime = new Date(updateSessionDto.endTime);
      }

      // Validate time logic if either time is being updated
      if (updateSessionDto.startTime || updateSessionDto.endTime) {
        if (startTime >= endTime) {
          throw new BadRequestException('End time must be after start time');
        }
        // Recalculate duration if times changed
        durationMinutes = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      }

      // Update the session in the database
      const result = await this.db
        .update(tutoringSessions)
        .set({
          title: updateSessionDto.title || session.title,
          notes: updateSessionDto.notes || session.notes,
          status: updateSessionDto.status || session.status,
          startTime,
          endTime,
          durationMinutes,
          updatedAt: new Date(),
        })
        .where(eq(tutoringSessions.id, id))
        .returning();
      
      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to update session - no result returned');
      }
      
      const updatedSession = result[0]!;  // Add non-null assertion
      return {
        id: updatedSession.id,
        tutorId: updatedSession.tutorId,
        childId: updatedSession.childId,
        subjectId: updatedSession.subjectId,
        title: updatedSession.title,
        notes: updatedSession.notes,
        status: updatedSession.status as typeof sessionStatus[number],
        startTime: updatedSession.startTime,
        endTime: updatedSession.endTime,
        durationMinutes: updatedSession.durationMinutes,
        createdAt: updatedSession.createdAt,
        updatedAt: updatedSession.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update session ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update session');
    }
  }

  // Cancel a session
  async cancelSession(id: number, tutorId: number): Promise<TutoringSession> {
    try {
      const [session] = await this.db
        .select()
        .from(tutoringSessions)
        .where(eq(tutoringSessions.id, id));

      if (!session) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      // Ensure the tutor is the owner of this session
      if (session.tutorId !== tutorId) {
        throw new BadRequestException('You can only cancel your own sessions');
      }

      // Update the session status to cancelled
      const result = await this.db
        .update(tutoringSessions)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(tutoringSessions.id, id))
        .returning();
      
      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to cancel session - no result returned');
      }
      
      const cancelledSession = result[0]!;  // Add non-null assertion
      return {
        id: cancelledSession.id,
        tutorId: cancelledSession.tutorId,
        childId: cancelledSession.childId,
        subjectId: cancelledSession.subjectId,
        title: cancelledSession.title,
        notes: cancelledSession.notes,
        status: cancelledSession.status as typeof sessionStatus[number],
        startTime: cancelledSession.startTime,
        endTime: cancelledSession.endTime,
        durationMinutes: cancelledSession.durationMinutes,
        createdAt: cancelledSession.createdAt,
        updatedAt: cancelledSession.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to cancel session ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to cancel session');
    }
  }

  // Complete a session (mark as completed)
  async completeSession(id: number, tutorId: number): Promise<TutoringSession> {
    try {
      const [session] = await this.db
        .select()
        .from(tutoringSessions)
        .where(eq(tutoringSessions.id, id));

      if (!session) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      // Ensure the tutor is the owner of this session
      if (session.tutorId !== tutorId) {
        throw new BadRequestException('You can only complete your own sessions');
      }

      // Update the session status to completed
      const result = await this.db
        .update(tutoringSessions)
        .set({
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(tutoringSessions.id, id))
        .returning();
      
      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to complete session - no result returned');
      }
      
      const completedSession = result[0]!;  // Add non-null assertion
      return {
        id: completedSession.id,
        tutorId: completedSession.tutorId,
        childId: completedSession.childId,
        subjectId: completedSession.subjectId,
        title: completedSession.title,
        notes: completedSession.notes,
        status: completedSession.status as typeof sessionStatus[number],
        startTime: completedSession.startTime,
        endTime: completedSession.endTime,
        durationMinutes: completedSession.durationMinutes,
        createdAt: completedSession.createdAt,
        updatedAt: completedSession.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to complete session ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to complete session');
    }
  }

  // Update session status
  async updateSessionStatus(id: number, tutorId: number, status: typeof sessionStatus[number]): Promise<TutoringSession> {
    try {
      const [session] = await this.db
        .select()
        .from(tutoringSessions)
        .where(eq(tutoringSessions.id, id));

      if (!session) {
        throw new NotFoundException(`Session with ID ${id} not found`);
      }

      // Ensure the tutor is the owner of this session
      if (session.tutorId !== tutorId) {
        throw new BadRequestException('You can only update your own sessions');
      }

      // Update the session status
      const result = await this.db
        .update(tutoringSessions)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(tutoringSessions.id, id))
        .returning();
      
      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to update session status - no result returned');
      }
      
      const updatedSession = result[0]!;  // Add non-null assertion
      return {
        id: updatedSession.id,
        tutorId: updatedSession.tutorId,
        childId: updatedSession.childId,
        subjectId: updatedSession.subjectId,
        title: updatedSession.title,
        notes: updatedSession.notes,
        status: updatedSession.status as typeof sessionStatus[number],
        startTime: updatedSession.startTime,
        endTime: updatedSession.endTime,
        durationMinutes: updatedSession.durationMinutes,
        createdAt: updatedSession.createdAt,
        updatedAt: updatedSession.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to update session status ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update session status');
    }
  }
}