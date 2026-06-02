# Football Player Development Platform — Project Brief

## Project Overview

A longitudinal player development SaaS for youth footballers. Core value: a **player-owned, lifelong development record** that travels with the player across clubs, seasons, and age groups — combining structured match/training reflection, AI coaching feedback, and a career-spanning journey view.

Built for multi-player use (each player has their own account). Parent and Coach access roles included. No payments in initial build.

---

## Build Status

| Area | Status |
|---|---|
| Supabase schema + RLS + auth trigger | ✅ Live |
| Next.js 14 app scaffold | ✅ Built |
| Auth (login / signup) | ✅ Built |
| Setup page (Season → Club → Team → Competition → Teammates) | ✅ Built |
| Dashboard | ✅ Built |
| Log Match (positions, ratings, reflection, video moments, AI feedback) | ✅ Built |
| Log Training | ✅ Built |
| Diagnostic (6-pillar assessment) | ✅ Built |
| Match History | ✅ Built |
| Focus Goals | ✅ Built |
| Season Review (5-step + AI feedback) | ✅ Built |
| Summer Plan (skills + AI feedback) | ✅ Built |
| Lifelong Journey | ✅ Built |
| AI API routes (match / season / summer) | ✅ Built |
| Vercel deployment | 🔄 In progress |
| @mention Tiptap editor | 🔲 Pending |
| Parent view / observations | 🔲 Pending |
| Coach access / invite flow | 🔲 Pending |
| Supabase Storage (logo/avatar uploads) | 🔲 Pending |
| Season selector in header (global filter) | 🔲 Pending |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend + API | Next.js 14 (App Router) |
| Database + Auth | Supabase (Postgres + RLS + Supabase Auth) |
| File Storage | Supabase Storage (logos, avatars, photos) |
| AI Feedback | Anthropic Claude API — server-side API routes only |
| Hosting | Vercel (Hobby plan — free) |
| Rich Text / @mentions | Tiptap (pending) |
| Payments | NOT in scope |
| PDF Export | NOT in scope |
| PWA / Offline | NOT in scope |

---

## Repository

- **GitHub:** https://github.com/AYDXB09/football-journal
- **Branch:** main
- **Auto-deploy:** Vercel connected to GitHub — every push to main deploys

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=
```

Set in `.env.local` for local dev. Set in Vercel dashboard for production.

---

## Supabase Project

- **Migrations applied:** 4
  - `20240601000001_initial_schema.sql` — all 19 tables
  - `20240601000002_rls_policies.sql` — full RLS with helper functions
  - `20240601000003_auth_trigger.sql` — auto-create users row on signup
  - `20240601000004_storage_buckets.sql` — 3 storage buckets + policies
- **Auth trigger:** auto-inserts into `public.users` on signup with name + role from metadata
- **Storage buckets:** `club-logos`, `player-avatars`, `player-photos`

---

## Database Tables

| Table | Purpose |
|---|---|
| `users` | Mirrors auth.users — role, name, subscription_tier |
| `player_profiles` | DOB, position, nationality, bio |
| `seasons` | Player's seasons (e.g. 2024-25) |
| `clubs` | Clubs the player has been part of |
| `teams` | Teams within a club/season |
| `teammates` | Teammates per team (private to player) |
| `competitions` | Competitions per team |
| `matches` | Match records with result, mood, rating |
| `match_positions` | Position(s) played per match with minutes |
| `match_ratings` | Per-dimension performance ratings |
| `match_video_moments` | Video links with type, timestamp, label |
| `training_sessions` | Training logs with type, focus, rating |
| `reflections` | Structured reflections (match/training/standalone) |
| `reflection_mentions` | @mention links to teammates |
| `diagnostics` | 6-pillar self-assessment scores (JSONB) |
| `goals` | Focus goals with visibility and completion |
| `season_reviews` | End-of-season review including letter to self |
| `summer_plans` | Summer training plan with skill rows |
| `player_photos` | Milestone photos |
| `parent_observations` | Parent notes on matches/training |
| `coach_access` | Coach invite + access level |
| `parent_links` | Parent-player link |

---

## User Roles

### Player
- Full access to all their own data
- Primary user — all data entry happens here
- Can invite Parent and Coach users

### Parent
- Read access to everything the player sees (except `player_only` entries)
- Can add observation notes on matches and training sessions

### Coach
- Two access levels: `limited` (diagnostics, goals, stats) or `full` (all except `player_only`)
- No data entry except optional feedback notes

### Admin
- Platform operator role — user management only

---

## RLS Principles

- Players can only read/write their own rows (`player_id = auth.uid()`)
- Parents can read via `parent_links` join — never `player_only` visibility
- Coaches can read based on `coach_access.access_level`
- Teammate data is **player-only** — no parent or coach access
- Reflections respect the `visibility` field

---

## App Pages

| Route | Page |
|---|---|
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | Stats, recent matches, goals, diagnostic snapshot |
| `/log-match` | Full match entry with positions, ratings, reflection, video, AI |
| `/log-training` | Training session log |
| `/diagnostic` | 6-pillar assessment (no defaults, partial save allowed) |
| `/matches` | Match history with filters and detail modal |
| `/goals` | Focus goals — add, complete, delete |
| `/season-review` | 5-step end-of-season review with AI feedback |
| `/summer-plan` | Summer training plan with AI feedback |
| `/journey` | Career timeline — all seasons, clubs, stats, letters |
| `/setup` | Season → Club → Team → Competition → Teammates |

---

## AI Integration

All Anthropic API calls are server-side via `/app/api/ai/` route handlers. Key never exposed to client.

- **Model:** `claude-sonnet-4-5`
- **Match feedback** (`/api/ai/match-feedback`) — post-match reflection feedback, position-aware
- **Season feedback** (`/api/ai/season-feedback`) — end-of-season personalised message
- **Summer feedback** (`/api/ai/summer-feedback`) — honest assessment of summer plan

Tone: growth-mindset, football-literate, warm but honest. Uses proper football terminology.

---

## Diagnostic System

- **6 pillars:** Technical (Ball Control & Passing), Technical (Shooting & Dribbling), Tactical (In Possession), Tactical (Out of Possession), Mental & Attitude, Development Habits
- **5-point frequency scale:** Never / Rarely / Sometimes / Often / Always
- **No defaults** — all buttons start unselected
- **Partial save allowed** — confirm dialog if questions unanswered
- Scores stored as JSONB: `{ score, max, pct, answered, total }` per pillar

---

## Design System

Dark pitch-green theme.

```
--surface:    #0f1f16
--card-bg:    #162a1f
--border:     #2a4a35
--accent:     #e8ff47
--white:      #f5f5f0
--muted:      #8a9a8e
--danger:     #ff5a5a
--warning:    #ffb347
--info:       #5ac8fa
```

Fonts: **Bebas Neue** (display), **DM Sans** (body, min 18px), **DM Mono** (labels/mono)

---

## Setup Dependency Order

```
Season → Club → Team → Competition → Teammates
```

Each step requires the previous. Managed via modal forms in `/setup`.

---

## What's Next (Pending)

1. **@mention Tiptap editor** — replace plain textareas in reflections with rich text + teammate mentions
2. **Parent view** — read-only dashboard + observation entry
3. **Coach access flow** — invite by email, accept, revoke
4. **File uploads** — club logos, player avatars via Supabase Storage
5. **Season selector in header** — global season filter across all pages
6. **Match detail editing** — edit/delete existing matches
7. **Vercel production env vars** — add to Vercel dashboard

---

## Context: First Player

9-year-old aspiring professional in Dubai:
- **United FC U9** — Centre Back, coach-assigned, weak team, 6hrs/week, UAE Pro Division pathway
- **Elite FC U11** — Striker, playing up two years, competitive, 2hrs/week (ends June 2025)
- **Next season:** United FC U10 only (6hrs/week)
- High football IQ — knows players, managers, tactics, transfers
- Parent has visibility + observation rights
- No coach access configured yet
