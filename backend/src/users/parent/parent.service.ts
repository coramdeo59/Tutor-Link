import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import * as parentSchema from '../schema/parent-schema';
import * as userSchema from '../schema/User-schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ParentService {
  private parents: typeof parentSchema.parents;
  private users: typeof userSchema.users;

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      parents: typeof parentSchema.parents;
      children: typeof parentSchema.children;
      users: typeof userSchema.users;
    }>,
  ) {
    this.parents = parentSchema.parents;
    this.users = userSchema.users;
  }

  /**
   * Create a parent record for a user
   * This is used when a parent user record exists but no parent record exists
   * Important: This fixes a data integrity issue where parent users were being created
   * in the users table but corresponding records were not being created in the parents table.
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
}
