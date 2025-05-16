import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../core/database-connection';
import * as tutorSchema from '../schema/Tutor-schema';
import * as userSchema from '../schema/User-schema';
import * as subjectGradeSchema from '../schema/SubjectGrade-schema';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { CreateVerificationDetailsDto } from './dto/create-verification-details.dto'; // Import DTO
import { eq } from 'drizzle-orm';

// Infer types for Drizzle ORM
export type Tutor = typeof tutorSchema.tutors.$inferSelect;
export type NewTutor = typeof tutorSchema.tutors.$inferInsert;
export type VerificationDetails =
  typeof tutorSchema.verificationDetails.$inferSelect;
export type TutorAvailabilitySlot =
  typeof tutorSchema.tutorAvailabilitySlots.$inferSelect;

@Injectable()
export class TutorsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      users: typeof userSchema.users;
      tutors: typeof tutorSchema.tutors;
      verificationDetails: typeof tutorSchema.verificationDetails;
      tutorAvailabilitySlots: typeof tutorSchema.tutorAvailabilitySlots;
      subjects: typeof subjectGradeSchema.subjects;
      gradeLevels: typeof subjectGradeSchema.gradeLevels;
    }>,
  ) {}

  /**
   * Creates a new tutor profile.
   * Assumes the user already exists and their ID is provided as tutorId.
   * The `isVerified` field defaults to false as per the schema.
   */
  async createTutorProfile(
    userId: number,
    createTutorProfileDto: CreateTutorProfileDto,
  ): Promise<Tutor> {
    // 1. Check if the user exists
    const userExists = await this.database.query.users.findFirst({
      where: eq(userSchema.users.userId, userId),
    });
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // 2. Check if a tutor profile already exists for this user
    const existingTutorProfile = await this.database.query.tutors.findFirst({
      where: eq(tutorSchema.tutors.tutorId, userId),
    });
    if (existingTutorProfile) {
      throw new ConflictException(
        `Tutor profile already exists for user ID ${userId}.`,
      );
    }

    // 3. Validate that the subject exists
    const subjectExists = await this.database.query.subjects.findFirst({
      where: eq(
        subjectGradeSchema.subjects.subjectId,
        createTutorProfileDto.subjectId,
      ),
    });

    if (!subjectExists) {
      throw new BadRequestException(
        `Subject with ID ${createTutorProfileDto.subjectId} not found.`,
      );
    }

    // 4. Validate that the grade level exists
    const gradeLevelExists = await this.database.query.gradeLevels.findFirst({
      where: eq(
        subjectGradeSchema.gradeLevels.gradeId,
        createTutorProfileDto.gradeId,
      ),
    });

    if (!gradeLevelExists) {
      throw new BadRequestException(
        `Grade level with ID ${createTutorProfileDto.gradeId} not found.`,
      );
    }

    // 5. Create the tutor profile
    try {
      const [newTutor] = await this.database
        .insert(tutorSchema.tutors)
        .values({
          tutorId: userId, // Link to the existing user
          bio: createTutorProfileDto.bio,
          subjectId: createTutorProfileDto.subjectId,
          gradeId: createTutorProfileDto.gradeId,
          // isVerified defaults to false in the schema
        })
        .returning();

      if (!newTutor) {
        throw new InternalServerErrorException(
          'Failed to create tutor profile after insert.',
        );
      }
      return newTutor;
    } catch (error) {
      console.error(
        `Error creating tutor profile for user ID ${userId}:`,
        error,
      );
      throw new InternalServerErrorException('Could not create tutor profile.');
    }
  }

  /**
   * Retrieves a tutor's profile by their user ID.
   */
  async getTutorProfile(userId: number): Promise<Tutor> {
    const tutor = await this.database.query.tutors.findFirst({
      where: eq(tutorSchema.tutors.tutorId, userId),
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor profile not found for user ID ${userId}`);
    }

    return tutor;
  }
  
  /**
   * Gets the application status of a tutor
   * @param tutorId The ID of the tutor (which is also the userId)
   * @returns Object containing the verification status and other relevant status information
   */
  async getTutorApplicationStatus(tutorId: number): Promise<{
    verificationStatus: string;
    backgroundCheckStatus: string;
    documentVerified: boolean;
    interviewScheduled: boolean;
    isVerified: boolean;
    rejectionReason?: string;
    pendingStep?: string;
  }> {
    const tutor = await this.database.query.tutors.findFirst({
      where: eq(tutorSchema.tutors.tutorId, tutorId),
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor profile not found for user ID ${tutorId}`);
    }
    
    // Determine which step is pending in the verification process
    let pendingStep: string | undefined;
    
    if (tutor.verificationStatus === 'pending') {
      if (!tutor.documentVerified) {
        pendingStep = 'document_verification';
      } else if (tutor.backgroundCheckStatus === 'pending') {
        pendingStep = 'background_check';
      } else if (!tutor.interviewScheduled) {
        pendingStep = 'interview_scheduling';
      } else {
        pendingStep = 'admin_review';
      }
    }

    return {
      verificationStatus: tutor.verificationStatus,
      backgroundCheckStatus: tutor.backgroundCheckStatus,
      documentVerified: tutor.documentVerified,
      interviewScheduled: tutor.interviewScheduled,
      isVerified: tutor.isVerified,
      rejectionReason: tutor.rejectionReason || undefined,
      pendingStep,
    };
  }

  /**
   * Creates verification details for a tutor.
   * The tutor profile must exist.
   * Throws a ConflictException if verification details already exist for the tutor.
   * @param tutorId The ID of the tutor (which is also the userId).
   * @param createVerificationDetailsDto DTO containing verification details.
   * @returns The created verification details.
   */
  async createVerificationDetails(
    tutorId: number,
    createVerificationDetailsDto: CreateVerificationDetailsDto,
  ): Promise<VerificationDetails> {
    // 1. Check if the tutor profile exists (tutorId is the userId)
    const tutorProfile = await this.database.query.tutors.findFirst({
      where: eq(tutorSchema.tutors.tutorId, tutorId),
    });
    if (!tutorProfile) {
      throw new NotFoundException(
        `Tutor profile not found for user ID ${tutorId}. Cannot create verification details.`,
      );
    }

    // 2. Check if verification details already exist for this tutor
    const existingDetails =
      await this.database.query.verificationDetails.findFirst({
        where: eq(tutorSchema.verificationDetails.tutorId, tutorId),
      });
    if (existingDetails) {
      throw new ConflictException(
        `Verification details already exist for tutor ID ${tutorId}.`,
      );
    }

    // 3. Create the verification details
    try {
      const [newDetails] = await this.database
        .insert(tutorSchema.verificationDetails)
        .values({
          tutorId: tutorId,
          documentUpload: createVerificationDetailsDto.documentUpload, // Corrected
          cvUpload: createVerificationDetailsDto.cvUpload, // Corrected
          kebeleIdUpload: createVerificationDetailsDto.kebeleIdUpload, // Corrected
          nationalIdUpload: createVerificationDetailsDto.nationalIdUpload, // Corrected
          fanNumber: createVerificationDetailsDto.fanNumber,
          // verificationDate and isVerified are handled by database defaults or later updates
        })
        .returning();

      if (!newDetails) {
        throw new InternalServerErrorException(
          'Failed to create verification details after insert.',
        );
      }
      return newDetails;
    } catch (error) {
      console.error(
        `Error creating verification details for tutor ID ${tutorId}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Could not create verification details.',
      );
    }
  }

  /**
   * Retrieves verification details for a tutor by their user ID.
   * @param tutorId The ID of the tutor (which is also the userId).
   * @returns The verification details.
   */
  async getVerificationDetails(tutorId: number): Promise<VerificationDetails> {
    const details = await this.database.query.verificationDetails.findFirst({
      where: eq(tutorSchema.verificationDetails.tutorId, tutorId),
    });

    if (!details) {
      throw new NotFoundException(
        `Verification details not found for tutor ID ${tutorId}.`,
      );
    }
    return details;
  }

  /**
   * Create a new availability slot for a tutor.
   */
  async createAvailabilitySlot(
    tutorId: number,
    dto: TutorAvailabilitySlot,
  ): Promise<TutorAvailabilitySlot> {
    // First check if the tutor profile exists
    const tutorProfile = await this.database.query.tutors.findFirst({
      where: eq(tutorSchema.tutors.tutorId, tutorId),
    });

    if (!tutorProfile) {
      throw new NotFoundException(
        `Tutor profile not found for user ID ${tutorId}. Create a tutor profile first.`,
      );
    }

    // Convert dayOfWeek to array if it's not already
    const daysOfWeek = Array.isArray(dto.dayOfWeek)
      ? dto.dayOfWeek
      : [dto.dayOfWeek];

    const [slot] = await this.database
      .insert(tutorSchema.tutorAvailabilitySlots)
      .values({
        tutorId,
        dayOfWeek: daysOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
      })
      .returning();

    if (!slot) throw new InternalServerErrorException('Failed to create slot');
    return slot;
  }

  /**
   * Get all availability slots for a tutor.
   */
  async getAvailabilitySlots(
    tutorId: number,
  ): Promise<TutorAvailabilitySlot[]> {
    return this.database.query.tutorAvailabilitySlots.findMany({
      where: eq(tutorSchema.tutorAvailabilitySlots.tutorId, tutorId),
    });
  }

  /**
   * Update an availability slot by id (only if it belongs to the tutor).
   */
  async updateAvailabilitySlot(
    tutorId: number,
    slotId: number,
    dto: TutorAvailabilitySlot,
  ): Promise<TutorAvailabilitySlot> {
    // Ensure slot belongs to tutor
    const slot = await this.database.query.tutorAvailabilitySlots.findFirst({
      where: eq(tutorSchema.tutorAvailabilitySlots.id, slotId),
    });
    if (!slot || slot.tutorId !== tutorId) {
      throw new NotFoundException('Slot not found or not owned by tutor');
    }

    // Prepare update data
    const updateData: Partial<
      typeof tutorSchema.tutorAvailabilitySlots.$inferInsert
    > = {};

    if (dto.startTime) updateData.startTime = dto.startTime;
    if (dto.endTime) updateData.endTime = dto.endTime;
    if (dto.dayOfWeek) {
      updateData.dayOfWeek = Array.isArray(dto.dayOfWeek)
        ? dto.dayOfWeek
        : [dto.dayOfWeek];
    }

    const [updated] = await this.database
      .update(tutorSchema.tutorAvailabilitySlots)
      .set(updateData)
      .where(eq(tutorSchema.tutorAvailabilitySlots.id, slotId))
      .returning();

    if (!updated)
      throw new InternalServerErrorException('Failed to update slot');
    return updated;
  }

  /**
   * Delete an availability slot by id (only if it belongs to the tutor).
   */
  async deleteAvailabilitySlot(tutorId: number, slotId: number): Promise<void> {
    const slot = await this.database.query.tutorAvailabilitySlots.findFirst({
      where: eq(tutorSchema.tutorAvailabilitySlots.id, slotId),
    });
    if (!slot || slot.tutorId !== tutorId) {
      throw new NotFoundException('Slot not found or not owned by tutor');
    }
    await this.database
      .delete(tutorSchema.tutorAvailabilitySlots)
      .where(eq(tutorSchema.tutorAvailabilitySlots.id, slotId));
  }
}
