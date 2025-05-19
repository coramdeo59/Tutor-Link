import { NextSessionDto } from './next-session.dto';

/**
 * DTO for returning child information
 * Used for presenting child data in the frontend
 */
export class ChildResponseDto {
  childId: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  age?: number | null;
  gradeName?: string | null;
  overallProgress?: number | null;
  nextSession?: NextSessionDto | null;
}
