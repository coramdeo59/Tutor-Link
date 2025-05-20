/**
 * Interfaces for progress tracking model relationships
 */

// Subject interface
export interface Subject {
  subjectId: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ChildSubject interface
export interface ChildSubject {
  childSubjectId: number;
  childId: number;
  subjectId: number;
  enrollmentDate: Date;
  currentProgress: number;
  createdAt: Date;
  updatedAt: Date;
  subject?: Subject;
}

// Session interface
export interface Session {
  sessionId: number;
  childId: number;
  tutorId: number;
  subjectId: number;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  subject?: Subject;
}

// ProgressAssessment interface
export interface ProgressAssessment {
  assessmentId: number;
  sessionId: number;
  childId: number;
  subjectId: number;
  progressPercentage: number;
  assessmentDate: Date;
  tutorNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Return type for aggregated session data
export interface SessionAggregateResult {
  count: number;
  totalMinutes: number | null;
}
