# Story

Read-only timeline of the couple's shared past. Moments are where you create and manage things; Story is where you look back.

## What it shows
- Shared moments that have already happened, plus shared check-ins. Private items and upcoming moments never appear.
- Grouped by month, with a vertical timeline. Moments are photo-led cards (tap opens the moment inside the Story stack); check-ins are small quote cards.
- A throwback banner: a photo moment from the same month in an earlier year (closest day, then most recent year).
- Time filter (All time or a single year) and Newest / Oldest toggle. Both are client-side over the fetched list.

## Data
- No seed collection. `mockStoryRepository` derives items from `mock_moments` + `mock_checkins`, so anything created in the app shows up.
- Backend: `GET /story` returns `StoryItem[]`, newest first.
- Moment and check-in mutations invalidate `QUERY_KEYS.story.all`.

## Code
`src/features/story/` — `utils` (grouping, throwback, year filter, sort; tested), `components` (timeline row, cards, controls), `screens/StoryScreen.tsx`.
