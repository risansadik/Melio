import { injectable, inject } from 'inversify';
import { PrismaClient, RefreshToken } from '.prisma/client';
import { TYPES } from '../types/inversify.types';
import { IRefreshTokenRepository } from '../interfaces/refresh-token-repository.interface';

@injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(@inject(TYPES.PrismaClient) private readonly prisma: PrismaClient) {}

  async create(data: {
    id: string;
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  async findById(id: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { id } });
  }

  async markRevoked(id: string): Promise<void> {
    await this.prisma.refreshToken.update({ where: { id }, data: { revoked: true } });
  }
}
