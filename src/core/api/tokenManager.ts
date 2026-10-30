import { storage, STORAGE_KEYS } from '@/libs/storage';
import { BACKEND_CONFIG } from '@/shared/constants/config';

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;

const MAX_REFRESH_RETRIES = 1;

interface JWTPayload {
  sub: string;
  email: string;
  exp: number;
  iat: number;
}

export async function getToken(): Promise<string | null> {
  const token = await storage.getItem<string>(STORAGE_KEYS.BACKEND_ACCESS_TOKEN);

  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    try {
      const newToken = await refreshToken();
      return newToken;
    } catch (error) {
      await removeTokens();
      return null;
    }
  }

  const expiry = await storage.getItem<number>(STORAGE_KEYS.TOKEN_EXPIRY);
  if (expiry && Date.now() > expiry - TOKEN_REFRESH_THRESHOLD) {
    // Try to refresh proactively, but don't fail if it doesn't work
    try {
      const newToken = await refreshToken();
      return newToken;
    } catch {
      return token;
    }
  }

  return token;
}

export async function setTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): Promise<void> {
  const expiry = Date.now() + expiresIn * 1000;

  await Promise.all([
    storage.setItem(STORAGE_KEYS.BACKEND_ACCESS_TOKEN, accessToken),
    storage.setItem(STORAGE_KEYS.BACKEND_REFRESH_TOKEN, refreshToken),
    storage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiry),
  ]);
}

export async function removeTokens(): Promise<void> {
  await Promise.all([
    storage.removeItem(STORAGE_KEYS.BACKEND_ACCESS_TOKEN),
    storage.removeItem(STORAGE_KEYS.BACKEND_REFRESH_TOKEN),
    storage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
  ]);
}

export async function refreshToken(): Promise<string> {
  const refreshToken = await storage.getItem<string>(
    STORAGE_KEYS.BACKEND_REFRESH_TOKEN
  );

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${BACKEND_CONFIG.baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();

  await setTokens(data.access_token, refreshToken, data.expires_in);

  return data.access_token;
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);

    if (!payload || !payload.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now + 10;
  } catch {
    return true;
  }
}

/** Decodes without verifying the signature; only used to read the `exp` claim. */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    );

    return decoded as JWTPayload;
  } catch {
    return null;
  }
}

export async function getTokenExpiry(): Promise<number | null> {
  return storage.getItem<number>(STORAGE_KEYS.TOKEN_EXPIRY);
}

export async function hasValidTokens(): Promise<boolean> {
  const token = await storage.getItem<string>(STORAGE_KEYS.BACKEND_ACCESS_TOKEN);

  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}
