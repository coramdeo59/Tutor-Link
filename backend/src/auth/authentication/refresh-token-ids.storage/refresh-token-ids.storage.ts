import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import { InvalidatedRefreshTokenError } from '../exceptions/invalidated-refresh-token.exception';

@Injectable()
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redisClient: Redis;
  onApplicationBootstrap() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6373,
    });
  }
  onApplicationShutdown() {
    return this.redisClient.quit();
  }

  /**
   * Generates a Redis key for storing a refresh token ID
   * @param userId The user ID
   * @param tokenId The refresh token ID
   * @returns The formatted Redis key
   */
  private getKey(userId: number): string {
    return `refresh-token:${userId}`;
  }

  /**
   * Inserts a refresh token ID into Redis with an expiration time
   * @param userId The user ID
   * @param tokenId The refresh token ID
   * @param ttl Time to live in seconds
   */
  async insert(userId: number, tokenId: string, ttl: number): Promise<void> {
    await this.redisClient.set(this.getKey(userId), tokenId, 'EX', ttl);
  }

  /**
   * Validates if a refresh token ID exists and is valid
   * @param userId The user ID
   * @param tokenId The refresh token ID
   * @returns Boolean indicating if the token is valid
   * @throws InvalidatedRefreshTokenError if the token is invalid
   */
  async validate(userId: number, tokenId: string): Promise<boolean> {
    const storedId = await this.redisClient.get(this.getKey(userId));
    
    if (storedId === null) {
      throw new InvalidatedRefreshTokenError();
    }
    
    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }
    
    return true;
  }

  /**
   * Invalidates a refresh token by removing it from Redis
   * @param userId The user ID
   * @param tokenId The refresh token ID to invalidate
   */
  async invalidate(userId: number, tokenId: string): Promise<void> {
    // Since we use userId as the key and store only one token per user,
    // we just delete the Redis key regardless of the tokenId
    const key = this.getKey(userId);
    await this.redisClient.del(key);
  }
}
