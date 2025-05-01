import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'; // Import ConflictException
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { DATABASE_CONNECTION } from '../../database/database-connection';
import { tutorDetails } from '../schema'; // Import tutorDetails
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { users } from '../schema';

@Injectable()
export class TutorsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  // Update method signature to accept userId
  async create(createTutorDto: CreateTutorDto, userId: number) {
    // Check if user exists using the provided userId
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.UserID, userId))
      .limit(1);
    if (!user.length) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if a tutor profile already exists for this user
    const existingTutor = await this.db
      .select()
      .from(tutorDetails)
      .where(eq(tutorDetails.TutorID, userId))
      .limit(1);
    if (existingTutor.length > 0) {
      throw new ConflictException(
        `User with ID ${userId} is already registered as a tutor.`,
      );
    }

    // Update user role to 'tutor' using the provided userId
    await this.db
      .update(users)
      .set({ Role: 'tutor' })
      .where(eq(users.UserID, userId));

    // Create tutor profile, adding the userId to the values
    return await this.db
      .insert(tutorDetails)
      .values({ 
        TutorID: userId,
        ...createTutorDto
      })
      .returning();
  }

  async findAll() {
    // Join tutor data with user data3
    return await this.db
      .select({
        TutorID: tutorDetails.TutorID,
        userId: tutorDetails.TutorID,
        name: users.FirstName,
        email: users.Email,
        BirthDate: tutorDetails.BirthDate,
        Certified: tutorDetails.Certified,
        Major: tutorDetails.Major,
        EducationInstitution: tutorDetails.EducationInstitution,
        GraduationYear: tutorDetails.GraduationYear,
        WorkTitle: tutorDetails.WorkTitle,
        WorkInstitution: tutorDetails.WorkInstitution,
      })
      .from(tutorDetails)
      .innerJoin(users, eq(tutorDetails.TutorID, users.UserID));
  }

  async findOne(id: number) {
    const result = await this.db
      .select({
        TutorID: tutorDetails.TutorID,
        userId: tutorDetails.TutorID,
        name: users.FirstName,
        email: users.Email,
        BirthDate: tutorDetails.BirthDate,
        Certified: tutorDetails.Certified,
        Major: tutorDetails.Major,
        EducationInstitution: tutorDetails.EducationInstitution,
        GraduationYear: tutorDetails.GraduationYear,
        WorkTitle: tutorDetails.WorkTitle,
        WorkInstitution: tutorDetails.WorkInstitution,
      })
      .from(tutorDetails)
      .innerJoin(users, eq(tutorDetails.TutorID, users.UserID))
      .where(eq(tutorDetails.TutorID, id))
      .limit(1);

    return result[0];
  }

  async update(id: number, updateTutorDto: UpdateTutorDto) {
    return await this.db
      .update(tutorDetails)
      .set(updateTutorDto)
      .where(eq(tutorDetails.TutorID, id))
      .returning();
  }

  async remove(id: number) {
    // Get the tutor to find the associated user
    const tutorToDelete = await this.db
      .select()
      .from(tutorDetails)
      .where(eq(tutorDetails.TutorID, id))
      .limit(1);

    if (!tutorToDelete.length) {
      throw new NotFoundException(`Tutor with ID ${id} not found`);
    }

    // Delete the tutor record
    await this.db.delete(tutorDetails).where(eq(tutorDetails.TutorID, id));

    // Optionally, update the user role back to 'user'
    return await this.db
      .update(users)
      .set({ Role: 'regular' })
      .where(eq(users.UserID, tutorToDelete[0]!.TutorID)) // Add non-null assertion
      .returning();
  }
}
