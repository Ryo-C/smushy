import type { Mood } from '@/shared/utils/mood';
import type { BaseEntity } from '@/shared/types';

export interface CheckIn extends BaseEntity {
  user_id: string;
  prompt_id?: string;
  content: string;
  mood?: MoodType;
  is_shared: boolean;
  shared_at?: string;
  partner_viewed: boolean;
}

export type MoodType = Mood;

export interface CheckInPrompt extends BaseEntity {
  text: string;
  category: PromptCategory;
}

export type PromptCategory = 'reflection' | 'gratitude' | 'connection';

export interface CheckInEntry extends CheckIn {
  author_name: string;
  is_mine: boolean;
}

export interface NewCheckInDTO {
  content: string;
  mood: MoodType;
  is_shared: boolean;
}

export interface CheckInRepository {
  /** Your check-ins (shared and private) plus your partner's shared ones, newest first */
  getVisible(): Promise<CheckInEntry[]>;
  create(data: NewCheckInDTO): Promise<CheckIn>;
  /** Only your own check-ins can be edited or deleted */
  update(id: string, data: Partial<NewCheckInDTO>): Promise<CheckIn>;
  delete(id: string): Promise<void>;
}
