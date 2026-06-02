'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/format'

type Season = { id: string; label: string; start_date: string | null; end_date: string | null }
type Match = { id: string; result: string | null; overall_rating: number | null; season_id: string }
type Club = { id: string; name: string; logo_url: string | null }
type Team = { id: string; team_label: string; season_id: string; club_id: string; age_group: string }
type Review = { season_id: string; letter_to_self: string | null; proud: string | null; ratings: Record<string, number> | null }
type Diag = { season_id: string; scores: Record<string, { pct: number }> }

const PILLAR_COLORS = ['#5ac8fa','#e8ff47','#ff9f5a','#ff6b6b','#c084fc','#34d399']
const PILLAR_LABELS = ['Tech Ball','Tech Shoot','Tac In','Tac Out','Mental','Habits']

export default function JourneyPage() {
  const supabase = createClient()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [diags, setDiags] = useState<Diag[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const [sr, mr, cr, tr, rr, dr] = await Promise.all([
        supabase.from('seasons').select('*').eq('player_id', user.id).order('start_date', { ascending: true }),
        supabase.from('matches').select('id, result, overall_rating, season_id').eq('player_id', user.id),
        supabase.from('clubs').select('id, name, logo_url').eq('player_id', user.id),
        supabase.from('teams').select('id, team_label, season_id, club_id, age_group').eq('player_id', user.id),
        supabase.from('season_reviews').select('season_id, letter_to_self, proud, ratings').eq('player_id', user.id),
        supabase.from('diagnostics').select('season_id, scores').eq('player_id', user.id).order('date', { ascending: false }),
      ])
      setSeasons(sr.data || [])
      setMatches(mr.data as Match[] || [])
      setClubs(cr.data || [])
      setTeams(tr.data as Team[] || [])
      setReviews(rr.data as Review[] || [])
      setDiags(dr.data as Diag[] || [])
    })
  }, [supabase])

  const totalMatches = matches.length
  const totalWins = matches.filter(m => m.result === 'W').length
  const careerWinPct = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0
  const uniqueClubs = new Set(teams.map(t => t.club_id)).size

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,rgba(192,132,252,0.08),rgba(232,255,71,0.04))', border: '1px solid rgba(192,132,252,0.3)', borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '36px' }}>🌟</span>
        <div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '24px', letterSpacing: '2px', color: '#c084fc' }}>My Lifelong Football Journey</div>
          <div style={{ fontSize: '15px', color: 'var(--muted)', marginTop: '4px' }}>Every season. Every club. Every step toward the professional game.</div>
        </div>
      </div>

      {/* Career Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { v: totalMatches, l: 'Career Matches' },
          { v: seasons.length, l: 'Seasons' },
          { v: uniqueClubs, l: 'Clubs' },
          { v: totalMatches > 0 ? `${careerWinPct}%` : '—', l: 'Career Win %' },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '40px', color: 'var(--accent)', lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: '12px', fontFamily: 'DM Mono', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '4px' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Season cards */}
      {seasons.length === 0
        ? <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '14px' }}>No seasons yet — set up your first season to start your journey</div>
        : [...seasons].reverse().map(season => {
          const seasonMatches = matches.filter(m => m.season_id === season.id)
          const wins = seasonMatches.filter(m => m.result === 'W').length
          const draws = seasonMatches.filter(m => m.result === 'D').length
          const losses = seasonMatches.filter(m => m.result === 'L').length
          const avgRating = seasonMatches.filter(m => m.overall_rating).length > 0
            ? (seasonMatches.reduce((s, m) => s + (m.overall_rating || 0), 0) / seasonMatches.filter(m => m.overall_rating).length).toFixed(1)
            : null
          const seasonTeams = teams.filter(t => t.season_id === season.id)
          const review = reviews.find(r => r.season_id === season.id)
          const diag = diags.find(d => d.season_id === season.id)

          return (
            <div key={season.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
              {/* Season header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '30px', letterSpacing: '2px', color: 'var(--accent)' }}>{season.label}</div>
                {(season.start_date || season.end_date) && (
                  <div style={{ fontFamily: 'DM Mono', fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>
                    {season.start_date ? formatDate(season.start_date) : '?'} → {season.end_date ? formatDate(season.end_date) : 'present'}
                  </div>
                )}
                {seasonMatches.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                    {[{ v: wins, l: 'W', c: 'var(--accent)' }, { v: draws, l: 'D', c: 'var(--warning)' }, { v: losses, l: 'L', c: 'var(--danger)' }].map(s => (
                      <div key={s.l} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: s.c, lineHeight: 1 }}>{s.v}</div>
                        <div style={{ fontSize: '12px', fontFamily: 'DM Mono', color: 'var(--muted)', textTransform: 'uppercase' }}>{s.l}</div>
                      </div>
                    ))}
                    {avgRating && (
                      <div style={{ textAlign: 'center', marginLeft: '8px' }}>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: 'var(--accent)', lineHeight: 1 }}>{avgRating}</div>
                        <div style={{ fontSize: '12px', fontFamily: 'DM Mono', color: 'var(--muted)', textTransform: 'uppercase' }}>Avg</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Teams */}
              {seasonTeams.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {seasonTeams.map(t => {
                    const club = clubs.find(c => c.id === t.club_id)
                    return (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px' }}>
                        {club?.logo_url ? <img src={club.logo_url} alt={club.name} style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '4px' }} /> : <span style={{ fontSize: '16px' }}>🏆</span>}
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{t.team_label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Diagnostic snapshot */}
              {diag && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontFamily: 'DM Mono', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Diagnostic</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {PILLAR_LABELS.map((label, i) => {
                      const pct = diag.scores[`pillar_${i}`]?.pct ?? 0
                      return (
                        <div key={i} style={{ flex: '1', minWidth: '60px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'DM Mono', color: 'var(--muted)', marginBottom: '3px' }}>
                            <span>{label}</span><span style={{ color: PILLAR_COLORS[i] }}>{pct}%</span>
                          </div>
                          <div style={{ height: '4px', background: 'var(--surface)', borderRadius: '2px' }}>
                            <div style={{ height: '100%', borderRadius: '2px', background: PILLAR_COLORS[i], width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Letter to self */}
              {review?.letter_to_self && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ fontSize: '13px', fontFamily: 'DM Mono', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Letter to myself</div>
                  <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                    &ldquo;{review.letter_to_self.slice(0, 200)}{review.letter_to_self.length > 200 ? '...' : ''}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )
        })}
    </div>
  )
}
