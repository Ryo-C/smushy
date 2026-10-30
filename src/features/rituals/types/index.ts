import type { BaseEntity } from '@/shared/types';

export interface Ritual extends BaseEntity {
  title: string;
  description?: string;
  frequency: RitualFrequency;
  day_of_week?: number; // 0-6 for weekly rituals (0 = Sunday)
  day_of_month?: number; // 1-31 for monthly rituals
  time?: string; // HH:mm format (e.g., "18:30")
  is_active: boolean;
  last_completed?: string;
  next_occurrence?: string;
  user_id: string;
  partner_id?: string;
  reminder_enabled: boolean;
  reminder_minutes_before?: number;
  /** Feather icon name; falls back to one based on frequency */
  icon?: string;
}

export type RitualFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface NewRitualDTO {
  title: string;
  description?: string;
  frequency: RitualFrequency;
  day_of_week?: number;
  day_of_month?: number;
  time: string;
  reminder_enabled: boolean;
  reminder_minutes_before?: number;
  icon?: string;
}

export interface RitualRepository {
  /** The couple's rituals (both partners') */
  getAll(): Promise<Ritual[]>;
  /** Record that the ritual happened now */
  markCompleted(id: string): Promise<Ritual>;
  /** Pause or resume a ritual */
  setActive(id: string, isActive: boolean): Promise<Ritual>;
  create(data: NewRitualDTO): Promise<Ritual>;
  update(id: string, data: Partial<NewRitualDTO>): Promise<Ritual>;
  delete(id: string): Promise<void>;
}
