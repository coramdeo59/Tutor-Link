import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../core/database-connection';
import * as adminSchema from './schema/admin.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<{
      admin: typeof adminSchema.admin;
    }>,
  ) {}

  async findAll() {
    try {
      return await this.db.query.admin.findMany();
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw new InternalServerErrorException('Failed to fetch admins');
    }
  }

  async findOne(id: number) {
    try {
      const adminUser = await this.db.query.admin.findFirst({
        where: eq(adminSchema.admin.adminId, id),
      });

      if (!adminUser) {
        throw new NotFoundException(`Admin with ID ${id} not found`);
      }

      return adminUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error fetching admin ${id}:`, error);
      throw new InternalServerErrorException(`Failed to fetch admin ${id}`);
    }
  }

  async create(createAdminDto: any) {
    try {
      // Check if email already exists
      if (createAdminDto.email) {
        const existingAdmin = await this.db.query.admin.findFirst({
          where: eq(adminSchema.admin.email, createAdminDto.email),
        });

        if (existingAdmin) {
          throw new ConflictException('Email already in use');
        }
      }

      // Ensure required fields are present
      const required = ['email', 'password', 'firstName', 'lastName', 'role'];
      for (const field of required) {
        if (!createAdminDto[field]) {
          throw new ConflictException(`${field} is required`);
        }
      }

      const [newAdmin] = await this.db
        .insert(adminSchema.admin)
        .values(createAdminDto as any)
        .returning();

      return newAdmin;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error creating admin:', error);
      throw new InternalServerErrorException('Failed to create admin');
    }
  }

  async update(id: number, updateAdminDto: any) {
    try {
      // Check if admin exists
      await this.findOne(id);

      // Check email uniqueness if it's being updated
      if (updateAdminDto.email) {
        const existingAdmin = await this.db.query.admin.findFirst({
          where: eq(adminSchema.admin.email, updateAdminDto.email),
        });

        if (existingAdmin && existingAdmin.adminId !== id) {
          throw new ConflictException('Email already in use');
        }
      }

      const [updatedAdmin] = await this.db
        .update(adminSchema.admin)
        .set({ ...updateAdminDto, updatedAt: new Date() })
        .where(eq(adminSchema.admin.adminId, id))
        .returning();

      return updatedAdmin;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      console.error(`Error updating admin ${id}:`, error);
      throw new InternalServerErrorException(`Failed to update admin ${id}`);
    }
  }

  async remove(id: number) {
    try {
      // Check if admin exists
      await this.findOne(id);

      await this.db
        .delete(adminSchema.admin)
        .where(eq(adminSchema.admin.adminId, id));

      return { message: `Admin with ID ${id} deleted successfully` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error deleting admin ${id}:`, error);
      throw new InternalServerErrorException(`Failed to delete admin ${id}`);
    }
  }
}