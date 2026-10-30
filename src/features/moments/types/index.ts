import type { BaseEntity } from '@/shared/types';

export interface Moment extends BaseEntity {
  title: string;
  description?: string;
  date: string; // ISO 8601 date string
  type: MomentType;
  location?: string;
  photo_url?: string;
  user_id: string;
  partner_id?: string;
  is_shared: boolean;
  tags?: string[];
  calendar_event_id?: string; // For native calendar sync
}

export type MomentType = 'date' | 'trip' | 'milestone' | 'ritual' | 'anniversary';

export type CreateMomentDTO = Omit<Moment, 'id' | 'created_at' | 'updated_at'>;

export type UpdateMomentDTO = Partial<CreateMomentDTO>;

export interface MomentFilters {
  type?: MomentType;
  /** Upcoming = date after now, past = date up to now (resolved by the repository) */
  when?: MomentTimeframe;
  /** Case-insensitive match on title, description, location and tags */
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  isShared?: boolean;
}

export type MomentTimeframe = 'upcoming' | 'past';

export interface MomentRepository {
  getAll(filters?: MomentFilters): Promise<Moment[]>;
  getById(id: string): Promise<Moment>;
  create(data: CreateMomentDTO): Promise<Moment>;
  update(id: string, data: UpdateMomentDTO): Promise<Moment>;
  delete(id: string): Promise<void>;
}
