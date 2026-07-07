import { apiClient } from './client';
import { tokenStore } from './token-store.api';
import { AuthResponse } from '../types';

export const registerRequest = async (input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const { data } = await apiClient.post('/auth/register', input);
  return data.data;
};

export const loginRequest = async (input: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const { data } = await apiClient.post('/auth/login', input);
  return data.data;
};

export const logoutRequest = async (): Promise<void> => {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return;
  await apiClient.post('/auth/logout', { refreshToken });
};
