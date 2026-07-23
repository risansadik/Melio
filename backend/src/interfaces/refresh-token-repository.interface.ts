import { RefreshToken } from '.prisma/client';

export interface IRefreshTokenRepository {
  create(data: {
    id: string;
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken>;
  findById(id: string): Promise<RefreshToken | null>;
  markRevoked(id: string): Promise<void>;
}
