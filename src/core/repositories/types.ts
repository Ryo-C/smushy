import type {
  SignInCredentials,
  SignUpCredentials,
  AuthUser,
  AuthSession,
} from '@/features/auth/types';

import type {
  Moment,
  CreateMomentDTO,
  UpdateMomentDTO,
  MomentFilters,
} from '@/features/moments/types';

import type { StoryItem } from '@/features/story/types';

import type { NewRitualDTO, Ritual } from '@/features/rituals/types';

import type { CheckIn, CheckInEntry, NewCheckInDTO } from '@/features/checkins/types';

import type { UserPreferences, UserProfile } from '@/features/profile/types';

export interface AuthRepository {
  signIn: (credentials: SignInCredentials) => Promise<{
    user: AuthUser;
    session: AuthSession
  }>;
  signUp: (credentials: SignUpCredentials) => Promise<{
    user: AuthUser;
    session: AuthSession
  }>;
  signOut: () => Promise<void>;
  getSession: () => Promise<AuthSession | null>;
  getUser: () => Promise<AuthUser | null>;
  signInWithGoogle: () => Promise<{ user: AuthUser; session: AuthSession }>;
  signInWithApple: () => Promise<{ user: AuthUser; session: AuthSession }>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export interface MomentRepository {
  getAll: (filters?: MomentFilters) => Promise<Moment[]>;
  getById: (id: string) => Promise<Moment>;
  create: (moment: CreateMomentDTO) => Promise<Moment>;
  update: (id: string, updates: UpdateMomentDTO) => Promise<Moment>;
  delete: (id: string) => Promise<void>;
}

/** Read-only: the story is derived from shared moments and check-ins */
export interface StoryRepository {
  getAll: () => Promise<StoryItem[]>;
}

export interface CheckInRepository {
  getVisible: () => Promise<CheckInEntry[]>;
  create: (data: NewCheckInDTO) => Promise<CheckIn>;
  update: (id: string, data: Partial<NewCheckInDTO>) => Promise<CheckIn>;
  delete: (id: string) => Promise<void>;
}

export interface RitualRepository {
  getAll: () => Promise<Ritual[]>;
  markCompleted: (id: string) => Promise<Ritual>;
  setActive: (id: string, isActive: boolean) => Promise<Ritual>;
  create: (data: NewRitualDTO) => Promise<Ritual>;
  update: (id: string, data: Partial<NewRitualDTO>) => Promise<Ritual>;
  delete: (id: string) => Promise<void>;
}

export interface ProfileRepository {
  getCurrent: () => Promise<UserProfile>;
  getPartner: () => Promise<UserProfile | null>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<UserProfile>;
  updateDetails: (details: { name: string; bio?: string }) => Promise<UserProfile>;
}

export interface Repositories {
  auth: AuthRepository;
  moments: MomentRepository;
  story: StoryRepository;
  checkIns: CheckInRepository;
  rituals: RitualRepository;
  profile: ProfileRepository;
}
