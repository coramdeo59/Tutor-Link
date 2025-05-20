// Types for child progress tracking

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Subject progress within a child's overall progress
export interface SubjectProgress {
  subjectId: number;
  name: string;
  progress: number;
  sessionCount: number;
  hoursSpent: number;
}

// Overall child progress data
export interface ChildProgress {
  childId: number;
  overallProgress: number;
  totalSessions: number;
  totalHours: number;
  upcomingSessions: number;
  subjectProgress: SubjectProgress[];
}

// Assessment data for subject details
export interface Assessment {
  assessmentId: number;
  score: number;
  date: Date;
  tutorName: string;
  notes?: string;
}

// Detailed subject progress information
export interface SubjectDetail {
  childId: number;
  subjectId: number;
  subjectName: string;
  progress: number;
  sessionCount: number;
  totalHoursSpent: number;
  recentAssessments: Assessment[];
}

// Upcoming session information
export interface UpcomingSession {
  sessionId: number;
  subject: string;
  tutorName: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

// List of upcoming sessions
export interface UpcomingSessions {
  childId: number;
  upcomingSessions: UpcomingSession[];
}

// Individual session history item
export interface SessionHistoryItem {
  sessionId: number;
  subject: string;
  tutorName: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  status: SessionStatus;
  notes?: string;
}

// Paginated session history
export interface SessionHistory {
  childId: number;
  totalSessions: number;
  totalPages: number;
  currentPage: number;
  sessions: SessionHistoryItem[];
}

// Query options for session history
export interface SessionQueryOptions {
  page?: number;
  pageSize?: number;
  subjectId?: number;
  status?: SessionStatus;
}
