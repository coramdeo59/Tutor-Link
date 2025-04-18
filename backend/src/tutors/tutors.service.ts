import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common'; // Import ConflictException
import { CreateTutorDto } from './dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { tutors, tutorEducation } from './schema';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { users } from '../users/schema';

@Injectable()
export class TutorsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  // Update method signature to accept userId
  async create(createTutorDto: CreateTutorDto, userId: number) { 
    // Check if user exists using the provided userId
    const user = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if a tutor profile already exists for this user
    const existingTutor = await this.db.select().from(tutors).where(eq(tutors.userId, userId)).limit(1);
    if (existingTutor.length > 0) {
      throw new ConflictException(`User with ID ${userId} is already registered as a tutor.`);
    }
    
    // Update user role to 'tutor' using the provided userId
    await this.db.update(users)
      .set({ role: 'tutor' })
      .where(eq(users.id, userId));
    
    // Create tutor profile, adding the userId to the values
    return await this.db.insert(tutors)
      .values({ ...createTutorDto, userId }) // Add userId here
      .returning();
  }

  async findAll() {
    // Join tutor data with user data3
    return await this.db.select({
      tutorId: tutors.id,
      userId: tutors.userId,
      name: users.name,
      email: users.email,
      profilePicture: tutors.profilePicture,
      bio: tutors.bio,
      hourlyRate: tutors.hourlyRate,
      isAvailable: tutors.isAvailable,
      currentTitle: tutors.currentTitle,
      videoIntroduction: tutors.videoIntroduction,
      averageRating: tutors.averageRating,
      reviewCount: tutors.reviewCount,
    })
    .from(tutors)
    .innerJoin(users, eq(tutors.userId, users.id));
  }

  async findOne(id: number) {
    const result = await this.db.select({
      tutorId: tutors.id,
      userId: tutors.userId,
      name: users.name,
      email: users.email,
      profilePicture: tutors.profilePicture,
      bio: tutors.bio,
      hourlyRate: tutors.hourlyRate,
      isAvailable: tutors.isAvailable,
      currentTitle: tutors.currentTitle,
      videoIntroduction: tutors.videoIntroduction,
      averageRating: tutors.averageRating,
      reviewCount: tutors.reviewCount,
    })
    .from(tutors)
    .innerJoin(users, eq(tutors.userId, users.id))
    .where(eq(tutors.id, id))
    .limit(1);
    
    return result[0];
  }

  async update(id: number, updateTutorDto: UpdateTutorDto) {
    return await this.db.update(tutors)
      .set(updateTutorDto)
      .where(eq(tutors.id, id))
      .returning();
  }

  async remove(id: number) {
    // Get the tutor to find the associated user
    const tutorToDelete = await this.db.select()
      .from(tutors)
      .where(eq(tutors.id, id))
      .limit(1);
      
    if (!tutorToDelete.length) {
      throw new NotFoundException(`Tutor with ID ${id} not found`);
    }
    
    // Delete the tutor record
    await this.db.delete(tutors)
      .where(eq(tutors.id, id));
      
    // Optionally, update the user role back to 'user'
    return await this.db.update(users)
      .set({ role: 'user' })
      .where(eq(users.id, tutorToDelete[0].userId))
      .returning();
  }
}
