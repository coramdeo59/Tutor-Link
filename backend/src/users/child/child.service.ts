import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Inject } from '@nestjs/common';
import { CreateChildDto } from './dto/create-child.dto';
import { HashingService } from '../../auth/hashing/hashing.service';
import { eq, ne, and, } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../core/database-connection';
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
    private readonly hashingService: HashingService,
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
  
  /**
   * Find a child by ID specifically for tutoring session display
   * This method excludes sensitive information and only returns data needed for sessions
   * @param id The ID of the child to find
   * @returns Child information with fields needed for session display
   */
  async findChildById(id: number): Promise<ChildResponse> {
    try {
      // First try to get the child from the database
      const child = await this.db.query.children.findFirst({
        where: eq(parentSchema.children.childId, id),
      });

      if (!child) {
        throw new NotFoundException(`Child with ID ${id} not found`);
      }

      // Remove the password before returning
      const { password, ...result } = child;
      return result as ChildResponse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error finding child ${id} for session:`, error);
      throw new InternalServerErrorException(`Failed to find child ${id} for session`);
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

      // Hash the password using the injected HashingService
      const hashedPassword = await this.hashingService.hash(createChildDto.password);

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

      // Hash password if it's being updated using the injected HashingService
      if (updateChildDto.password) {
        updateChildDto.password = await this.hashingService.hash(updateChildDto.password);
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

  /**
   * Finds students available for tutoring sessions with a specific tutor
   * In a complete implementation, this would filter based on:
   * - Tutor's subjects matching student's subjects of interest
   * - Tutor's grade levels matching student's grade
   * - Any parent preferences or restrictions
   * 
   * @param tutorId The ID of the tutor requesting students
   * @returns List of students available for tutoring
   */
  /**
   * Fetch students available for tutoring sessions with a tutor
   * @param tutorId The ID of the tutor requesting students
   * @returns List of formatted student data with subjects and grade levels
   */
  /**
   * Find students available for tutoring sessions with a specific tutor
   * @param tutorId The ID of the tutor requesting students
   * @returns List of formatted student data with subjects and grade levels
   */
  /**
   * Find students available for tutoring sessions with a specific tutor
   * @param tutorId The ID of the tutor requesting students
   * @returns List of formatted student data with subjects and grade levels
   */
  async findStudentsForTutor(tutorId: number): Promise<{
    childId: number;
    firstName: string;
    lastName: string;
    username: string;
    photo: string | null;
    gradeLevelId: number | null;
    gradeLevelName: string;
    subjects: string[];
  }[]> {
    // Validate tutor ID
    if (!tutorId || isNaN(Number(tutorId))) {
      throw new BadRequestException('Invalid tutor ID provided');
    }
    
    // Define grade level mapping for formatting student data
    const gradeLevelMap: Record<number, string> = {
      1: '1st Grade', 2: '2nd Grade', 3: '3rd Grade', 4: '4th Grade',
      5: '5th Grade', 6: '6th Grade', 7: '7th Grade', 8: '8th Grade',
      9: '9th Grade', 10: '10th Grade', 11: '11th Grade', 12: '12th Grade'
    };
    
    try {
      // Use a direct SQL query for reliable results
      const result = await this.db.execute('SELECT * FROM children ORDER BY first_name');
      
      // If we have results, map them to our response format
      if (result && Array.isArray(result.rows) && result.rows.length > 0) {
        // Map database results to our response format
        const students = result.rows.map(child => {
          // Get grade level name
          const childGradeId = typeof child.grade_level_id === 'number' ? child.grade_level_id : null;
          const gradeLevelName = childGradeId && gradeLevelMap[childGradeId] 
            ? gradeLevelMap[childGradeId] 
            : 'Unknown';
            
          // Assign default subjects based on grade level
          let subjects = ['General Education'];
          if (childGradeId) {
            // Elementary school subjects (grades 1-5)
            if (childGradeId >= 1 && childGradeId <= 5) {
              subjects = ['Reading', 'Mathematics', 'Science'];
            } 
            // Middle school subjects (grades 6-8)
            else if (childGradeId >= 6 && childGradeId <= 8) {
              subjects = ['English', 'Mathematics', 'Science', 'History'];
            } 
            // High school subjects (grades 9-12)
            else if (childGradeId >= 9 && childGradeId <= 12) {
              subjects = ['English', 'Algebra', 'Biology', 'Chemistry', 'History'];
            }
          }
            
          // Return formatted student object with proper type casting
          return {
            childId: Number(child.child_id),
            firstName: String(child.first_name || ''),
            lastName: String(child.last_name || ''),
            username: String(child.username || ''),
            photo: child.photo ? String(child.photo) : null,
            gradeLevelId: childGradeId,
            gradeLevelName,
            subjects
          };
        });
          
        return students;
      } else {
        // No students found in database
        return [];
      }
    } catch (error) {
      // Log error for troubleshooting
      console.error(`Error fetching students for tutor ${tutorId}:`, error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to fetch students for tutoring sessions');
    }
  }
}
