import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../types/inversify.types';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import {
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
  setRefreshTokenCookie,
} from '../utils/cookies';
import { IAuthService } from '../interfaces/auth-service.interface';

@injectable()
export class AuthController {
  constructor(@inject(TYPES.AuthService) private readonly _authService: IAuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await this._authService.registerUser(req.body);
    setRefreshTokenCookie(res, refreshToken);
    res.status(201).json({ status: 'success', data: { user, accessToken } });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await this._authService.loginUser(req.body);
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ status: 'success', data: { user, accessToken } });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const presentedToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (!presentedToken) {
      throw AppError.unauthorized('No refresh token cookie present');
    }

    const { accessToken, refreshToken, user } = await this._authService.refreshTokens(
      presentedToken
    );
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ status: 'success', data: { user, accessToken } });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const presentedToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (presentedToken) {
      await this._authService.logoutUser(presentedToken);
    }

    clearRefreshTokenCookie(res);
    res.status(200).json({ status: 'success', data: null });
  });
}