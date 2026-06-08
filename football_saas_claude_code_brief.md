# Football Player Development Platform — Claude Code Brief

## Project Overview

A longitudinal player development SaaS for youth footballers. Core value: a **player-owned, lifelong development record** that travels with the player across clubs, seasons, and age groups — combining structured match/training reflection, AI coaching feedback, and a career-spanning journey view.

Built for multi-player use (each player has their own account). Parent and Coach access roles included. No payments in initial build.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend + API | Next.js 14 (App Router) |
| Database + Auth | Supabase (Postgres + RLS + Supabase Auth) |
| File Storage | Supabase Storage (logos, avatars, photos) |
| AI Feedback | Google Gemini 2.5 Flash via OpenAI-compatible endpoint (`https://generativelanguage.googleapis.com/v1beta/openai/`) via Next.js API Route Handlers (server-side only, key never on client) |
| Hosting | Vercel |
| Offline Support | PWA with IndexedDB sync queue |
| Rich Text / @mentions | Tiptap editor with mentions extension |
| Payments | NOT in scope |
| PDF Export | NOT in scope |

---

## User Roles

### Player
- Full access to all their own data
- Primary user — all data entry happens here
- Can invite Parent and Coach users

### Parent
- Read access to everything the player sees
- Can add their own observation notes on matches and training sessions
- Separate dashboard view optimised for development oversight

### Coach
- Invited by player/parent
- Two access levels: `limited` (aggregated stats, diagnostics, goals only) or `full` (all except private entries)
- No data entry except optional feedback notes

### Admin
- Platform operator role
- User management only

---

## Database Schema

### `users`
```sql
id uuid primary key default gen_random_uuid()
email text unique not null
name text not null
role text not null check (role in ('player','parent','coach','admin'))
avatar_url text
subscription_tier text default 'free'  -- placeholder for future payments
created_at timestamptz default now()
```

### `player_profiles`
```sql
id uuid primary key default gen_random_uuid()
user_id uuid references users(id) on delete cascade
date_of_birth date
dominant_foot text check (dominant_foot in ('right','left','both'))
primary_position text
nationality text
avatar_url text
phone text
instagram_handle text
bio text
created_at timestamptz default now()
```

### `player_photos`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
url text not null
caption text
date_taken date
season_id uuid references seasons(id)
created_at timestamptz default now()
```

### `seasons`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
label text not null  -- e.g. "2025-26"
start_date date
end_date date
notes text
is_active boolean default false
created_at timestamptz default now()
```

### `clubs`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
name text not null              -- e.g. "United FC"
logo_url text                   -- Supabase Storage URL
website text
contact_email text
contact_phone text
has_professional_pathway boolean default false
notes text
created_at timestamptz default now()
```

### `teams`
```sql
id uuid primary key default gen_random_uuid()
club_id uuid references clubs(id) on delete cascade
season_id uuid references seasons(id) on delete cascade
player_id uuid references users(id) on delete cascade
age_group text not null         -- e.g. "U9", "U10", "U11"
team_label text not null        -- e.g. "United FC U9"
kit_primary_colour text
kit_secondary_colour text
training_hours_per_week numeric
league_level text
format text check (format in ('5v5','7v7','9v9','11v11'))  -- added migration 5
is_active boolean default true
created_at timestamptz default now()
```

### `teammates`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
team_id uuid references teams(id) on delete cascade
season_id uuid references seasons(id) on delete cascade
name text not null
nickname text                   -- used for @mention handle
positions text[]
kit_number int
phone text
email text
instagram_handle text
notes text
created_at timestamptz default now()
```

### `competitions`
```sql
id uuid primary key default gen_random_uuid()
team_id uuid references teams(id) on delete cascade
season_id uuid references seasons(id) on delete cascade
player_id uuid references users(id) on delete cascade
name text not null              -- e.g. "UAE Youth League 2025-26"
type text check (type in ('league','cup','friendly','trial','tournament'))
start_date date
end_date date                   -- added: competitions have a defined end date
notes text
created_at timestamptz default now()
```

### `matches`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
season_id uuid references seasons(id) on delete cascade
team_id uuid references teams(id) on delete cascade
competition_id uuid references competitions(id)
date date not null
opponent text not null
venue_type text check (venue_type in ('home','away','neutral'))
stage text check (stage in ('pool','knockout','final','group','friendly','other'))
total_match_minutes int
minutes_played int
goals_for int
goals_against int
result text check (result in ('W','D','L'))
mood text check (mood in ('brilliant','good','ok','tough','frustrated'))
overall_rating numeric check (overall_rating between 1 and 10)
created_at timestamptz default now()
```

### `match_positions`
```sql
id uuid primary key default gen_random_uuid()
match_id uuid references matches(id) on delete cascade
position text not null
minutes_from int
minutes_to int
```

### `match_contributions`
```sql
id uuid primary key default gen_random_uuid()
match_id uuid references matches(id) on delete cascade
player_id uuid references users(id) on delete cascade
goal_index int not null default 1        -- 1-based index per match
goal_type text check (goal_type in ('regular','penalty','freekick'))
ball_x float                             -- 0–1 fraction across net width
ball_y float                             -- 0–1 fraction down net height
ball_zone text                           -- derived label e.g. "Top Right"
keeper_x_pct float                       -- 0–1 keeper position across net
keeper_posture text check (keeper_posture in ('standing','jumping','sliding'))
body_part text
technique text
score_us int                             -- team score at moment of goal
score_opp int
period text
shot_x float                             -- 0–1 fraction across pitch SVG
shot_y float                             -- 0–1 fraction down pitch SVG
shot_zone text                           -- derived label e.g. "Left channel · Penalty area"
video_url text
created_at timestamptz default now()
```
RLS: `player_id = auth.uid()` (players read/write own contributions only).

### `match_video_moments`
```sql
id uuid primary key default gen_random_uuid()
match_id uuid references matches(id) on delete cascade
url text not null
timestamp_in_video text        -- e.g. "2:14"
label text
notes text
moment_type text check (moment_type in ('highlight','learning','error','goal','assist'))
created_at timestamptz default now()
```

### `training_sessions`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
season_id uuid references seasons(id) on delete cascade
team_id uuid references teams(id)
date date not null
duration_minutes int
session_type text check (session_type in ('technical','tactical','physical','set_pieces','small_sided','fitness','other'))
focus_areas text[]
coach_led boolean default true
notes text
rating int check (rating between 1 and 10)
created_at timestamptz default now()
```

### `reflections`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
entity_type text check (entity_type in ('match','training','standalone'))
entity_id uuid                 -- references match or training_session id
author_role text check (author_role in ('player','parent','coach'))
went_well text
improve_next text
key_moment text
coach_feedback_received text
free_text text
visibility text default 'family' check (visibility in ('player_only','family','coach','public'))
ai_feedback text
created_at timestamptz default now()
```

### `reflection_mentions`
```sql
id uuid primary key default gen_random_uuid()
reflection_id uuid references reflections(id) on delete cascade
teammate_id uuid references teammates(id) on delete cascade
created_at timestamptz default now()
```

### `diagnostics`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
season_id uuid references seasons(id) on delete cascade
date date not null
scores jsonb not null           -- pillar scores keyed by category name
                                -- each entry: { score, max, pct, answered, total }
                                -- 'answered' tracks partial completion (save allowed with unanswered questions)
ai_summary text
created_at timestamptz default now()
```

### `goals`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
season_id uuid references seasons(id) on delete cascade
team_id uuid references teams(id)
text text not null
why text
pillar text
set_by text check (set_by in ('player','parent','coach'))
target_date date
completed_at timestamptz
completion_reflection text
visibility text default 'family' check (visibility in ('player_only','family','coach','public'))
created_at timestamptz default now()
```

### `season_reviews`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
season_id uuid references seasons(id) on delete cascade
team_reflections jsonb          -- keyed by team_id
proud text
hardest_moment text
new_skill text
gap text
coach_theme text
letter_to_self text
ratings jsonb                   -- self-assessment scores by pillar
ai_feedback text
created_at timestamptz default now()
```

### `parent_observations`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
parent_user_id uuid references users(id) on delete cascade
entity_type text check (entity_type in ('match','training'))
entity_id uuid
observation text not null
created_at timestamptz default now()
```

### `coach_access`
```sql
id uuid primary key default gen_random_uuid()
player_id uuid references users(id) on delete cascade
coach_user_id uuid references users(id) on delete cascade
access_level text check (access_level in ('limited','full'))
invited_at timestamptz default now()
accepted_at timestamptz
revoked_at timestamptz
```

---

## Row Level Security (RLS) Principles

Enable RLS on all tables. Key policies:

- **Players** can only read/write their own rows (`player_id = auth.uid()`)
- **Parents** can read all rows where `player_id` matches a player they are linked to
- **Coaches** can read rows based on their `access_level` in `coach_access`
- **Teammate data** is private to the player — no other role can access it
- **Reflections** respect the `visibility` field — `player_only` entries are never returned to parent or coach queries

---

## @Mention System

- Rich text editor: **Tiptap** with the official mentions extension
- Trigger: typing `@` opens a dropdown populated from `teammates` for the current season/team
- Display name in dropdown: `nickname` if set, otherwise `name`
- On selection: renders as a styled mention chip (accent-coloured pill, full name displayed)
- Storage: mention stored as plain text in reflection fields; resolved `teammate_id` stored separately in `reflection_mentions`
- If a teammate is renamed, existing mentions resolve via `teammate_id` not the stored text
- @mentions supported in: match reflections (went_well, improve_next, key_moment), training reflections, standalone journal entries

---

## AI Integration

- All AI calls made server-side via Next.js API Route Handlers (`/app/api/ai/...`)
- API key (`GEMINI_API_KEY`) stored in environment variable, never exposed to client
- Provider: **Google Gemini 2.5 Flash** via OpenAI-compatible endpoint. Original Anthropic routes have been removed.
- Three AI feedback types:
  1. **Post-match feedback** — reads reflection answers + performance ratings (position-aware), returns 3–4 sentences of coach-voice feedback
  2. **Season review feedback** — reads full season review including team comparisons and letter-to-self, returns personalised end-of-season message
  3. **Summer plan feedback** — reads summer training plan, returns honest assessment with one concrete suggestion
- Tone: growth-mindset, football-literate, warm but honest. Player has high football IQ — use proper terminology, not generic youth sport language.

---

## Diagnostic System

- Six pillars: Technical (ball control & passing), Technical (shooting & dribbling), Tactical (in possession), Tactical (out of possession), Mental & Attitude, Development Habits
- Each pillar has 5–6 questions rated on a 1–5 frequency scale (Never / Rarely / Sometimes / Often / Always)
- **No defaults** — all buttons start unselected; player must actively choose each answer
- **Partial save allowed** — if questions are unanswered, player sees a confirm dialog ("X questions are unanswered. Save anyway?") but is not blocked
- Score stored as `{ score, max, pct, answered, total }` per pillar to support partial completion display
- Recommend completing every 4–6 weeks for trend tracking
- Dashboard shows latest diagnostic as pillar bar chart

---

## Setup Flow

The Setup section follows a strict dependency order that must be communicated clearly in the UI:

```
Season → Club → Team → Competition → Teammates
```

- **Season** must exist before creating a Team
- **Club** must exist before creating a Team
- **Team** must exist before creating a Competition or Teammate
- Each entity card shows a count badge and a "+ Add" button that opens a focused modal form
- Creation and display are separated — inline forms not used
- Active season is set in Setup and drives the global season selector in the header
- A ⚙️ gear button in the persistent header gives instant access to Setup from anywhere

---

## Offline Support (PWA)

- Configure Next.js as a PWA using `next-pwa`
- Cache static assets and last-known data in service worker
- Write operations while offline go to an **IndexedDB sync queue**
- On reconnect, queue flushes to Supabase automatically
- Show sync status indicator in UI (synced / pending / offline)

---

## File Storage (Supabase Storage)

Three buckets:

| Bucket | Contents | Access |
|---|---|---|
| `club-logos` | Club logo images | Authenticated read, player write |
| `player-avatars` | Profile pictures | Authenticated read, player write |
| `player-photos` | Milestone/journey photos | Authenticated read, player write |

All URLs stored as public CDN URLs in the database.

---

## Date Format

All dates displayed as **DD-Mon-YYYY** (e.g. `02-Jun-2025`). Use this format consistently across match history, goal target dates, diagnostic dates, review cards, training history, and the journey timeline.

---

## Key Views / Pages

### Player Views
- **Dashboard** — persistent season selector in header (filters entire app), stats overview, team cards (W/D/L + avg rating per team), recent matches, active goals, phase banner (end-of-season / summer when relevant), latest diagnostic pillar bars
- **Log Match** — full match entry: competition + stage selectors, multiple position rows with from/to minutes (position-aware rating dimensions for CB vs ST etc), total match time vs time played, **My Goals** input (capped at team goals — opens goal detail modal when >0), mood, performance ratings, @mention reflections (went well / improve / key moment / coach feedback), video moment links with type tags and timestamps. Goal detail modal uses `GoalContributionCard` (interactive SVG net + pitch, saves to `match_contributions`).
- **Log Training** — training session form: team, type, duration, coach-led flag, focus areas, rating, @mention reflection
- **Diagnostic** — MoF-style 6-pillar assessment; no defaults; partial save with confirm dialog; recommend every 4–6 weeks
- **My Matches** — filterable history (by team, result); click to open full detail modal with ratings, reflections, mention chips, video links, AI feedback
- **Focus Goals** — add/complete/delete goals with why, set-by, target date; season-filtered
- **⚡ Season Review** — 5-step guided end-of-season reflection: team comparisons with star ratings, growth questions, honest self-assessment ratings, gap analysis, letter-to-self; AI coach message on save
- **☀️ Summer Plan** — structured summer training plan: technical/physical/watch+study skill rows (freq per week), weekly commitment, big summer goal, September self-image, accountability partner; AI coach review on save
- **🌟 Lifelong Journey** — career totals (matches, seasons, clubs, win %); season-by-season cards with club logos, W/D/L, avg rating, diagnostic snapshot, letter-to-self excerpt
- **⚙️ Setup** — manage seasons, clubs, teams, competitions, teammates via modal forms in dependency order. Team modal includes a **Format** dropdown (5v5/7v7/9v9/11v11) used to size the goal contribution pitch/net canvases.

### Parent Views
- Mirror of player dashboard (read-only) + observation entry on match/training records
- Parent notice banner shown when in Parent View

### Coach Views
- Aggregated stats, diagnostic trends, active goals (limited access)
- Full reflection access if `access_level = 'full'`

---

## Design System

Dark pitch-green theme. Colour palette:

```
--surface:    #0f1f16
--card-bg:    #162a1f
--border:     #2a4a35
--accent:     #e8ff47   (yellow-green — primary CTA, highlights, @mention chips)
--white:      #f5f5f0
--muted:      #8a9a8e
--cb-color:   #5ac8fa   (blue — Centre Back role colour)
--st-color:   #e8ff47   (yellow — Striker role colour)
--danger:     #ff5a5a
--warning:    #ffb347
--info:       #5ac8fa
```

Typography:
- Display / headings: **Bebas Neue**
- Body: **DM Sans** (minimum 18px body, 16px labels)
- Mono / labels: **DM Mono**

General principles:
- Clean, minimal, premium sports-app aesthetic
- Mobile-first, iPad-friendly
- All interactive elements minimum 44px touch target
- Pitch-stripe texture on body background (CSS repeating-linear-gradient)
- No default values pre-selected in diagnostic or rating forms — player must actively choose

---

## Out of Scope (Do Not Build)

- Payment / subscription system (field placeholder only: `subscription_tier` on users)
- PDF export for coaches
- Video file upload (links/URLs only)
- Public landing page / marketing site

---

## Context: First Player

The initial user is a 9-year-old aspiring professional footballer in Dubai:
- Currently plays for **United FC U9** (Centre Back — coach assigned, weak team, 6hrs training/week, UAE Pro Division pathway) and **Elite FC U11** (Striker — competitive, playing up two years, 2hrs/week). Elite FC ends this season (end of June 2025).
- Next season: **United FC U10 only** (6hrs/week)
- Has high football IQ — knows players, managers, tactics, transfers. Reflection prompts and AI feedback should respect this — use proper football language, not generic youth sport language.
- Parent has visibility + observation rights
- No coach access configured yet

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Notes for Claude Code

- Use Next.js App Router throughout — no Pages Router
- Use Supabase SSR client (`@supabase/ssr`) for server components and API routes
- Use Supabase client-side client for real-time and client components
- All database types should be generated from Supabase schema (`supabase gen types typescript`)
- Implement RLS policies as SQL migrations, not application-level logic
- The @mention Tiptap editor should be a reusable component used in match reflections, training reflections, and standalone journal entries
- PWA configuration should not break standard Next.js builds
- `output: 'standalone'` in `next.config.js` for optimised deployment
- Setup modal forms are built dynamically from a `FORM_DEFS` config object — follow this pattern to keep the setup section maintainable
