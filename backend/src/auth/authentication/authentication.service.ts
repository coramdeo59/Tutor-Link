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
import { AddressService } from '../../users/address/address.service';
import { pgUniqueViolationsErrorCode } from '../constant/pg-violation';
import { eq } from 'drizzle-orm';

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
    private readonly addressService: AddressService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        address,
        photo,
        userType,
        role,
      } = signUpDto;

      const hashedPassword = await this.hashingService.hash(password);

      const newUserResult = await this.database
        .insert(userSchema.users)
        .values({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          addressId: null,
          photo,
          role: role as Role,
          userType,
        })
        .returning();

      if (!Array.isArray(newUserResult) || newUserResult.length === 0) {
        throw new InternalServerErrorException(
          'Failed to create user: No data returned after insert.',
        );
      }
      const createdUser = newUserResult[0];

      if (!createdUser || typeof createdUser.userId === 'undefined') {
        throw new InternalServerErrorException(
          'Failed to create user: User ID is undefined after insert.',
        );
      }

      if (address) {
        const addressId = await this.addressService.create(
          createdUser.userId,
          address,
        );
        await this.database
          .update(userSchema.users)
          .set({ addressId: addressId })
          .where(eq(userSchema.users.userId, createdUser.userId));
      }

      return createdUser;
    } catch (err) {
      if (err.code === pgUniqueViolationsErrorCode) {
        throw new ConflictException('Email already exists');
      }
      if (err.code === '23503' && err.constraint === 'users_address_id_fkey') {
        throw new BadRequestException('Invalid address ID provided.');
      }
      console.error('Signup Error:', err);
      throw new InternalServerErrorException('User registration failed');
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
