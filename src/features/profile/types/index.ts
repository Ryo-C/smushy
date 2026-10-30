import type { BaseEntity } from '@/shared/types';

export interface UserProfile extends BaseEntity {
  user_id: string; // Matches auth user ID
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  partner_id?: string;
  partner_connected_at?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  /** Colour theme id (see shared/theme/presets), saved when signing in or changing it in Profile */
  theme_id?: string;
  notifications_enabled: boolean;
  nudges_enabled: boolean;
  nudge_frequency: 'daily' | 'weekly' | 'never';
  share_checkins_by_default: boolean;
}

export interface ProfileRepository {
  getCurrent(): Promise<UserProfile>;
  getPartner(): Promise<UserProfile | null>;
  updatePreferences(preferences: Partial<UserPreferences>): Promise<UserProfile>;
  updateDetails(details: { name: string; bio?: string }): Promise<UserProfile>;
}
