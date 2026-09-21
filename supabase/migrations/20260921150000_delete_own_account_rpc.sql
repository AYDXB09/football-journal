-- Self-service account deletion, backing Setup -> Danger zone.
--
-- public.users has no FK to auth.users (linked by matching id, not a foreign
-- key), so both must be deleted explicitly. Deleting public.users cascades
-- to every table scoped by player_id/user_id (seasons, clubs, teams,
-- teammates, competitions, matches + their children, training_sessions,
-- reflections, diagnostics, goals, season_reviews, summer_plans,
-- player_photos, parent_observations, coach_access, parent_links) -- all
-- declared "on delete cascade" in the initial schema.
--
-- Four columns are NO ACTION (not CASCADE) references to tables that are
-- themselves cascade-deleted via their own player_id -> public.users FK:
-- matches.competition_id, training_sessions.team_id, goals.team_id, and
-- player_photos.season_id. Left alone, deleting e.g. a competitions row
-- while a matches row still points at it (even one that's *also* about to
-- be cascade-deleted in the same statement) raises a foreign key violation.
-- All four are nullable, so clear them first rather than delete the
-- referencing rows out of order.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.matches set competition_id = null where player_id = uid;
  update public.training_sessions set team_id = null where player_id = uid;
  update public.goals set team_id = null where player_id = uid;
  update public.player_photos set season_id = null where player_id = uid;

  delete from public.users where id = uid;
  delete from auth.users where id = uid;
end;
$$;

-- Postgres grants EXECUTE to PUBLIC (including anon) on function creation by
-- default unless a database-level default-privilege override says otherwise.
-- The function's own auth.uid()-is-null check already blocks an actual
-- unauthenticated deletion, but a destructive RPC has no business being
-- callable at all by anon -- revoke explicitly rather than rely on that.
revoke execute on function public.delete_own_account() from public;
revoke execute on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;
