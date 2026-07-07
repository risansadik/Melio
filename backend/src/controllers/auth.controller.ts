import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({ status: 'success', data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json({ status: 'success', data: result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokens = await authService.refreshTokens(req.body.refreshToken);
  res.status(200).json({ status: 'success', data: tokens });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutUser(req.body.refreshToken);
  res.status(200).json({ status: 'success', data: null });
});