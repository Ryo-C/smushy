# Check-ins

A mood and a line about how you're doing. Private by default; sharing is a per-check-in choice.

## Behaviour
- List (Profile → Check-ins): your check-ins (shared and private, marked "Shared" / "Only you") plus your partner's shared ones.
- New check-in: Add → Check-in, or the prompt card on the list. Route `/new-check-in` (root-level modal).
- Shared check-ins also appear in Story.
- Tap your own check-in to edit or delete it (`/check-in/[id]`). Your partner's are read-only.
- Both partners' check-ins look the same; only a small "You" / name line says who. Moods are shared, so nothing should make it easy to compare who checks in more. No counts or per-person totals.

## Data
- Backend: `GET /checkins` returns `CheckInEntry[]` (with `author_name`, `is_mine`), `POST /checkins`.
- Moods live in `src/shared/utils/mood.ts` because Story uses them too.
