-- Lightweight parental-consent capture at signup. No verification loop (the
-- guardian's email isn't confirmed by a click-through) — this is an explicit
-- record of what was asserted at account-creation time, not a hardened
-- verified-consent flow. See docs/TERMS.md / docs/PRIVACY.md.
alter table public.player_profiles
  add column if not exists is_minor boolean,
  add column if not exists guardian_name text,
  add column if not exists guardian_email text,
  add column if not exists consent_given_at timestamptz;

-- Previously only inserted into public.users. Now also creates the
-- player_profiles row at signup time (for role='player' only) so the
-- consent fields captured on the signup form are persisted immediately,
-- rather than waiting on a profile-editing feature that doesn't exist yet.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'player')
  );

  if coalesce(new.raw_user_meta_data->>'role', 'player') = 'player' then
    insert into public.player_profiles (user_id, is_minor, guardian_name, guardian_email, consent_given_at)
    values (
      new.id,
      (new.raw_user_meta_data->>'is_minor')::boolean,
      new.raw_user_meta_data->>'guardian_name',
      new.raw_user_meta_data->>'guardian_email',
      now()
    );
  end if;

  return new;
end;
$$;
