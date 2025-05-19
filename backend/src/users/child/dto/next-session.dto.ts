export class NextSessionDto {
  sessionId: number;
  tutorId: number;
  tutorName: string;
  tutorPhotoUrl?: string | null;
  subjectId: number;
  subjectName: string;
  sessionDateTime: Date;
  durationMinutes: number;
}
