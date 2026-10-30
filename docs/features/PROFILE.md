# Profile

## Behaviour
- Edit (top-right of the couple card) opens `/edit-profile`: name and a 140-character bio. A new name also shows on the partner's side (Story, check-ins).
- Couple card: both initial avatars, "Ryo & Roline", connected-since date and bio. Without a partner it shows an invite button (not available in the demo).
- Private → Check-ins.
- Reminders: nudges on/off with Daily / Weekly, notifications on/off. Preference updates are optimistic.
- Appearance: Coral / Serene / Forest. The theme picked on the sign-in screen (top-right pill) is saved to the account on sign-in (`preferences.theme_id`); changing it here saves it too.
- Log out is passed in by the route (`accountAction`) so the profile feature doesn't depend on auth.

## Data
- Backend: `GET /profile`, `GET /profile/partner`, `PATCH /profile/preferences`.
