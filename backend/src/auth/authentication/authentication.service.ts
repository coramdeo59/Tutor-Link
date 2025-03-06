import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../users/schema';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
    private readonly hashingService: HashingService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const { name, email, password } = signUpDto;
      const hashedPassword = await this.hashingService.hash(password);

      return this.database
        .insert(schema.users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning();
    } catch (err) {
        const pgUniqueViolationsErrorCode = '23505'
        if (err.code === pgUniqueViolationsErrorCode) {
            
        }
    }
  }
}
