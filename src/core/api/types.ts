import type { AuthUser, AuthSession } from '@/features/auth/types';
import type { Moment, MomentType } from '@/features/moments/types';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    partner_id?: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface CreateMomentRequest {
  title: string;
  description?: string;
  date: string;
  type: MomentType;
  location?: string;
  photo_url?: string;
  is_shared: boolean;
  tags?: string[];
}

export interface UpdateMomentRequest {
  title?: string;
  description?: string;
  date?: string;
  type?: MomentType;
  location?: string;
  photo_url?: string;
  is_shared?: boolean;
  tags?: string[];
}

export interface MomentResponse {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: MomentType;
  location?: string;
  photo_url?: string;
  user_id: string;
  partner_id?: string;
  is_shared: boolean;
  tags?: string[];
  calendar_event_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  validation?: Record<string, string[]>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  skipAuth?: boolean;
  timeout?: number;
}
