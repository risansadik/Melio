import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  // Unexpected/programmer error — log full detail server-side, hide internals from the client.
  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again later.',
    ...(env.NODE_ENV === 'development' && err instanceof Error
      ? { debug: err.message, stack: err.stack }
      : {}),
  });
};
