-- ============================================================
-- Football Journal — Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.player_profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.clubs enable row level security;
alter table public.teams enable row level security;
alter table public.teammates enable row level security;
alter table public.competitions enable row level security;
alter table public.matches enable row level security;
alter table public.match_positions enable row level security;
alter table public.match_ratings enable row level security;
alter table public.match_video_moments enable row level security;
alter table public.training_sessions enable row level security;
alter table public.reflections enable row level security;
alter table public.reflection_mentions enable row level security;
alter table public.diagnostics enable row level security;
alter table public.goals enable row level security;
alter table public.season_reviews enable row level security;
alter table public.summer_plans enable row level security;
alter table public.player_photos enable row level security;
alter table public.parent_observations enable row level security;
alter table public.coach_access enable row level security;
alter table public.parent_links enable row level security;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Check if current user is a parent of a given player
create or replace function public.is_parent_of(player uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.parent_links
    where player_id = player
    and parent_user_id = auth.uid()
  );
$$;

-- Check if current user is an accepted coach of a given player
create or replace function public.is_coach_of(player uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.coach_access
    where player_id = player
    and coach_user_id = auth.uid()
    and accepted_at is not null
    and revoked_at is null
  );
$$;

-- Check if current user is a full-access coach of a given player
create or replace function public.is_full_coach_of(player uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.coach_access
    where player_id = player
    and coach_user_id = auth.uid()
    and access_level = 'full'
    and accepted_at is not null
    and revoked_at is null
  );
$$;

-- ============================================================
-- USERS
-- ============================================================

create policy "Users can read own record"
  on public.users for select
  using (id = auth.uid());

create policy "Users can update own record"
  on public.users for update
  using (id = auth.uid());

create policy "Users can insert own record"
  on public.users for insert
  with check (id = auth.uid());

-- Parents/coaches can see player name and role (needed for dashboards)
create policy "Parents can see linked player profile"
  on public.users for select
  using (public.is_parent_of(id) or public.is_coach_of(id));

-- ============================================================
-- PLAYER PROFILES
-- ============================================================

create policy "Player can manage own profile"
  on public.player_profiles for all
  using (user_id = auth.uid());

create policy "Parents can read player profile"
  on public.player_profiles for select
  using (public.is_parent_of(user_id));

create policy "Coaches can read player profile"
  on public.player_profiles for select
  using (public.is_coach_of(user_id));

-- ============================================================
-- SEASONS
-- ============================================================

create policy "Player can manage own seasons"
  on public.seasons for all
  using (player_id = auth.uid());

create policy "Parents can read seasons"
  on public.seasons for select
  using (public.is_parent_of(player_id));

create policy "Coaches can read seasons"
  on public.seasons for select
  using (public.is_coach_of(player_id));

-- ============================================================
-- CLUBS
-- ============================================================

create policy "Player can manage own clubs"
  on public.clubs for all
  using (player_id = auth.uid());

create policy "Parents can read clubs"
  on public.clubs for select
  using (public.is_parent_of(player_id));

create policy "Coaches can read clubs"
  on public.clubs for select
  using (public.is_coach_of(player_id));

-- ============================================================
-- TEAMS
-- ============================================================

create policy "Player can manage own teams"
  on public.teams for all
  using (player_id = auth.uid());

create policy "Parents can read teams"
  on public.teams for select
  using (public.is_parent_of(player_id));

create policy "Coaches can read teams"
  on public.teams for select
  using (public.is_coach_of(player_id));

-- ============================================================
-- TEAMMATES — player only, no parent/coach access
-- ============================================================

create policy "Player can manage own teammates"
  on public.teammates for all
  using (player_id = auth.uid());

-- ============================================================
-- COMPETITIONS
-- ============================================================

create policy "Player can manage own competitions"
  on public.competitions for all
  using (player_id = auth.uid());

create policy "Parents can read competitions"
  on public.competitions for select
  using (public.is_parent_of(player_id));

create policy "Coaches can read competitions"
  on public.competitions for select
  using (public.is_coach_of(player_id));

-- ============================================================
-- MATCHES
-- ============================================================

create policy "Player can manage own matches"
  on public.matches for all
  using (player_id = auth.uid());

create policy "Parents can read matches"
  on public.matches for select
  using (public.is_parent_of(player_id));

create policy "Coaches can read matches"
  on public.matches for select
  using (public.is_coach_of(player_id));

-- ============================================================
-- MATCH POSITIONS
-- ============================================================

create policy "Player can manage match positions"
  on public.match_positions for all
  using (exists (
    select 1 from public.matches m
    where m.id = match_id and m.player_id = auth.uid()
  ));

create policy "Parents can read match positions"
  on public.match_positions for select
  using (exists (
    select 1 from public.matches m
    where m.id = match_id and public.is_parent_of(m.player_id)
  ));

create policy "Coaches can read match positions"
  on public.match_positions for select
  using (exists (
    select 1 from public.matches m
    where m.id = match_id and public.is_coach_of(m.player_id)
  ));

-- ============================================================
-- MATCH RATINGS
-- ============================================================

create policy "Player can manage match ratings"
  on public.match_ratings for all
  using (exists (
    select 1 from public.matches m
    where m.id = match_id and m.player_id = auth.uid()
  ));

create policy "Parents can read match ratings"
  on public.match_ratings for select
  using (exists (
    select 1 from public.matches m
    where m.id = match_id and public.is_parent_of(m.player_id)
  ));

create policy "Coaches can read match ratings"
  on public.match_ratings for select
  using (exists (
    select 1 from public.matches m
    where m.id = match_id and public.is_coach_of(m.player_id)
  ));

-- ============================================================
-- MATCH VIDEO MOMENTS
-- ============================================================

create policy "Player can manage video moments"
  on public.match_video_moments for all
  using (exists (
    select 1 from public.matches m
    where m.id = match_id and m.player_id = auth.uid()
  ));

create policy "Parents can read video moments"
  on public.match_video_moments for select
  using (exists (
    select 1 from public.matches m
    where m.id = match_id and public.is_parent_of(m.player_id)
  ));

create policy "Coaches can read video moments"
  on public.match_video_moments for select
  using (exists (
    select 1 from public.matches m
    where m.id = match_id and public.is_coach_of(m.player_id)
  ));

-- ============================================================
-- TRAINING SESSIONS
-- ============================================================

create policy "Player can manage own training"
  on public.training_sessions for all
  using (player_id = auth.uid());

create policy "Parents can read training"
  on public.training_sessions for select
  using (public.is_parent_of(player_id));

create policy "Coaches can read training"
  on public.training_sessions for select
  using (public.is_coach_of(player_id));

-- ============================================================
-- REFLECTIONS — visibility-aware
-- ============================================================

create policy "Player can manage own reflections"
  on public.reflections for all
  using (player_id = auth.uid());

-- Parents can read reflections except player_only
create policy "Parents can read non-private reflections"
  on public.reflections for select
  using (
    public.is_parent_of(player_id)
    and visibility != 'player_only'
  );

-- Full coaches can read reflections except player_only
create policy "Full coaches can read non-private reflections"
  on public.reflections for select
  using (
    public.is_full_coach_of(player_id)
    and visibility != 'player_only'
  );

-- Limited coaches can only read coach-visibility or public
create policy "Limited coaches can read coach-visible reflections"
  on public.reflections for select
  using (
    public.is_coach_of(player_id)
    and visibility in ('coach','public')
  );

-- ============================================================
-- REFLECTION MENTIONS
-- ============================================================

create policy "Player can manage reflection mentions"
  on public.reflection_mentions for all
  using (exists (
    select 1 from public.reflections r
    where r.id = reflection_id and r.player_id = auth.uid()
  ));

-- ============================================================
-- DIAGNOSTICS
-- ============================================================

create policy "Player can manage own diagnostics"
  on public.diagnostics for all
  using (player_id = auth.uid());

create policy "Parents can read diagnostics"
  on public.diagnostics for select
  using (public.is_parent_of(player_id));

create policy "Coaches can read diagnostics"
  on public.diagnostics for select
  using (public.is_coach_of(player_id));

-- ============================================================
-- GOALS
-- ============================================================

create policy "Player can manage own goals"
  on public.goals for all
  using (player_id = auth.uid());

create policy "Parents can read goals"
  on public.goals for select
  using (
    public.is_parent_of(player_id)
    and visibility != 'player_only'
  );

create policy "Coaches can read goals"
  on public.goals for select
  using (
    public.is_coach_of(player_id)
    and visibility in ('coach','public')
  );

-- ============================================================
-- SEASON REVIEWS
-- ============================================================

create policy "Player can manage own season reviews"
  on public.season_reviews for all
  using (player_id = auth.uid());

create policy "Parents can read season reviews"
  on public.season_reviews for select
  using (public.is_parent_of(player_id));

create policy "Full coaches can read season reviews"
  on public.season_reviews for select
  using (public.is_full_coach_of(player_id));

-- ============================================================
-- SUMMER PLANS
-- ============================================================

create policy "Player can manage own summer plans"
  on public.summer_plans for all
  using (player_id = auth.uid());

create policy "Parents can read summer plans"
  on public.summer_plans for select
  using (public.is_parent_of(player_id));

create policy "Coaches can read summer plans"
  on public.summer_plans for select
  using (public.is_coach_of(player_id));

-- ============================================================
-- PLAYER PHOTOS
-- ============================================================

create policy "Player can manage own photos"
  on public.player_photos for all
  using (player_id = auth.uid());

create policy "Parents can read photos"
  on public.player_photos for select
  using (public.is_parent_of(player_id));

-- ============================================================
-- PARENT OBSERVATIONS
-- ============================================================

create policy "Parent can manage own observations"
  on public.parent_observations for all
  using (parent_user_id = auth.uid());

create policy "Player can read parent observations"
  on public.parent_observations for select
  using (player_id = auth.uid());

-- ============================================================
-- COACH ACCESS
-- ============================================================

create policy "Player can manage coach access"
  on public.coach_access for all
  using (player_id = auth.uid());

create policy "Coach can read own access record"
  on public.coach_access for select
  using (coach_user_id = auth.uid());

create policy "Coach can accept invitation"
  on public.coach_access for update
  using (coach_user_id = auth.uid());

-- ============================================================
-- PARENT LINKS
-- ============================================================

create policy "Player can manage parent links"
  on public.parent_links for all
  using (player_id = auth.uid());

create policy "Parent can read own link"
  on public.parent_links for select
  using (parent_user_id = auth.uid());
