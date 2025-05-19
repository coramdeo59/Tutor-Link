import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database-connection';
import * as parentSchema from './schema/parent.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ParentService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<{
      parents: typeof parentSchema.parents;
      children: typeof parentSchema.children;
    }>,
  ) {}

  async findAll() {
    try {
      return await this.db.query.parents.findMany();
    } catch (error) {
      console.error('Error fetching parents:', error);
      throw new InternalServerErrorException('Failed to fetch parents');
    }
  }

  async findOne(id: number) {
    try {
      const parent = await this.db.query.parents.findFirst({
        where: eq(parentSchema.parents.parentId, id),
      });

      if (!parent) {
        throw new NotFoundException(`Parent with ID ${id} not found`);
      }

      return parent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error fetching parent ${id}:`, error);
      throw new InternalServerErrorException(`Failed to fetch parent ${id}`);
    }
  }

  async create(createParentDto: any) {
    try {
      // Check if email already exists
      if (createParentDto.email) {
        const existingParent = await this.db.query.parents.findFirst({
          where: eq(parentSchema.parents.email, createParentDto.email),
        });

        if (existingParent) {
          throw new ConflictException('Email already in use');
        }
      }

      // Ensure required fields are present
      const required = ['email', 'password', 'firstName', 'lastName', 'phoneNumber'];
      for (const field of required) {
        if (!createParentDto[field]) {
          throw new ConflictException(`${field} is required`);
        }
      }

      const [newParent] = await this.db
        .insert(parentSchema.parents)
        .values(createParentDto as any)
        .returning();

      return newParent;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error creating parent:', error);
      throw new InternalServerErrorException('Failed to create parent');
    }
  }

  async update(id: number, updateParentDto: any) {
    try {
      // Check if parent exists
      await this.findOne(id);

      const [updatedParent] = await this.db
        .update(parentSchema.parents)
        .set({ ...updateParentDto, updatedAt: new Date() })
        .where(eq(parentSchema.parents.parentId, id))
        .returning();

      return updatedParent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error updating parent ${id}:`, error);
      throw new InternalServerErrorException(`Failed to update parent ${id}`);
    }
  }

  async remove(id: number) {
    try {
      // Check if parent exists
      await this.findOne(id);

      await this.db
        .delete(parentSchema.parents)
        .where(eq(parentSchema.parents.parentId, id));

      return { message: `Parent with ID ${id} deleted successfully` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error deleting parent ${id}:`, error);
      throw new InternalServerErrorException(`Failed to delete parent ${id}`);
    }
  }
} 