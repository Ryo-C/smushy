import type { Mood } from '@/shared/utils/mood';

/** Story is read-only and derived from shared past moments and shared check-ins. */
export interface StoryItem {
  /** Unique within the feed, e.g. "moment:moment-1" */
  id: string;
  type: StoryItemType;
  /** ID of the moment or check-in this item comes from */
  source_id: string;
  date: string; // ISO 8601 date string
  /** Moment title (moments only) */
  title?: string;
  /** Moment description, or the check-in text */
  description?: string;
  photo_url?: string;
  location?: string;
  /** Check-ins only */
  mood?: StoryMood;
  author_name: string;
  /** True when the current user wrote it */
  is_mine: boolean;
}

export type StoryItemType = 'moment' | 'checkin';

export type StoryMood = Mood;

export type StoryOrder = 'newest' | 'oldest';

export interface StorySection {
  /** e.g. "2024-11" */
  key: string;
  /** e.g. "November 2024" */
  title: string;
  data: StoryItem[];
}

export interface StoryThrowback {
  item: StoryItem;
  yearsAgo: number;
}

export interface StoryRepository {
  /** All shared story items, newest first */
  getAll(): Promise<StoryItem[]>;
}
