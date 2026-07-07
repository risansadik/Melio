import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

const SALT_ROUNDS = 12;

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; 

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const issueTokenPair = async (userId: string, email: string): Promise<AuthTokens> => {
  const jti = crypto.randomUUID();

  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = signRefreshToken({ sub: userId, jti });

  await prisma.refreshToken.create({
    data: {
      id: jti,
      tokenHash: hashToken(refreshToken),
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { accessToken, refreshToken };
};

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw AppError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
  });

  const tokens = await issueTokenPair(user.id, user.email);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    ...tokens,
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const tokens = await issueTokenPair(user.id, user.email);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    ...tokens,
  };
};

export const refreshTokens = async (presentedRefreshToken: string): Promise<AuthTokens> => {
  let payload;

  try {
    payload = verifyRefreshToken(presentedRefreshToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw AppError.unauthorized('Refresh token is no longer valid');
  }

  if (stored.tokenHash !== hashToken(presentedRefreshToken)) {
    throw AppError.unauthorized('Refresh token does not match stored record');
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });

  if (!user) {
    throw AppError.unauthorized('User no longer exists');
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  return issueTokenPair(user.id, user.email);
};

export const logoutUser = async (presentedRefreshToken: string): Promise<void> => {
  let payload;

  try {
    payload = verifyRefreshToken(presentedRefreshToken);
  } catch {
    return;
  }

  await prisma.refreshToken.updateMany({
    where: { id: payload.jti, revoked: false },
    data: { revoked: true },
  });
};
