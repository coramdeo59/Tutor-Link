import { Injectable, Inject } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and, lt } from "drizzle-orm";
import { refreshTokens, NewRefreshToken, RefreshToken } from "./schema/refresh-tokens.schema";

import { InvalidatedRefreshTokenError } from "../exceptions/invalidated-refresh-token.exception";
import { DATABASE_CONNECTION } from "src/core/database-connection";

@Injectable()
export class RefreshTokenIdsStorage {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<{ refreshTokens: typeof refreshTokens }>
  ) {}

  private async deleteExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.database
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, now));
  }

  async insert(userId: number, tokenId: string, ttl: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const newToken: NewRefreshToken = {
      userId,
      tokenId,
      expiresAt,
    };

    await this.deleteExpiredTokens();
    await this.database.insert(refreshTokens).values(newToken);
  }

  async validate(userId: number, tokenId: string): Promise<boolean> {
    await this.deleteExpiredTokens();

    const token: RefreshToken[] = await this.database
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.tokenId, tokenId)
        )
      )
      .limit(1);

    if (!token.length) {
      throw new InvalidatedRefreshTokenError();
    }

    return true;
  }

  async invalidate(userId: number, tokenId: string): Promise<void> {
    await this.database
      .delete(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.tokenId, tokenId)
        )
      );
  }
}
