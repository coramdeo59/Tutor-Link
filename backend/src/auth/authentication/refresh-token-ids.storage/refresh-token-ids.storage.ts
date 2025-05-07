import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../users/schema';
import { refreshTokens } from './schema';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import { InvalidatedRefreshTokenError } from '../exceptions/invalidated-refresh-token.exception';
import { eq, and, gt } from 'drizzle-orm';

@Injectable()
export class RefreshTokenIdsStorage {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema & { refreshTokens: typeof refreshTokens }>,
  ) {}

  async insert(userId: number, tokenId: string, ttl: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttl * 1000);
    await this.database.insert(refreshTokens).values({
      userId,
      tokenId,
      expiresAt,
    });
  }

  async validate(userId: number, tokenId: string): Promise<boolean> {
    const now = new Date();
    const token = await this.database.select().from(refreshTokens).where(
      and(
        eq(refreshTokens.userId, userId),
        eq(refreshTokens.tokenId, tokenId),
        gt(refreshTokens.expiresAt, now)
      )
    ).limit(1);
    if (!token || token.length === 0) {
      throw new InvalidatedRefreshTokenError();
    }
    return true;
  }

  async invalidate(userId: number, tokenId: string): Promise<void> {
    await this.database.delete(refreshTokens).where(
      and(
        eq(refreshTokens.userId, userId),
        eq(refreshTokens.tokenId, tokenId)
      )
    );
  }
}
