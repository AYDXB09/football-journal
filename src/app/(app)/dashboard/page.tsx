import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/format'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch all data in parallel
  const [matchesRes, goalsRes, diagnosticsRes, seasonsRes, teamsRes] = await Promise.all([
    supabase.from('matches').select('*, teams(team_label)').eq('player_id', user.id).order('date', { ascending: false }).limit(5),
    supabase.from('goals').select('*').eq('player_id', user.id).is('completed_at', null).order('created_at', { ascending: false }).limit(5),
    supabase.from('diagnostics').select('*').eq('player_id', user.id).order('date', { ascending: false }).limit(1),
    supabase.from('seasons').select('*').eq('player_id', user.id).order('created_at', { ascending: false }),
    supabase.from('teams').select('*, clubs(name, logo_url), matches(result)').eq('player_id', user.id),
  ])

  const matches = matchesRes.data || []
  const goals = goalsRes.data || []
  const latestDiag = diagnosticsRes.data?.[0]
  const seasons = seasonsRes.data || []
  const teams = teamsRes.data || []

  // Stats
  const totalMatches = matches.length
  const wins = matches.filter(m => m.result === 'W').length
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
  const avgRating = matches.filter(m => m.overall_rating).length > 0
    ? (matches.reduce((s, m) => s + (m.overall_rating || 0), 0) / matches.filter(m => m.overall_rating).length).toFixed(1)
    : '—'

  const DIAG_PILLARS = [
    { key: 'pillar_0', label: 'Tech Ball', color: '#5ac8fa' },
    { key: 'pillar_1', label: 'Tech Shoot', color: '#e8ff47' },
    { key: 'pillar_2', label: 'Tac In', color: '#ff9f5a' },
    { key: 'pillar_3', label: 'Tac Out', color: '#ff6b6b' },
    { key: 'pillar_4', label: 'Mental', color: '#c084fc' },
    { key: 'pillar_5', label: 'Habits', color: '#34d399' },
  ]

  return (
    <div>
      {/* Phase Banner */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(232,255,71,0.12),rgba(255,179,71,0.08))',
        border: '1px solid rgba(232,255,71,0.3)',
        borderLeft: '4px solid var(--accent)',
        borderRadius: '10px',
        padding: '16px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>🏁</span>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '1.5px', color: 'var(--accent)', marginBottom: '4px' }}>
            End of Season
          </div>
          <div style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.5 }}>
            Close the season with a full review and set your summer plan.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
          <Link href="/season-review" style={{ flex: 1, background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '11px 18px', borderRadius: '8px', fontFamily: 'Bebas Neue', fontSize: '15px', letterSpacing: '1px', cursor: 'pointer', textAlign: 'center', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            Season Review
          </Link>
          <Link href="/summer-plan" style={{ flex: 1, background: 'var(--accent)', border: 'none', color: 'var(--surface)', padding: '11px 18px', borderRadius: '8px', fontFamily: 'Bebas Neue', fontSize: '15px', letterSpacing: '1px', cursor: 'pointer', textAlign: 'center', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            Summer Goals
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { value: totalMatches, label: 'Matches' },
          { value: goals.length, label: 'Active Goals' },
          { value: avgRating, label: 'Avg Rating' },
          { value: totalMatches > 0 ? `${winRate}%` : '—', label: 'Win Rate' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '40px', color: 'var(--accent)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontFamily: 'DM Mono', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Setup prompt */}
      {seasons.length === 0 && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '14px' }}>Set up your season to get started</p>
          <Link href="/setup" style={{ background: 'var(--accent)', border: 'none', color: 'var(--surface)', padding: '12px 24px', borderRadius: '8px', fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '2px', textDecoration: 'none', display: 'inline-block' }}>
            Go to Setup ⚙️
          </Link>
        </div>
      )}

      {/* Recent Matches */}
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '2px', color: 'var(--muted)', marginBottom: '14px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
        Recent Reflections
        <span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'block' }} />
      </div>

      {matches.length === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '15px', fontFamily: 'DM Mono' }}>No matches logged yet</p>
          <Link href="/log-match" style={{ display: 'inline-block', marginTop: '12px', background: 'var(--accent)', color: 'var(--surface)', padding: '10px 20px', borderRadius: '8px', fontFamily: 'Bebas Neue', fontSize: '16px', letterSpacing: '1px', textDecoration: 'none' }}>
            Log First Match
          </Link>
        </div>
      ) : (
        matches.map(match => (
          <div key={match.id} style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '14px 16px',
            marginBottom: '10px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'DM Mono', fontSize: '13px', color: 'var(--muted)', minWidth: '90px' }}>
              {formatDate(match.date)}
            </span>
            <span style={{ flex: 1, fontSize: '16px', fontWeight: 500 }}>vs {match.opponent}</span>
            <span style={{
              fontFamily: 'Bebas Neue',
              fontSize: '24px',
              minWidth: '46px',
              textAlign: 'center',
              color: match.result === 'W' ? 'var(--accent)' : match.result === 'D' ? 'var(--warning)' : 'var(--danger)',
            }}>
              {match.goals_for ?? '?'}-{match.goals_against ?? '?'}
            </span>
            {match.overall_rating && (
              <span style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: 'var(--accent)', minWidth: '40px', textAlign: 'right' }}>
                {match.overall_rating}
              </span>
            )}
          </div>
        ))
      )}

      {/* Latest Diagnostic */}
      {latestDiag && (
        <>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '2px', color: 'var(--muted)', marginBottom: '14px', marginTop: '24px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Latest Diagnostic
            <span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'block' }} />
          </div>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <p style={{ fontSize: '13px', fontFamily: 'DM Mono', color: 'var(--muted)', marginBottom: '16px' }}>
              {formatDate(latestDiag.date)}
            </p>
            {DIAG_PILLARS.map((p, i) => {
              const scores = latestDiag.scores as Record<string, { pct: number; score: number; max: number }>
              const pillar = scores[`pillar_${i}`]
              const pct = pillar?.pct ?? 0
              return (
                <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '14px', fontFamily: 'DM Mono', textTransform: 'uppercase', color: 'var(--muted)', width: '80px', flexShrink: 0 }}>{p.label}</span>
                  <div style={{ flex: 1, height: '8px', background: 'var(--surface)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ height: '100%', borderRadius: '4px', background: p.color, width: `${pct}%` }} />
                  </div>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: p.color, width: '40px', textAlign: 'right' }}>
                    {Math.round(pct)}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Active Goals */}
      {goals.length > 0 && (
        <>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '2px', color: 'var(--muted)', marginBottom: '14px', marginTop: '24px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Active Goals
            <span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'block' }} />
          </div>
          {goals.map(goal => (
            <div key={goal.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: '8px', padding: '14px 16px', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', lineHeight: 1.4 }}>{goal.text}</div>
              {goal.target_date && (
                <div style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'DM Mono' }}>Target: {formatDate(goal.target_date)}</div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
