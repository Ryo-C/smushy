export const QUERY_KEYS = {
  auth: {
    session: ['auth', 'session'] as const,
    user: ['auth', 'user'] as const,
  },
  moments: {
    all: ['moments'] as const,
    // Filters must be part of the key, or every filter shares one cached result
    list: (filters?: object) => ['moments', 'list', filters ?? {}] as const,
    byId: (id: string) => ['moments', id] as const,
    byDate: (date: string) => ['moments', 'date', date] as const,
  },
  story: {
    all: ['story'] as const,
    recent: (limit: number) => ['story', 'recent', limit] as const,
  },
  checkins: {
    all: ['checkins'] as const,
    byId: (id: string) => ['checkins', id] as const,
    mine: ['checkins', 'mine'] as const,
  },
  rituals: {
    all: ['rituals'] as const,
    byId: (id: string) => ['rituals', id] as const,
    active: ['rituals', 'active'] as const,
  },
  profile: {
    current: ['profile', 'current'] as const,
    partner: ['profile', 'partner'] as const,
  },
} as const;
