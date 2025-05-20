import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// import { NodePgDatabase } from 'drizzle-orm/node-postgres';

// import { DATABASE_CONNECTION } from '../core/database-connection';

@Injectable()
export class SubjectsGradeService {
  constructor(
    // @Inject(DATABASE_CONNECTION)
    // private readonly database: NodePgDatabase,
  ) {}

  
  
  // Get all subjects
  async getAllSubjects() {
    try {
      return [
        { id: 1, name: 'Amharic' },
        { id: 2, name: 'English' },
        { id: 3, name: 'Mathematics' },
        { id: 4, name: 'Physics' },
        { id: 5, name: 'Chemistry' },
        { id: 6, name: 'Biology' },
        { id: 7, name: 'Geography' },
        { id: 8, name: 'History' },
        { id: 9, name: 'Civics' },
        { id: 10, name: 'Information Technology' },
      ];
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve subjects: ${error.message}`);
    }
  }

  // Get subject by ID
  async getSubjectById(id: number) {
    try {
      const subjects = await this.getAllSubjects();
      const subject = subjects.find(s => s.id === id);
      
      if (!subject) {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }
      
      return subject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve subject: ${error.message}`);
    }
  }

  // Get subjects for a tutor
  async getSubjectsForTutor(tutorId: number) {
    try {
      // Placeholder implementation
      return [
        { subjectId: 1, name: 'Amharic' },
        { subjectId: 2, name: 'English' },
        { subjectId: 3, name: 'Mathematics' },
        { subjectId: 4, name: 'Physics' },
        { subjectId: 5, name: 'Chemistry' },
        { subjectId: 6, name: 'Biology' },
        { subjectId: 7, name: 'Geography' },
        { subjectId: 8, name: 'History' },
        { subjectId: 9, name: 'Civics' },
        { subjectId: 10, name: 'Information Technology' },
      ];
    } catch (error) {
      throw new BadRequestException(`Failed to get tutor subjects: ${error.message}`);
    }
  }

  // Get subjects for a child
  async getSubjectsForChild(childId: number) {
    try {
      // Placeholder implementation with Ethiopian school context
      return [
        { id: 1, name: 'Amharic', description: 'Ethiopian national language and literature' },
        { id: 2, name: 'English', description: 'International language and communication' },
        { id: 3, name: 'Mathematics', description: 'Arithmetic, algebra, and problem solving' },
        { id: 7, name: 'Geography', description: 'Study of Earth landscapes, environments, and societies' },
      ];
    } catch (error) {
      throw new BadRequestException(`Failed to get child subjects: ${error.message}`);
    }
  }

  // GRADE LEVEL METHODS
  
  // Get all grade levels
  async getAllGradeLevels() {
    try {
   
      return [
        { id: 1, name: 'Grade 1' },
        { id: 2, name: 'Grade 2' },
        { id: 3, name: 'Grade 3' },
        { id: 4, name: 'Grade 4' },
        { id: 5, name: 'Grade 5' },
        { id: 6, name: 'Grade 6' },
        { id: 7, name: 'Grade 7' },
        { id: 8, name: 'Grade 8' },
        { id: 9, name: 'Grade 9' },
        { id: 10, name: 'Grade 10' },
        { id: 11, name: 'Grade 11' },
        { id: 12, name: 'Grade 12' },
      ];
      
      // When database is ready, use this instead:
      // return await this.database.select().from(gradeLevels);
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve grade levels: ${error.message}`);
    }
  }

  // Get grade level by ID
  async getGradeLevelById(id: number) {
    try {
      const grades = await this.getAllGradeLevels();
      const grade = grades.find(g => g.id === id);
      
      if (!grade) {
        throw new NotFoundException(`Grade level with ID ${id} not found`);
      }
      
      return grade;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve grade level: ${error.message}`);
    }
  }

  // Get grades for a tutor
  async getGradesForTutor(tutorId: number) {
    try {
      // Placeholder implementation with Ethiopian school context
      return [
        { gradeId: 5, name: 'Grade 5', description: 'Primary Second Cycle' },
        { gradeId: 6, name: 'Grade 6', description: 'Primary Second Cycle' },
        { gradeId: 7, name: 'Grade 7', description: 'Primary Second Cycle' },
        { gradeId: 8, name: 'Grade 8', description: 'Primary Second Cycle' },
      ];
    } catch (error) {
      throw new BadRequestException(`Failed to get tutor grades: ${error.message}`);
    }
  }

  // Get grade for a child
  async getGradeForChild(childId: number) {
    try {
      // Placeholder implementation with Ethiopian school context
      return { gradeId: 6, name: 'Grade 6', description: 'Primary Second Cycle' };
    } catch (error) {
      throw new BadRequestException(`Failed to get child grade: ${error.message}`);
    }
  }
}
