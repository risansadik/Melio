import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { clearRefreshTokenCookie, REFRESH_TOKEN_COOKIE_NAME, setRefreshTokenCookie } from '../utils/cookies';
import * as authService from '../services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await authService.registerUser(req.body);
  setRefreshTokenCookie(res, refreshToken);
  res.status(201).json({ status: 'success', data: { user, accessToken } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await authService.loginUser(req.body);
  setRefreshTokenCookie(res, refreshToken);
  res.status(200).json({ status: 'success', data: { user, accessToken } });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const presentedToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (!presentedToken) {
    throw AppError.unauthorized('No refresh token cookie present');
  }

  const { accessToken, refreshToken, user } = await authService.refreshTokens(presentedToken);
  setRefreshTokenCookie(res, refreshToken);
  res.status(200).json({ status: 'success', data: { user, accessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const presentedToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (presentedToken) {
    await authService.logoutUser(presentedToken);
  }

  clearRefreshTokenCookie(res);
  res.status(200).json({ status: 'success', data: null });
});