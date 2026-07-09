import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './token-store.api';

export const SESSION_EXPIRED_EVENT = 'pantry:session-expired';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({ baseURL, withCredentials: true });
const refreshClient = axios.create({ baseURL, withCredentials: true });

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

interface RefreshResponseData {
  user: { id: string; name: string; email: string };
  accessToken: string;
}

export const requestNewAccessToken = async (): Promise<RefreshResponseData> => {
  const { data } = await refreshClient.post('/auth/refresh');
  const result: RefreshResponseData = data.data;
  tokenStore.setAccessToken(result.accessToken);
  return result;
};

const performRefresh = async (): Promise<string> => {
  const result = await requestNewAccessToken();
  return result.accessToken;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isUnauthorized = error.response?.status === 401;
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    if (isUnauthorized && originalRequest && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = performRefresh().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccessToken = await refreshPromise;

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch {
        tokenStore.clear();
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
    if (error.message === 'Network Error') return 'Cannot reach the server. Is it running?';
  }
  return fallback;
};