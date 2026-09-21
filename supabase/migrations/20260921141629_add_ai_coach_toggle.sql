-- Real on/off control for the AI coach feature, enforced server-side (see
-- src/lib/utils/aiGate.ts) — not just a UI toggle. Defaults to true to match
-- today's actual always-on behavior for every existing player.
alter table public.player_profiles
  add column if not exists ai_coach_enabled boolean not null default true;

-- player_profiles.user_id had no uniqueness guarantee (the table was
-- effectively unused until now — no signup flow ever created a row here).
-- The Setup page's toggle does `upsert(..., { onConflict: 'user_id' })`,
-- which needs a real unique constraint to work at all, and one-profile-per-
-- player is the actual intent regardless.
alter table public.player_profiles
  add constraint player_profiles_user_id_key unique (user_id);
