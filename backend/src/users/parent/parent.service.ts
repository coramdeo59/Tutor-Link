import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateChildDto } from './dtos/create-child.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import * as parentSchema from '../schema/parent-schema';
// Removed: import * as userSchema from '../schema/User-schema';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { AuthenticationService } from 'src/auth/authentication/authentication.service';
import { eq } from 'drizzle-orm';
import { ChildLoginDto } from './dtos/child-login.dto';
import { Role } from 'src/users/enums/role-enums'; // Ensure Role is imported

@Injectable()
export class ParentService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      parents: typeof parentSchema.parents;
      children: typeof parentSchema.children;
      // users: typeof userSchema.users; // No longer directly interacting with users table here
    }>,
    private readonly hashingService: HashingService,
    private readonly authenticationService: AuthenticationService,
  ) {}

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
      // Check if parent exists
      const parentExists = await this.database.query.parents.findFirst({
        where: eq(parentSchema.parents.parentId, parentId),
      });

      if (!parentExists) {
        throw new NotFoundException(`Parent with ID ${parentId} not found`);
      }

      // Check if username is already in use by another child
      const usernameExists = await this.database.query.children.findFirst({
        where: eq(parentSchema.children.username, username),
      });

      if (usernameExists) {
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

      const result = await this.database
        .insert(parentSchema.children)
        .values({
          parentId,
          firstName,
          lastName,
          username,
          password: hashedPassword,
          dateOfBirth: dateOfBirth ? dateOfBirth : null,
          gradeLevelId: gradeLevelId ? gradeLevelId : null,
        })
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to create child record');
      }

      const childRecord = result[0];
      const { password: _, ...childData } = childRecord as {
        password?: string;
        [key: string]: any;
      };
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
      const child = await this.database.query.children.findFirst({
        where: eq(parentSchema.children.username, username),
      });

      if (!child) {
        throw new NotFoundException(
          `Child with username '${username}' not found`,
        );
      }

      if (!child.password) {
        throw new BadRequestException(
          'Child account has no password set and cannot log in.',
        );
      }

      const isPasswordValid = await this.hashingService.compare(
        inputPassword,
        child.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password for child account.');
      }

      // Construct the payload for AuthenticationService.generateTokens
      // This payload should match the expected structure of the 'user' parameter in generateTokens.
      // The 'email' field in that structure is now effectively 'username' for child accounts.
      const tokenGenerationPayload = {
        id: child.childId,
        name: `${child.firstName} ${child.lastName}`.trim(),
        email: child.username, // Pass username as 'email' to satisfy generateTokens parameter
        password: child.password, // Pass hashed password, though generateTokens might not use it directly for payload
        role: Role.Child, // Use the enum value for child_account
        // createdAt: child.createdAt, // Include if your generateTokens method uses it
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
}
