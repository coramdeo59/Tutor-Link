import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database-connection';
import * as tutorSchema from './schema/tutor.schema';
import { AddSubjectDto } from './dto/subject.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class TutorsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<{
      tutors: typeof tutorSchema.tutors;
      tutorSubjects: typeof tutorSchema.tutorSubjects;
      tutorGrades: typeof tutorSchema.tutorGrades;
      tutorAvailability: typeof tutorSchema.tutorAvailability;
      tutorVerifications: typeof tutorSchema.tutorVerifications;
    }>,
  ) {}

  async findAll() {
    try {
      // Get all tutors first
      const tutors = await this.db.select().from(tutorSchema.tutors);
      
      // For each tutor, manually fetch their subjects and grades
      const tutorsWithData = await Promise.all(tutors.map(async (tutor) => {
        // Get subjects for this tutor
        const subjects = await this.db.select()
          .from(tutorSchema.tutorSubjects)
          .where(eq(tutorSchema.tutorSubjects.tutorId, tutor.tutorId));
          
        // Get grades for this tutor
        const grades = await this.db.select()
          .from(tutorSchema.tutorGrades)
          .where(eq(tutorSchema.tutorGrades.tutorId, tutor.tutorId));
          
        // Return the tutor with their related data
        return {
          ...tutor,
          subjects,
          grades
        };
      }));
      
      console.log(`Found ${tutors.length} tutors with related data`);
      return tutorsWithData;
    } catch (error) {
      console.error('Error fetching tutors:', error);
      throw new InternalServerErrorException('Failed to fetch tutors');
    }
  }

  async findOne(id: number) {
    try {
      // Get the tutor first
      const tutorResult = await this.db.select()
        .from(tutorSchema.tutors)
        .where(eq(tutorSchema.tutors.tutorId, id));
        
      if (!tutorResult || tutorResult.length === 0) {
        return null;
      }
      
      const tutor = tutorResult[0];
      
      // Get all related data separately
      const subjects = await this.db.select()
        .from(tutorSchema.tutorSubjects)
        .where(eq(tutorSchema.tutorSubjects.tutorId, id));
        
      const grades = await this.db.select()
        .from(tutorSchema.tutorGrades)
        .where(eq(tutorSchema.tutorGrades.tutorId, id));
        
      const availability = await this.db.select()
        .from(tutorSchema.tutorAvailability)
        .where(eq(tutorSchema.tutorAvailability.tutorId, id));
        
      const verifications = await this.db.select()
        .from(tutorSchema.tutorVerifications)
        .where(eq(tutorSchema.tutorVerifications.tutorId, id));
      
      // Combine all data
      const tutorWithRelations = {
        ...tutor,
        subjects,
        grades,
        availability,
        verifications
      };

      if (!tutorWithRelations) {
        throw new NotFoundException(`Tutor with ID ${id} not found`);
      }

      console.log(`Found tutor ${id} with related data`);
      return tutorWithRelations;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error fetching tutor ${id}:`, error);
      throw new InternalServerErrorException(`Failed to fetch tutor ${id}`);
    }
  }

  async create(createTutorDto: any) {
    try {
      // Check if email already exists
      if (createTutorDto.email) {
        const existingTutor = await this.db.query.tutors.findFirst({
          where: eq(tutorSchema.tutors.email, createTutorDto.email),
        });

        if (existingTutor) {
          throw new ConflictException('Email already in use');
        }
      }

      // Ensure required fields are present
      const required = ['email', 'password', 'firstName', 'lastName', 'phoneNumber'];
      for (const field of required) {
        if (!createTutorDto[field]) {
          throw new ConflictException(`${field} is required`);
        }
      }

      const [newTutor] = await this.db
        .insert(tutorSchema.tutors)
        .values(createTutorDto as any)
        .returning();

      return newTutor;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error creating tutor:', error);
      throw new InternalServerErrorException('Failed to create tutor');
    }
  }

  async update(id: number, updateTutorDto: any) {
    try {
      // Check if tutor exists
      await this.findOne(id);

      const [updatedTutor] = await this.db
        .update(tutorSchema.tutors)
        .set({ ...updateTutorDto, updatedAt: new Date() })
        .where(eq(tutorSchema.tutors.tutorId, id))
        .returning();

      return updatedTutor;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error updating tutor ${id}:`, error);
      throw new InternalServerErrorException(`Failed to update tutor ${id}`);
    }
  }

  async remove(id: number) {
    try {
      // Check if tutor exists
      await this.findOne(id);

      await this.db
        .delete(tutorSchema.tutors)
        .where(eq(tutorSchema.tutors.tutorId, id));

      return { message: `Tutor with ID ${id} deleted successfully` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error deleting tutor ${id}:`, error);
      throw new InternalServerErrorException(`Failed to delete tutor ${id}`);
    }
  }

  // Subjects Management
  async addSubjects(tutorId: number, subjects: AddSubjectDto[]) {
    try {
      if (!subjects || subjects.length === 0) {
        throw new NotFoundException('No subjects provided');
      }

      const newSubjects: tutorSchema.TutorSubject[] = [];

      for (const subject of subjects) {
        // Each subject must have a name based on our updated DTO
        if (!subject.subjectName) {
          throw new Error('Subject name is required');
        }

        // Store the subject with the tutor ID and subject name
        const result = await this.db
          .insert(tutorSchema.tutorSubjects)
          .values({
            tutorId,
            subjectName: subject.subjectName,
          })
          .returning();
        
        if (result && result.length > 0 && result[0]) {
          // Type assertion to fix TypeScript error
          const subjectToAdd = result[0] as tutorSchema.TutorSubject;
          newSubjects.push(subjectToAdd);
        }
      }
      
      return newSubjects;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error adding subjects for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to add subjects for tutor ${tutorId}`);
    }
  }
  
  async getSubjects(tutorId: number) {
    try {
      // Check if tutor exists
      await this.findOne(tutorId);
      
      return await this.db
        .select()
        .from(tutorSchema.tutorSubjects)
        .where(eq(tutorSchema.tutorSubjects.tutorId, tutorId));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error fetching subjects for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to fetch subjects for tutor ${tutorId}`);
    }
  }
  
  // Grades Management
  async addGrades(tutorId: number, grades: { gradeLevelName: string }[]) {
    try {
      if (!grades || grades.length === 0) {
        throw new NotFoundException('No grade levels provided');
      }

      const newGrades: tutorSchema.TutorGrade[] = [];

      for (const grade of grades) {
        // Each grade must have a name based on our updated DTO
        if (!grade.gradeLevelName) {
          throw new Error('Grade level name is required');
        }

        // Store the grade level with the tutor ID and grade level name
        const result = await this.db
          .insert(tutorSchema.tutorGrades)
          .values({
            tutorId,
            gradeName: grade.gradeLevelName,
          })
          .returning();
        
        if (result && result.length > 0 && result[0]) {
          // Type assertion to fix TypeScript error
          const gradeToAdd = result[0] as tutorSchema.TutorGrade;
          newGrades.push(gradeToAdd);
        }
      }
      
      return newGrades;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error adding grades for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to add grades for tutor ${tutorId}`);
    }
  }
  
  async getGrades(tutorId: number) {
    try {
      // Check if tutor exists
      await this.findOne(tutorId);
      
      return await this.db
        .select()
        .from(tutorSchema.tutorGrades)
        .where(eq(tutorSchema.tutorGrades.tutorId, tutorId));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error fetching grades for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to fetch grades for tutor ${tutorId}`);
    }
  }
  
  // Availability Management
  async addAvailability(tutorId: number, slots: { dayOfWeek: string, startTime: Date, endTime: Date }[]) {
    try {
      // Check if tutor exists
      await this.findOne(tutorId);
      
      const insertedSlots: tutorSchema.TutorAvailabilitySlot[] = [];
      
      // Insert each availability slot
      for (const slot of slots) {
        const [newSlot] = await this.db
          .insert(tutorSchema.tutorAvailability)
          .values({
            tutorId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })
          .returning();
          
        if (newSlot) {
          insertedSlots.push(newSlot);
        }
      }
      
      return insertedSlots;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error adding availability for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to add availability for tutor ${tutorId}`);
    }
  }
  
  async getAvailability(tutorId: number) {
    try {
      // Check if tutor exists
      await this.findOne(tutorId);
      
      return await this.db
        .select()
        .from(tutorSchema.tutorAvailability)
        .where(eq(tutorSchema.tutorAvailability.tutorId, tutorId));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error fetching availability for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to fetch availability for tutor ${tutorId}`);
    }
  }
  
  // Verification Management
  async addVerification(tutorId: number, verificationData: Partial<tutorSchema.NewTutorVerification>) {
    try {
      // Check if tutor exists
      await this.findOne(tutorId);
      
      // Check if verification already exists
      const existingVerification = await this.db
        .select()
        .from(tutorSchema.tutorVerifications)
        .where(eq(tutorSchema.tutorVerifications.tutorId, tutorId))
        .limit(1);
        
      if (existingVerification.length > 0) {
        // Update existing verification
        const [updatedVerification] = await this.db
          .update(tutorSchema.tutorVerifications)
          .set({
            ...verificationData,
            updatedAt: new Date(),
          })
          .where(eq(tutorSchema.tutorVerifications.tutorId, tutorId))
          .returning();
          
        return updatedVerification;
      } else {
        // Create new verification
        const [newVerification] = await this.db
          .insert(tutorSchema.tutorVerifications)
          .values({
            tutorId,
            ...verificationData,
          })
          .returning();
          
        return newVerification;
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error managing verification for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to manage verification for tutor ${tutorId}`);
    }
  }
  
  async getVerification(tutorId: number) {
    try {
      // Check if tutor exists
      await this.findOne(tutorId);
      
      const verification = await this.db
        .select()
        .from(tutorSchema.tutorVerifications)
        .where(eq(tutorSchema.tutorVerifications.tutorId, tutorId))
        .limit(1);
        
      if (verification.length === 0) {
        return null; // No verification data yet
      }
      
      return verification[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error fetching verification for tutor ${tutorId}:`, error);
      throw new InternalServerErrorException(`Failed to fetch verification for tutor ${tutorId}`);
    }
  }
} 