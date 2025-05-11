import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from '../../core/database-connection';
import * as schema from './schema';
import { users } from '../schema'
// import {
//   tutorSubjects,
//   tutorWorkExperiences,
//   tutorEducations,
//   tutorIdDocuments,
//   tutorTeachingLicenses,
//   tutors,
// } from './schema';
import { subjects, gradeLevels } from '../SubjectGrade/schema';
import { eq } from 'drizzle-orm'; // 'and' removed as it was unused
import { CreateTutorDto } from './dto/tutor.dto';

@Injectable()
export class TutorsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async createTutorProfile(userId: number, dto: CreateTutorDto) {
    // 1. Query the user table to get userType
    const user = await this.database.query.users.findFirst({
      where: eq(users.userId, userId),
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.userType !== 'tutor') {
      throw new BadRequestException(
        'Only users with type TUTOR can create a tutor profile.',
      );
    }

    // 2. Check if tutor profile already exists
    const existingTutor = await this.database.query.tutors.findFirst({
      where: eq(schema.tutors.tutorId, userId),
    });
    if (existingTutor) {
      throw new ConflictException(
        'Tutor profile already exists for this user.',
      );
    }

    // 3. Transaction for all inserts
    return await this.database.transaction(async (tx) => {
      // Insert into tutors
      const [createdTutor] = await tx
        .insert(schema.tutors)
        .values({
          tutorId: userId,
          bio: dto.bio,
        })
        .returning();
      if (!createdTutor)
        throw new InternalServerErrorException(
          'Failed to create tutor profile.',
        );

      // Insert tutorSubjects
      if (dto.subjects?.length) {
        await tx.insert(schema.tutorSubjects).values(
          dto.subjects.map((s) => ({
            tutorId: createdTutor.tutorId,
            subjectId: s.subjectId,
            gradeId: s.gradeId,
          })),
        );
      }

      // Insert tutorWorkExperiences
      if (dto.workExperiences?.length) {
        await tx.insert(schema.tutorWorkExperiences).values(
          dto.workExperiences.map((w) => ({
            tutorId: createdTutor.tutorId,
            workTitle: w.workTitle,
            workInstitution: w.workInstitution,
            startDate: new Date(w.startDate),
            endDate: w.endDate ? new Date(w.endDate) : null,
          })),
        );
      }

      // Insert tutorEducations
      if (dto.educations?.length) {
        await tx.insert(schema.tutorEducations).values(
          dto.educations.map((e) => ({
            tutorId: createdTutor.tutorId,
            major: e.major,
            educationInstitution: e.educationInstitution,
            graduationYear: e.graduationYear,
            educationTypeId: e.educationTypeId,
            startDate: e.startDate ? new Date(e.startDate) : null,
            endDate: e.endDate ? new Date(e.endDate) : null,
            photo: e.photo,
          })),
        );
      }

      // Insert tutorIdDocuments
      if (dto.idDocuments?.length) {
        await tx.insert(schema.tutorIdDocuments).values(
          dto.idDocuments.map((d) => ({
            tutorId: createdTutor.tutorId,
            photoFront: d.photoFront,
            photoBack: d.photoBack,
            countryName: d.countryName,
            provinceName: d.provinceName,
            type: d.type,
            documentNumber: d.documentNumber,
          })),
        );
      }

      // Insert tutorTeachingLicenses
      if (dto.teachingLicenses?.length) {
        for (const lic of dto.teachingLicenses) {
          // Lookup subjectArea and gradeLevel
          const subject = await tx.query.subjects.findFirst({
            where: eq(subjects.subjectId, lic.subjectId),
          });
          if (!subject)
            throw new NotFoundException(
              `Subject with ID ${lic.subjectId} not found.`,
            );
          const grade = await tx.query.gradeLevels.findFirst({
            where: eq(gradeLevels.gradeId, lic.gradeId),
          });
          if (!grade)
            throw new NotFoundException(
              `Grade with ID ${lic.gradeId} not found.`,
            );
          await tx.insert(schema.tutorTeachingLicenses).values({
            tutorId: createdTutor.tutorId,
            photo: lic.photo,
            issueBody: lic.issueBody,
            issuingCountryName: lic.issuingCountryName,
            issuerProvinceName: lic.issuerProvinceName,
            certificationName: lic.certificationName,
            subjectArea: subject.subjectName,
            gradeLevel: grade.gradeLevel,
            issueDate: new Date(lic.issueDate),
            expirationDate: new Date(lic.expirationDate),
          });
        }
      }

      return createdTutor;
    });
  }
}
