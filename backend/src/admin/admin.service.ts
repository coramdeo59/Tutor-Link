import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import * as tutorSchema from 'src/users/tutors/schema'; // aliased to avoid conflict if schema also has 'tutors'
// import {users} from 'src/users/schema' // Removed unused import
import {
  tutors,
  tutorIdDocuments,
  tutorTeachingLicenses,
} from '../users/tutors/schema'; // This might be redundant if tutorSchema is comprehensive
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/core/database-connection';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof tutorSchema>,
  ) {} // Assuming tutorSchema is the correct one for this service's scope

  listAllUsers() {
    // return this.database.query.users.findMany(); // Needs users schema access
  }

  listPendingTutors() {
    return this.database.query.tutors.findMany({
      where: eq(tutors.isVerified, false),
    });
  }

  async getTutorDetails(tutorId: number) {
    const tutor = await this.database.query.tutors.findFirst({
      where: eq(tutors.tutorId, tutorId),
      with: {
        user: true, // This implies 'user' relation is defined in tutorSchema or accessible
        subjects: true,
        workExperiences: true,
        educations: true,
        idDocuments: true,
        teachingLicenses: true,
      },
    });
    if (!tutor) throw new NotFoundException('Tutor not found');
    return tutor;
  }

  async verifyTutor(tutorId: number) {
    const tutorExists = await this.database.query.tutors.findFirst({
      where: eq(tutors.tutorId, tutorId),
    });
    if (!tutorExists) throw new NotFoundException('Tutor not found');

    const docs = await this.database.query.tutorIdDocuments.findMany({
      where: eq(tutorIdDocuments.tutorId, tutorId),
    });
    const licenses = await this.database.query.tutorTeachingLicenses.findMany({
      where: eq(tutorTeachingLicenses.tutorId, tutorId),
    });
    if (docs.length === 0 || licenses.length === 0)
      throw new BadRequestException(
        'Tutor has not provided all required documents',
      );

    const [updated] = await this.database
      .update(tutors)
      .set({ isVerified: true })
      .where(eq(tutors.tutorId, tutorId))
      .returning();
    return updated;
  }
}
