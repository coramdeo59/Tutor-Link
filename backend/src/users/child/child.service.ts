import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateChildDto } from '../parent/dtos/create-child.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import * as parentSchema from '../schema/parent-schema';
import * as userSchema from '../schema/User-schema';
import * as subjectSchema from '../schema/SubjectGrade-schema';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { AuthenticationService } from 'src/auth/authentication/authentication.service';
import { and, eq, gte } from 'drizzle-orm';
import { ChildLoginDto } from '../parent/dtos/child-login.dto';
import { Role } from 'src/users/enums/role-enums';
import * as tutoringSchema from '../../tutoring/schema/tutoring-session.schema';

@Injectable()
export class ChildService {
  private parents: typeof parentSchema.parents;
  private children: typeof parentSchema.children;
  private users: typeof userSchema.users;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      parents: typeof parentSchema.parents;
      children: typeof parentSchema.children;
      users: typeof userSchema.users;
      tutoringSessions: typeof tutoringSchema.tutoringSessions;
      tutors: typeof tutoringSchema.tutors;
      subjects: typeof subjectSchema.subjects;
      gradeLevels: typeof subjectSchema.gradeLevels;
    }>,
    private readonly hashingService: HashingService,
    private readonly authenticationService: AuthenticationService,
  ) {
    this.parents = parentSchema.parents;
    this.children = parentSchema.children;
    this.users = userSchema.users;
  }

  /**
   * Create a parent record for a user if it doesn't exist
   * This is used when a parent user record exists but no parent record exists
   * Important: This fixes a data integrity issue where parent users existed without parent records
   */
  async createParentRecord(userId: number): Promise<boolean> {
    try {
      // Check if the user exists
      const users = await this.database
        .select()
        .from(this.users)
        .where(eq(this.users.userId, userId));

      if (users.length === 0) {
        console.error(`User with ID ${userId} not found`);
        return false;
      }

      // Check if parent record already exists
      const existingParent = await this.database
        .select()
        .from(this.parents)
        .where(eq(this.parents.parentId, userId));

      if (existingParent.length > 0) {
        // Parent record already exists
        return true;
      }

      // Create parent record
      const result = await this.database
        .insert(this.parents)
        .values({ parentId: userId })
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Error creating parent record:', error);
      return false;
    }
  }

  /**
   * Add a child to a parent
   * This creates a child record with direct login capability using username and password.
   */
  async addChild(createChildDto: CreateChildDto) {
    const {
      parentId,
      firstName,
      lastName,
      username,
      password: rawPassword,
      dateOfBirth,
      gradeLevelId,
    } = createChildDto;

    try {
      // Validate parentId
      if (!parentId || typeof parentId !== 'number' || isNaN(parentId)) {
        throw new BadRequestException('A valid parent ID is required');
      }

      console.log(
        'Service received parentId:',
        parentId,
        'type:',
        typeof parentId,
      );

      // Check if parent exists using direct database query
      const parents = await this.database
        .select()
        .from(this.parents)
        .where(eq(this.parents.parentId, parentId));

      if (parents.length === 0) {
        // Try to create the parent record if it doesn't exist
        const parentCreated = await this.createParentRecord(parentId);
        if (!parentCreated) {
          throw new NotFoundException(`Parent with ID ${parentId} not found`);
        }
      }

      // Check if username is already in use by another child
      const existingChildren = await this.database
        .select()
        .from(this.children)
        .where(eq(this.children.username, username));

      if (existingChildren.length > 0) {
        throw new ConflictException(
          `Username '${username}' is already in use.`,
        );
      }

      if (!rawPassword) {
        throw new BadRequestException(
          'Password is required for the child account.',
        );
      }
      const hashedPassword = await this.hashingService.hash(rawPassword);

      // Insert the new child record
      const childValues = {
        parentId,
        firstName,
        lastName,
        username,
        password: hashedPassword,
        dateOfBirth: dateOfBirth ? dateOfBirth.toString() : null,
        gradeLevelId: gradeLevelId || null,
      };

      const result = await this.database
        .insert(this.children)
        .values(childValues)
        .returning();

      if (result.length === 0) {
        throw new InternalServerErrorException('Failed to create child record');
      }

      // Return the child data without the password
      const childRecord = result[0];

      // TypeScript safety check
      if (!childRecord) {
        throw new InternalServerErrorException('Invalid child record returned');
      }

      // Destructure and remove password from the returned data
      const { password: _, ...childData } = childRecord;
      return childData;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error creating child record:', error);
      throw new InternalServerErrorException(
        `Failed to create child record: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Authenticate a child login using username and password, then generate tokens.
   */
  async loginChild(childLoginDto: ChildLoginDto) {
    const { username, password: inputPassword } = childLoginDto;
    try {
      // Find the child by username
      const children = await this.database
        .select()
        .from(this.children)
        .where(eq(this.children.username, username));

      if (children.length === 0) {
        throw new NotFoundException(
          `Child with username '${username}' not found`,
        );
      }

      // Get the first matching child and ensure it's not undefined
      const child = children[0];

      // TypeScript safety check
      if (!child) {
        throw new NotFoundException('Child record is invalid');
      }

      if (!child.password) {
        throw new BadRequestException(
          'Child account has no password set and cannot log in.',
        );
      }

      // Verify the password
      const isPasswordValid = await this.hashingService.compare(
        inputPassword,
        child.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password for child account.');
      }

      // Construct the payload for AuthenticationService.generateTokens
      const tokenGenerationPayload = {
        id: child.childId,
        name: `${child.firstName} ${child.lastName}`.trim(),
        email: child.username, // Pass username as 'email' to satisfy generateTokens parameter
        password: child.password, // Pass hashed password, though generateTokens might not use it directly for payload
        role: Role.Child, // Use the enum value for child_account
      };

      return this.authenticationService.generateTokens(tokenGenerationPayload);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error authenticating child:', error);
      throw new InternalServerErrorException(
        `Failed to authenticate child: ${error.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get a child's profile with upcoming tutoring sessions
   * @param childId The ID of the child
   * @returns Child profile with upcoming sessions
   */
  async getChildProfile(childId: number) {
    try {
      // Get the child's basic info
      const children = await this.database
        .select()
        .from(this.children)
        .where(eq(this.children.childId, childId));

      if (children.length === 0) {
        throw new NotFoundException(`Child with ID ${childId} not found`);
      }

      const child = children[0];
      if (!child) {
        throw new NotFoundException('Child record is invalid');
      }

      // Remove sensitive data
      const { password, ...childData } = child;

      // Get the child's grade level info
      let gradeLevel = null;
      if (child.gradeLevelId) {
        const gradeLevels = await this.database
          .select()
          .from(subjectSchema.gradeLevels)
          .where(eq(subjectSchema.gradeLevels.gradeId, child.gradeLevelId));

        if (gradeLevels.length > 0 && gradeLevels[0]) {
          // Explicitly cast to avoid null/undefined type mismatch
          gradeLevel = gradeLevels[0] as any;
        }
      }

      // Get child's parent info
      const parents = await this.database
        .select({
          parentId: this.parents.parentId,
          userId: this.users.userId,
          email: this.users.email,
          firstName: this.users.firstName,
          lastName: this.users.lastName,
        })
        .from(this.parents)
        .innerJoin(this.users, eq(this.parents.parentId, this.users.userId))
        .where(eq(this.parents.parentId, child.parentId));

      const parent = parents.length > 0 ? parents[0] : null;

      // Get upcoming tutoring sessions for this child
      const now = new Date();
      const upcomingSessions = await this.database
        .select({
          sessionId: tutoringSchema.tutoringSessions.sessionId,
          title: tutoringSchema.tutoringSessions.title,
          description: tutoringSchema.tutoringSessions.description,
          startTime: tutoringSchema.tutoringSessions.startTime,
          endTime: tutoringSchema.tutoringSessions.endTime,
          topic: tutoringSchema.tutoringSessions.topic,
          tutorId: tutoringSchema.tutors.tutorId,
          subjectId: tutoringSchema.tutoringSessions.subjectId,
          subjectName: subjectSchema.subjects.subjectName,
        })
        .from(tutoringSchema.tutoringSessions)
        .innerJoin(
          tutoringSchema.tutors,
          eq(
            tutoringSchema.tutoringSessions.tutorId,
            tutoringSchema.tutors.tutorId,
          ),
        )
        .innerJoin(
          subjectSchema.subjects,
          eq(
            tutoringSchema.tutoringSessions.subjectId,
            subjectSchema.subjects.subjectId,
          ),
        )
        .where(
          and(
            eq(tutoringSchema.tutoringSessions.childId, childId),
            gte(tutoringSchema.tutoringSessions.startTime, now),
            eq(tutoringSchema.tutoringSessions.cancelled, false),
          ),
        )
        .orderBy(tutoringSchema.tutoringSessions.startTime);

      // Return the child's profile with related information
      return {
        childProfile: childData,
        parent,
        gradeLevel,
        upcomingSessions,
        sessionCount: upcomingSessions.length,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving child profile:', error);
      throw new InternalServerErrorException(
        `Failed to retrieve child profile: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
