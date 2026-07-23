import { injectable, inject } from 'inversify';
import { PrismaClient, User } from '@prisma/client';
import { TYPES } from '../types/inversify.types';
import { IUserRepository } from '../interfaces/user-repository.interface';

@injectable()
export class UserRepository implements IUserRepository {
  constructor(@inject(TYPES.PrismaClient) private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: { name: string; email: string; passwordHash: string }): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
