import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Extract fields from DTO to match schema
    const { name, email, password, role } = createUserDto;
    
    // Use exact schema shape that Drizzle expects
    return await this.db.insert(users).values({
      name,
      email,
      password,
      role
    }).returning();
  }

  async findAll() {
    return await this.db.select().from(users);
  }

  async findOne(id: number) {
    return await this.db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .then(rows => rows[0]);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Extract only the fields that are present in the DTO
    const updateData = {};
    if (updateUserDto.name !== undefined) updateData['name'] = updateUserDto.name;
    if (updateUserDto.email !== undefined) updateData['email'] = updateUserDto.email;
    if (updateUserDto.password !== undefined) updateData['password'] = updateUserDto.password;
    if (updateUserDto.role !== undefined) updateData['role'] = updateUserDto.role;
    
    return await this.db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
  }

  async remove(id: number) {
    return await this.db.delete(users)
      .where(eq(users.id, id))
      .returning();
  }
}
