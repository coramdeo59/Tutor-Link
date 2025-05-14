import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as userSchema from '../../users/schema/User-schema';
import { Role } from 'src/users/enums/role-enums';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage/refresh-token-ids.storage';
import { randomUUID } from 'crypto';
import { InvalidatedRefreshTokenError } from './exceptions/invalidated-refresh-token.exception';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { pgUniqueViolationsErrorCode } from '../constant/pg-violation';

// Removed unused UserSelect type alias

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{
      users: typeof userSchema.users;
    }>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    if (signUpDto.role === Role.Child) {
      throw new BadRequestException(
        `The role "${Role.Child}" is not allowed for direct user sign-up.`,
      );
    }

    try {
      const hashedPassword = await this.hashingService.hash(signUpDto.password);

      const [user] = await this.database
        .insert(userSchema.users)
        .values({
          firstName: signUpDto.firstName,
          lastName: signUpDto.lastName,
          email: signUpDto.email,
          password: hashedPassword,
          photo: signUpDto.photo,
          role: signUpDto.role as 'admin' | 'regular',
          userType: signUpDto.userType,
          stateId: signUpDto.stateId,
          cityId: signUpDto.cityId,
          phoneNumber: signUpDto.phoneNumber,
        })
        .returning();

      return user;
    } catch (err) {
      // Log the error for debugging
      console.error('Registration error:', err);

      if (err.code === pgUniqueViolationsErrorCode) {
        throw new ConflictException('Email already exists');
      }
      if (err.code === '23503') { // Foreign key error
        if (err.constraint?.includes('users_stateId_states_id_fk') || err.constraint?.includes('state_id')) {
          throw new BadRequestException('Invalid state ID: The provided state does not exist.');
        }
        if (err.constraint?.includes('users_cityId_cities_id_fk') || err.constraint?.includes('city_id')) {
          throw new BadRequestException('Invalid city ID: The provided city does not exist.');
        }
        // Fallback for other foreign key errors on the users table
        throw new BadRequestException(`Invalid input: A related record does not exist (Constraint: ${err.constraint}).`);
      }

      // In development, return the more specific error message for easier debugging
      if (process.env.NODE_ENV !== 'production') {
        throw new InternalServerErrorException(`Registration failed: ${err.message || 'An unknown error occurred'}`);
      }
      // In production, throw a generic error
      throw new InternalServerErrorException('Registration failed due to an unexpected error.');
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.database.query.users.findFirst({
      where: (User, { eq }) => eq(User.email, signInDto.email),
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

    const transformedUser = {
      id: user.userId,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      password: user.password,
      role: user.userType,
      createdAt: user.createdAt,
    };

    return await this.generateTokens(transformedUser);
  }

  public async generateTokens(user: {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    createdAt?: Date | null;
  }) {
    const refreshTokenId = randomUUID();

    const userRole = user.role as Role;

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { email: user.email, role: userRole },
      ),
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.refreshTokenTtl,
        { refreshTokenId },
      ),
    ]);

    await this.refreshTokenIdsStorage.insert(
      user.id,
      refreshTokenId,
      this.jwtConfiguration.refreshTokenTtl,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<ActiveUserData>(
        refreshTokenDto.refreshToken,
        {
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          secret: this.jwtConfiguration.secret,
        },
      );

      const { sub, refreshTokenId } = payload;

      if (!refreshTokenId) {
        throw new UnauthorizedException('Refresh token ID not found');
      }

      await this.refreshTokenIdsStorage.validate(sub, refreshTokenId);
      await this.refreshTokenIdsStorage.invalidate(sub, refreshTokenId);

      const user = await this.database.query.users.findFirst({
        where: (User, { eq }) => eq(User.userId, sub),
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const transformedUser = {
        id: user.userId,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        password: user.password,
        role: user.userType,
        createdAt: user.createdAt,
      };

      return this.generateTokens(transformedUser);
    } catch (error) {
      if (error instanceof InvalidatedRefreshTokenError) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      } as ActiveUserData,
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
