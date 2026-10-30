# Rituals

Recurring things the couple does together (Sunday market, Friday catch-up, monthly date night). No streaks or completion counts, on purpose.

## Behaviour
- "Coming up" lists active rituals sorted by next occurrence; "Paused" lists the rest.
- Next occurrence is computed on device from `frequency`, `day_of_week` / `day_of_month` and `time` (`getNextOccurrence`), not stored.
- **Done** sets `last_completed` (button shows "Done today"); **Pause / Resume** toggles `is_active`.
- Tap a ritual to edit or delete it (`/ritual/[id]`). Each ritual has an icon picked from a calm set (`RITUAL_ICONS`); older ones without an icon fall back to one based on frequency.
- New rituals are created from the + button (Add → Ritual), route `/new-ritual`.
- Reminders: 2h, 12h or 1 day before (`reminder_minutes_before` = 120 / 720 / 1440). The card shows the lead time next to the bell.

## Data
- Both partners see and update the couple's rituals.
- Backend: `GET /rituals`, `POST /rituals`, `POST /rituals/:id/complete`, `PATCH /rituals/:id`.

## Code
`src/features/rituals/` — `utils` (schedule maths and labels; tested), `components/RitualCard.tsx`, `screens/RitualsScreen.tsx`, `screens/NewRitualScreen.tsx`.
