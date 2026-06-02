-- ============================================================
-- Football Journal — Initial Schema
-- ============================================================

-- Enable UUID extension (usually already enabled on Supabase)
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- users (mirrors auth.users, extended with role)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  role text not null check (role in ('player','parent','coach','admin')),
  avatar_url text,
  subscription_tier text default 'free',
  created_at timestamptz default now()
);

create table public.player_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date_of_birth date,
  dominant_foot text check (dominant_foot in ('right','left','both')),
  primary_position text,
  nationality text,
  avatar_url text,
  phone text,
  instagram_handle text,
  bio text,
  created_at timestamptz default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  label text not null,
  start_date date,
  end_date date,
  notes text,
  is_active boolean default false,
  created_at timestamptz default now()
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  logo_url text,
  website text,
  contact_email text,
  contact_phone text,
  has_professional_pathway boolean default false,
  notes text,
  created_at timestamptz default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  player_id uuid not null references public.users(id) on delete cascade,
  age_group text not null,
  team_label text not null,
  kit_primary_colour text,
  kit_secondary_colour text,
  training_hours_per_week numeric,
  league_level text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.teammates (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  name text not null,
  nickname text,
  positions text[],
  kit_number int,
  phone text,
  email text,
  instagram_handle text,
  notes text,
  created_at timestamptz default now()
);

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  player_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  type text check (type in ('league','cup','friendly','trial','tournament')),
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  competition_id uuid references public.competitions(id),
  date date not null,
  opponent text not null,
  venue_type text check (venue_type in ('home','away','neutral')),
  stage text check (stage in ('pool','knockout','final','group','friendly','other')),
  total_match_minutes int,
  minutes_played int,
  goals_for int,
  goals_against int,
  result text check (result in ('W','D','L')),
  mood text check (mood in ('brilliant','good','ok','tough','frustrated')),
  overall_rating numeric check (overall_rating between 1 and 10),
  created_at timestamptz default now()
);

create table public.match_positions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  position text not null,
  minutes_from int,
  minutes_to int
);

create table public.match_ratings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  dimension text not null,
  score int check (score between 1 and 10)
);

create table public.match_video_moments (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  url text not null,
  timestamp_in_video text,
  label text,
  notes text,
  moment_type text check (moment_type in ('highlight','learning','error','goal','assist')),
  created_at timestamptz default now()
);

create table public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  team_id uuid references public.teams(id),
  date date not null,
  duration_minutes int,
  session_type text check (session_type in ('technical','tactical','physical','set_pieces','small_sided','fitness','other')),
  focus_areas text[],
  coach_led boolean default true,
  notes text,
  rating int check (rating between 1 and 10),
  created_at timestamptz default now()
);

create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  entity_type text check (entity_type in ('match','training','standalone')),
  entity_id uuid,
  author_role text check (author_role in ('player','parent','coach')),
  went_well text,
  improve_next text,
  key_moment text,
  coach_feedback_received text,
  free_text text,
  visibility text default 'family' check (visibility in ('player_only','family','coach','public')),
  ai_feedback text,
  created_at timestamptz default now()
);

create table public.reflection_mentions (
  id uuid primary key default gen_random_uuid(),
  reflection_id uuid not null references public.reflections(id) on delete cascade,
  teammate_id uuid not null references public.teammates(id) on delete cascade,
  created_at timestamptz default now()
);

create table public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  date date not null,
  scores jsonb not null,
  ai_summary text,
  created_at timestamptz default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  team_id uuid references public.teams(id),
  text text not null,
  why text,
  pillar text,
  set_by text check (set_by in ('player','parent','coach')),
  target_date date,
  completed_at timestamptz,
  completion_reflection text,
  visibility text default 'family' check (visibility in ('player_only','family','coach','public')),
  created_at timestamptz default now()
);

create table public.season_reviews (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  team_reflections jsonb,
  proud text,
  hardest_moment text,
  new_skill text,
  gap text,
  coach_theme text,
  letter_to_self text,
  ratings jsonb,
  ai_feedback text,
  created_at timestamptz default now(),
  unique(player_id, season_id)
);

create table public.summer_plans (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  technical_skills jsonb,
  physical_skills jsonb,
  watch_skills jsonb,
  min_sessions_per_week int,
  session_length_minutes int,
  big_goal text,
  accountability_partner text,
  september_self_image text,
  ai_feedback text,
  created_at timestamptz default now(),
  unique(player_id, season_id)
);

create table public.player_photos (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  url text not null,
  caption text,
  date_taken date,
  season_id uuid references public.seasons(id),
  created_at timestamptz default now()
);

create table public.parent_observations (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  parent_user_id uuid not null references public.users(id) on delete cascade,
  entity_type text check (entity_type in ('match','training')),
  entity_id uuid,
  observation text not null,
  created_at timestamptz default now()
);

create table public.coach_access (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  coach_user_id uuid not null references public.users(id) on delete cascade,
  access_level text check (access_level in ('limited','full')),
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  unique(player_id, coach_user_id)
);

create table public.parent_links (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.users(id) on delete cascade,
  parent_user_id uuid not null references public.users(id) on delete cascade,
  linked_at timestamptz default now(),
  unique(player_id, parent_user_id)
);
