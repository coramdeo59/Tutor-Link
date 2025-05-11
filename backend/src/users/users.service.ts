import { Inject, Injectable } from '@nestjs/common';
import * as schema from './schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/core/database-connection';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}
  async findOneByEmail(email: string) {
    return this.database.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    });
  }

  async findOneById(userId: number) {
    return this.database.query.users.findFirst({
      where: (user, { eq }) => eq(user.userId, userId),
    });
  }
}
