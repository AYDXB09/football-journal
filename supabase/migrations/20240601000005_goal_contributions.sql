ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS format text CHECK (format IN ('5v5','7v7','9v9','11v11'));

CREATE TABLE IF NOT EXISTS public.match_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_index int NOT NULL DEFAULT 1,
  goal_type text CHECK (goal_type IN ('regular','penalty','freekick')),
  ball_x float, ball_y float, ball_zone text,
  keeper_x_pct float, keeper_posture text CHECK (keeper_posture IN ('standing','jumping','sliding')),
  body_part text, technique text,
  score_us int, score_opp int, period text,
  shot_x float, shot_y float, shot_zone text,
  video_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.match_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "player own contributions" ON public.match_contributions
  FOR ALL USING (player_id = auth.uid());
