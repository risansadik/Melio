import { apiClient } from './client';
import { User } from '../types';

interface AuthResult {
  user: User;
  accessToken: string;
}

export const registerRequest = async (input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> => {
  const { data } = await apiClient.post('/auth/register', input);
  return data.data;
};

export const loginRequest = async (input: {
  email: string;
  password: string;
}): Promise<AuthResult> => {
  const { data } = await apiClient.post('/auth/login', input);
  return data.data;
};

export const logoutRequest = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};