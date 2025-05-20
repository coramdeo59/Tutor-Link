import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { sessionStatus } from './schema/sessions.schema';

// Define interface for session objects
export interface TutoringSession {
  id: number;
  tutorId: number;
  childId: number;
  subjectId: number;
  title: string;
  notes?: string;
  status: typeof sessionStatus[number];
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SessionsService {
  // In-memory storage (temporary until DB integration)
  private sessions: TutoringSession[] = [];
  private nextId = 1;

  // Create a new tutoring session
  async createSession(tutorId: number, createSessionDto: CreateSessionDto): Promise<TutoringSession> {
    // Validate time logic
    const startTime = new Date(createSessionDto.startTime);
    const endTime = new Date(createSessionDto.endTime);
    
    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }
    
    // Calculate duration in minutes
    const durationMinutes = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    const newSession: TutoringSession = {
      id: this.nextId++,
      tutorId,
      childId: createSessionDto.childId,
      subjectId: createSessionDto.subjectId,
      title: createSessionDto.title,
      notes: createSessionDto.notes,
      status: createSessionDto.status || 'scheduled',
      startTime,
      endTime,
      durationMinutes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.sessions.push(newSession);
    return newSession;
  }

  // Get all sessions for a tutor
  async getSessionsByTutor(tutorId: number): Promise<TutoringSession[]> {
    return this.sessions.filter(session => session.tutorId === tutorId);
  }

  // Get all sessions for a specific child
  async getSessionsForChild(childId: number): Promise<TutoringSession[]> {
    return this.sessions.filter(session => session.childId === childId);
  }

  // Get a specific session by ID
  async getSessionById(id: number): Promise<TutoringSession> {
    const session = this.sessions.find(s => s.id === id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return session;
  }

  // Update an existing session
  async updateSession(id: number, tutorId: number, updateSessionDto: UpdateSessionDto): Promise<TutoringSession> {
    const sessionIndex = this.sessions.findIndex(s => s.id === id);
    if (sessionIndex === -1) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    
    const session = this.sessions[sessionIndex];
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
    
    // Create an updated session with all required fields
    const updatedSession: TutoringSession = {
      id: session.id,
      tutorId: session.tutorId,
      childId: session.childId,
      subjectId: session.subjectId,
      title: updateSessionDto.title || session.title,
      notes: updateSessionDto.notes || session.notes,
      status: (updateSessionDto.status as typeof sessionStatus[number]) || session.status,
      // Ensure we use our parsed Date objects
      startTime,
      endTime,
      durationMinutes,
      createdAt: session.createdAt,
      updatedAt: new Date()
    };
    
    // Update the session in our array
    this.sessions[sessionIndex] = updatedSession;
    
    return updatedSession;
  }

  // Cancel a session
  async cancelSession(id: number, tutorId: number): Promise<TutoringSession> {
    const sessionIndex = this.sessions.findIndex(s => s.id === id);
    if (sessionIndex === -1) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    
    const session = this.sessions[sessionIndex];
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    
    // Ensure the tutor is the owner of this session
    if (session.tutorId !== tutorId) {
      throw new BadRequestException('You can only cancel your own sessions');
    }
    
    // Create cancelled session with all fields properly set
    const cancelledSession: TutoringSession = {
      id: session.id,
      tutorId: session.tutorId,
      childId: session.childId,
      subjectId: session.subjectId,
      title: session.title,
      notes: session.notes,
      startTime: session.startTime,
      endTime: session.endTime,
      durationMinutes: session.durationMinutes,
      status: 'cancelled' as typeof sessionStatus[number],
      createdAt: session.createdAt,
      updatedAt: new Date()
    };
    
    // Update the session in our array
    this.sessions[sessionIndex] = cancelledSession;
    
    return cancelledSession;
  }

  // Complete a session (mark as completed)
  async completeSession(id: number, tutorId: number): Promise<TutoringSession> {
    const sessionIndex = this.sessions.findIndex(s => s.id === id);
    if (sessionIndex === -1) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    
    const session = this.sessions[sessionIndex];
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    
    // Ensure the tutor is the owner of this session
    if (session.tutorId !== tutorId) {
      throw new BadRequestException('You can only complete your own sessions');
    }
    
    // Create completed session with all fields properly set
    const completedSession: TutoringSession = {
      id: session.id,
      tutorId: session.tutorId,
      childId: session.childId,
      subjectId: session.subjectId,
      title: session.title,
      notes: session.notes,
      startTime: session.startTime,
      endTime: session.endTime,
      durationMinutes: session.durationMinutes,
      status: 'completed' as typeof sessionStatus[number],
      createdAt: session.createdAt,
      updatedAt: new Date()
    };
    
    // Update the session in our array
    this.sessions[sessionIndex] = completedSession;
    
    return completedSession;
  }
}
