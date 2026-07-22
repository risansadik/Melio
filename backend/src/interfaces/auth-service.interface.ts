import { LoginInput, RegisterInput } from '../validators/auth.validator';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type PublicUser = { id: string; name: string; email: string };


export interface IAuthService {
  registerUser(input: RegisterInput): Promise<AuthTokens & { user: PublicUser }>;
  loginUser(input: LoginInput): Promise<AuthTokens & { user: PublicUser }>;
  refreshTokens(presentedRefreshToken: string): Promise<AuthTokens & { user: PublicUser }>;
  logoutUser(presentedRefreshToken: string): Promise<void>;
}
