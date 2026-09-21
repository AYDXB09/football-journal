import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Every /api/ai/* route must call this first. It does two things the routes
 * never did before: identifies who's actually calling (they previously took
 * unauthenticated bodies and called Gemini for anyone), and checks that
 * player's own ai_coach_enabled preference (player_profiles, default true —
 * matches today's always-on behavior for players who haven't touched the
 * setting) before spending a Gemini call on their behalf.
 *
 * Returns a NextResponse to send back immediately if the request should be
 * blocked, or null if it's fine to proceed with the real AI call.
 */
export async function blockIfAiCoachDisabled(): Promise<NextResponse | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('player_profiles')
    .select('ai_coach_enabled')
    .eq('user_id', user.id)
    .maybeSingle()

  // No profile row yet, or the column reads null for some other reason —
  // treat as enabled, matching the column's own DB default.
  if (profile && profile.ai_coach_enabled === false) {
    return NextResponse.json({ error: 'ai_coach_disabled' }, { status: 403 })
  }

  return null
}
