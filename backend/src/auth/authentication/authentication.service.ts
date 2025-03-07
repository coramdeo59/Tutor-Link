import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../users/schema';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { pgUniqueViolationsErrorCode } from '../constant/pg-violation';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';

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
      if (err.code === pgUniqueViolationsErrorCode) {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }
  async signIn(signInDto: SignInDto) {
    const user = await this.database.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, signInDto.email),
    });
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException('Password does not match');
    }
    return true;
  }
}
