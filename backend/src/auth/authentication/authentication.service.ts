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
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage/refresh-token-ids.storage';
import { randomUUID } from 'crypto';
import { InvalidatedRefreshTokenError } from './exceptions/invalidated-refresh-token.exception';
import { Role } from '../../users/enums/role-enums';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const { name, email, password, role } = signUpDto;
      const hashedPassword = await this.hashingService.hash(password);

      return await this.database
        .insert(schema.users)
        .values({
          name,
          email,
          password: hashedPassword,
          role: role || Role.Regular,
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

    return await this.generateTokens(user);
  }

  public async generateTokens(user: { id: number; name: string; email: string; password: string; role: string; createdAt?: Date | null; }) {
    const refreshTokenId = randomUUID();
    
    // Convert string role to enum
    const userRole = user.role as Role;
    
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { email: user.email, role: userRole }
      ),
      this.signToken<Partial<ActiveUserData>>(
        user.id, 
        this.jwtConfiguration.refreshTokenTtl,
        { refreshTokenId }
      ),
    ]);
    
    // Store the refresh token ID with expiration
    await this.refreshTokenIdsStorage.insert(
      user.id,
      refreshTokenId,
      this.jwtConfiguration.refreshTokenTtl
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
        }
      );
      
      const { sub, refreshTokenId } = payload;
      
      if (!refreshTokenId) {
        throw new UnauthorizedException('Refresh token ID not found');
      }
      
      
      await this.refreshTokenIdsStorage.validate(sub, refreshTokenId);
      
      // Invalidate the current refresh token
      await this.refreshTokenIdsStorage.invalidate(sub, refreshTokenId);
      
      const user = await this.database.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, sub),
      });
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      return this.generateTokens(user);
        
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
