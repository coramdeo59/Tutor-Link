/**
 * Enum for session status
 * Used to track the state of a session
 */
export enum SessionStatus {
  SCHEDULED = 'scheduled',   // Session is scheduled but not yet started
  IN_PROGRESS = 'in_progress', // Session is currently in progress
  COMPLETED = 'completed',    // Session has been completed
  CANCELLED = 'cancelled',    // Session was cancelled
  PENDING = 'pending'        // Session is awaiting confirmation
}
