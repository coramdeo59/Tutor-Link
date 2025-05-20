import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateChildDto } from './dto/create-child.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database-connection';
import { and, eq, ne } from 'drizzle-orm';
import * as parentSchema from '../parent/schema/parent.schema';

export interface ChildResponse {
  childId: number;
  parentId: number;
  firstName: string;
  lastName: string;
  username: string;
  photo: string | null;
  dateOfBirth: string | null;
  gradeLevelId: number | null;
  overallProgress: number | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ChildService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<{
      children: typeof parentSchema.children;
      parents: typeof parentSchema.parents;
      // Include schema for assignments and sessions
      assignments: any;
      submissions: any;
      tutoringSessions: any;
    }>,
  ) {}

  async findAll(): Promise<ChildResponse[]> {
    try {
      const children = await this.db.query.children.findMany();
      return children.map(child => {
        const { password, ...result } = child;
        return result as ChildResponse;
      });
    } catch (error) {
      console.error('Error fetching children:', error);
      throw new InternalServerErrorException('Failed to fetch children');
    }
  }

  async findByParent(parentId: string | number): Promise<ChildResponse[]> {
    const parentIdNum = Number(parentId);
    if (isNaN(parentIdNum)) {
      throw new BadRequestException('Invalid parent ID');
    }

    try {
      const children = await this.db.query.children.findMany({
        where: eq(parentSchema.children.parentId, parentIdNum),
      });

      return children.map(child => {
        const { password, ...result } = child;
        return result as ChildResponse;
      });
    } catch (error) {
      console.error('Error finding children by parent:', error);
      throw new InternalServerErrorException('Failed to find children by parent');
    }
  }

  async findChildForParent(
    childId: string | number,
    parentId: string | number,
  ): Promise<ChildResponse> {
    const childIdNum = Number(childId);
    const parentIdNum = Number(parentId);
    
    if (isNaN(childIdNum) || isNaN(parentIdNum)) {
      throw new BadRequestException('Invalid child or parent ID');
    }

    try {
      const child = await this.db.query.children.findFirst({
        where: and(
          eq(parentSchema.children.childId, childIdNum),
          eq(parentSchema.children.parentId, parentIdNum),
        ),
      });

      if (!child) {
        throw new NotFoundException('Child not found or does not belong to parent');
      }

      const { password, ...result } = child;
      return result as ChildResponse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding child for parent:', error);
      throw new InternalServerErrorException('Failed to find child for parent');
    }
  }

  async findOne(id: number): Promise<ChildResponse> {
    try {
      const child = await this.db.query.children.findFirst({
        where: eq(parentSchema.children.childId, id),
      });

      if (!child) {
        throw new NotFoundException(`Child with ID ${id} not found`);
      }

      const { password, ...result } = child;
      return result as ChildResponse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error finding child ${id}:`, error);
      throw new InternalServerErrorException(`Failed to find child ${id}`);
    }
  }

  async create(
    createChildDto: CreateChildDto,
    parentId: string | number,
  ): Promise<ChildResponse> {
    try {
      if (!this.db?.query?.children || !this.db?.query?.parents) {
        throw new InternalServerErrorException('Database connection error');
      }

      // Verify the parent exists
      const parent = await this.db.query.parents.findFirst({
        where: eq(parentSchema.parents.parentId, Number(parentId)),
        columns: {
          parentId: true,
          email: true,
        },
      });

      if (!parent) {
        throw new NotFoundException('Parent not found');
      }

      // Check if username already exists
      const existingChild = await this.db.query.children.findFirst({
        where: eq(parentSchema.children.username, createChildDto.username),
      });

      if (existingChild) {
        throw new ConflictException('Username already in use');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(createChildDto.password, 10);

      // Create the child record
      const [newChild] = await this.db
        .insert(parentSchema.children)
        .values({
          firstName: createChildDto.firstName,
          lastName: createChildDto.lastName,
          username: createChildDto.username,
          password: hashedPassword,
          parentId: Number(parentId),
          photo: createChildDto.photo || null,
          dateOfBirth: createChildDto.dateOfBirth
            ? new Date(createChildDto.dateOfBirth).toISOString()
            : null,
          gradeLevelId: createChildDto.gradeLevelId || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!newChild) {
        throw new InternalServerErrorException('Failed to create child account');
      }

      // Return the created child without the password
      const { password, ...result } = newChild;
      return result as ChildResponse;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error creating child:', error);
      throw new InternalServerErrorException('Failed to create child account');
    }
  }

  async update(id: number, updateChildDto: any): Promise<ChildResponse> {
    try {
      // Check if child exists
      const child = await this.db.query.children.findFirst({
        where: eq(parentSchema.children.childId, id),
      });

      if (!child) {
        throw new NotFoundException('Child not found');
      }

      // Check if username is being updated and if it's already taken
      if (updateChildDto.username && updateChildDto.username !== child.username) {
        const existingChild = await this.db.query.children.findFirst({
          where: and(
            eq(parentSchema.children.username, updateChildDto.username),
            ne(parentSchema.children.childId, id),
          ),
        });

        if (existingChild) {
          throw new ConflictException('Username already in use');
        }
      }

      // Hash password if it's being updated
      if (updateChildDto.password) {
        updateChildDto.password = await bcrypt.hash(updateChildDto.password, 10);
      }

      // Prepare update data
      const updateData: any = {
        ...updateChildDto,
        updatedAt: new Date(),
      };

      // Handle date of birth if present
      if (updateChildDto.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateChildDto.dateOfBirth).toISOString();
      }

      // Update the child
      const [updatedChild] = await this.db
        .update(parentSchema.children)
        .set(updateData)
        .where(eq(parentSchema.children.childId, id))
        .returning();

      if (!updatedChild) {
        throw new InternalServerErrorException('Failed to update child');
      }

      const { password, ...result } = updatedChild;
      return result as ChildResponse;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(`Error updating child ${id}:`, error);
      throw new InternalServerErrorException('Failed to update child');
    }
  }
}
