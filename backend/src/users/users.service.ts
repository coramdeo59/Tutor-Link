import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { users } from './schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { FirstName, LastName, Email, Password, UserType, AddressID, Photo, Role } = createUserDto;
    return await this.db.insert(users).values({ FirstName, LastName, Email, Password, UserType, AddressID, Photo, Role }).returning();
  }

  async findAll() {
    return await this.db.select().from(users);
  }

  async findOne(id: number) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.UserID, id))
      .limit(1);
    return result[0];
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.db
      .update(users)
      .set(updateUserDto)
      .where(eq(users.UserID, id))
      .returning();
  }

  async remove(id: number) {
    return await this.db
      .delete(users)
      .where(eq(users.UserID, id))
      .returning();
  }
}
