import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../users/schema';
import { DATABASE_CONNECTION } from './database-connection';

/**
 * Service that provides access to the Drizzle ORM database instance
 */
@Injectable()
export class DrizzleService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly drizzleDb: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Get the Drizzle database instance
   */
  get db(): NodePgDatabase<typeof schema> {
    return this.drizzleDb;
  }
}
