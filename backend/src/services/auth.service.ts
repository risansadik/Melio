import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { TYPES } from '../types/inversify.types';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { LoginInput, RegisterInput } from '../validators/auth.validator';
import { IAuthService, AuthTokens, PublicUser } from '../interfaces/auth-service.interface';

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@injectable()
export class AuthService implements IAuthService {
  constructor(@inject(TYPES.PrismaClient) private readonly _prisma: PrismaClient) { }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async issueTokenPair(userId: string, email: string): Promise<AuthTokens> {
    const jti = crypto.randomUUID();
    const accessToken = signAccessToken({ sub: userId, email });
    const refreshToken = signRefreshToken({ sub: userId, jti });

    await this._prisma.refreshToken.create({
      data: {
        id: jti,
        tokenHash: this.hashToken(refreshToken),
        userId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return { accessToken, refreshToken };
  }

  async registerUser(input: RegisterInput): Promise<AuthTokens & { user: PublicUser }> {
    const existing = await this._prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw AppError.conflict('An account with this email already exists');

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await this._prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash },
    });

    const tokens = await this.issueTokenPair(user.id, user.email);
    return { user: { id: user.id, name: user.name, email: user.email }, ...tokens };
  }

  async loginUser(input: LoginInput): Promise<AuthTokens & { user: PublicUser }> {
    const user = await this._prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw AppError.unauthorized('Invalid email or password');

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) throw AppError.unauthorized('Invalid email or password');

    const tokens = await this.issueTokenPair(user.id, user.email);
    return { user: { id: user.id, name: user.name, email: user.email }, ...tokens };
  }

  async refreshTokens(presentedRefreshToken: string): Promise<AuthTokens & { user: PublicUser }> {
    let payload;
    try {
      payload = verifyRefreshToken(presentedRefreshToken);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const stored = await this._prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw AppError.unauthorized('Refresh token is no longer valid');
    }
    if (stored.tokenHash !== this.hashToken(presentedRefreshToken)) {
      throw AppError.unauthorized('Refresh token does not match stored record');
    }

    const user = await this._prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) throw AppError.unauthorized('User no longer exists');

    await this._prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const tokens = await this.issueTokenPair(user.id, user.email);
    return { ...tokens, user: { id: user.id, name: user.name, email: user.email } };
  }

  async logoutUser(presentedRefreshToken: string): Promise<void> {
    let payload;
    try {
      payload = verifyRefreshToken(presentedRefreshToken);
    } catch {
      return;
    }
    await this._prisma.refreshToken.updateMany({
      where: { id: payload.jti, revoked: false },
      data: { revoked: true },
    });
  }
}