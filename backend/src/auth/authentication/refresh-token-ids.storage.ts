import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenIdsStorage {
  private storage = new Map<string, number>();

  async insert(tokenId: string, userId: number) {
    this.storage.set(tokenId, userId);
  }

  async validate(tokenId: string, userId: number) {
    if (this.storage.get(tokenId) !== userId) {
      throw new Error('Invalid refresh token');
    }
  }

  async invalidate(tokenId: string, userId: number) {
    this.storage.delete(tokenId);
  }
}
