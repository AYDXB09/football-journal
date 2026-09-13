-- Move "league level" conceptually from teams to competitions (a league level is a
-- property of the specific competition entry, not a permanent team attribute), and
-- add a per-competition default match duration that cascades into Log Match.
--
-- teams.league_level and teams.training_hours_per_week are intentionally left in
-- place (not dropped) so existing data isn't lost — they're just no longer surfaced
-- in the Team form.

alter table public.competitions
  add column if not exists league_level text,
  add column if not exists default_match_minutes integer;

-- One-time backfill: for competitions whose team already had a league_level set,
-- carry that value over as the competition's initial league_level.
update public.competitions c
set league_level = t.league_level
from public.teams t
where c.team_id = t.id
  and c.league_level is null
  and t.league_level is not null;
