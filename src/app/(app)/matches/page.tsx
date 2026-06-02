'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/format'

type Season = { id: string; label: string; is_active: boolean }
type Team = { id: string; team_label: string }
type Match = {
  id: string; date: string; opponent: string; result: string | null; goals_for: number | null; goals_against: number | null;
  overall_rating: number | null; mood: string | null; minutes_played: number | null; venue_type: string | null;
  teams?: { team_label: string } | null; competitions?: { name: string } | null
}
type Reflection = { went_well: string | null; improve_next: string | null; key_moment: string | null; coach_feedback_received: string | null; ai_feedback: string | null }

export default function MatchesPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [filterSeason, setFilterSeason] = useState('all')
  const [filterTeam, setFilterTeam] = useState('all')
  const [filterResult, setFilterResult] = useState('all')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [reflection, setReflection] = useState<Reflection | null>(null)

  const load = useCallback(async (uid: string) => {
    const { data } = await supabase.from('matches').select('*, teams(team_label), competitions(name)').eq('player_id', uid).order('date', { ascending: false })
    setMatches(data as Match[] || [])
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const [sr, tr] = await Promise.all([
        supabase.from('seasons').select('id, label, is_active').eq('player_id', user.id).order('created_at', { ascending: false }),
        supabase.from('teams').select('id, team_label').eq('player_id', user.id),
      ])
      setSeasons(sr.data || [])
      setTeams(tr.data || [])
      await load(user.id)
    })
  }, [supabase, load])

  async function openMatch(match: Match) {
    setSelectedMatch(match)
    const { data } = await supabase.from('reflections').select('*').eq('entity_id', match.id).eq('entity_type', 'match').single()
    setReflection(data as Reflection || null)
  }

  const filtered = matches.filter(m => {
    if (filterResult !== 'all' && m.result !== filterResult) return false
    if (filterTeam !== 'all' && (m.teams as { team_label: string } | null)?.team_label !== filterTeam) return false
    return true
  })

  const resultColor = (r: string | null) => r === 'W' ? 'var(--accent)' : r === 'D' ? 'var(--warning)' : 'var(--danger)'

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} style={{ flex: 1, minWidth: '140px', fontSize: '16px', padding: '10px 12px' }}>
          <option value="all">All Teams</option>
          {teams.map(t => <option key={t.id} value={t.team_label}>{t.team_label}</option>)}
        </select>
        <select value={filterResult} onChange={e => setFilterResult(e.target.value)} style={{ flex: 1, minWidth: '120px', fontSize: '16px', padding: '10px 12px' }}>
          <option value="all">All Results</option>
          <option value="W">Wins</option>
          <option value="D">Draws</option>
          <option value="L">Losses</option>
        </select>
      </div>

      {/* Stats bar */}
      {filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            { v: filtered.length, l: 'Matches' },
            { v: filtered.filter(m => m.result === 'W').length, l: 'Wins' },
            { v: filtered.filter(m => m.result === 'D').length, l: 'Draws' },
            { v: filtered.filter(m => m.result === 'L').length, l: 'Losses' },
          ].map(s => (
            <div key={s.l} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '32px', color: 'var(--accent)', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: '11px', fontFamily: 'DM Mono', color: 'var(--muted)', textTransform: 'uppercase', marginTop: '2px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Match list */}
      {filtered.length === 0
        ? <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '32px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '14px' }}>No matches found</div>
        : filtered.map(m => (
          <div key={m.id} onClick={() => openMatch(m)} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
            <span style={{ fontFamily: 'DM Mono', fontSize: '13px', color: 'var(--muted)', minWidth: '90px' }}>{formatDate(m.date)}</span>
            <span style={{ flex: 1, fontWeight: 500 }}>vs {m.opponent}</span>
            {m.teams?.team_label && <span style={{ fontSize: '12px', fontFamily: 'DM Mono', padding: '3px 8px', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--muted)' }}>{m.teams.team_label}</span>}
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: resultColor(m.result), minWidth: '50px', textAlign: 'center' }}>
              {m.goals_for ?? '?'}-{m.goals_against ?? '?'}
            </span>
            {m.overall_rating && <span style={{ fontFamily: 'Bebas Neue', fontSize: '26px', color: 'var(--accent)', minWidth: '36px', textAlign: 'right' }}>{m.overall_rating}</span>}
          </div>
        ))}

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) { setSelectedMatch(null); setReflection(null) } }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => { setSelectedMatch(null); setReflection(null) }} style={{ position: 'absolute', top: '14px', right: '14px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>✕</button>

            <div style={{ fontFamily: 'Bebas Neue', fontSize: '26px', letterSpacing: '2px', color: 'var(--accent)', marginBottom: '4px' }}>vs {selectedMatch.opponent}</div>
            <div style={{ fontFamily: 'DM Mono', fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>{formatDate(selectedMatch.date)} · {selectedMatch.teams?.team_label} · {selectedMatch.venue_type}</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '20px' }}>
              <StatBox label="Result" value={`${selectedMatch.goals_for ?? '?'}-${selectedMatch.goals_against ?? '?'}`} color={resultColor(selectedMatch.result)} />
              {selectedMatch.overall_rating && <StatBox label="Rating" value={String(selectedMatch.overall_rating)} color="var(--accent)" />}
              {selectedMatch.minutes_played && <StatBox label="Minutes" value={String(selectedMatch.minutes_played)} />}
            </div>

            {selectedMatch.mood && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontFamily: 'DM Mono', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Mood</div>
                <span style={{ fontSize: '16px', padding: '6px 14px', background: 'rgba(232,255,71,0.08)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: '8px', color: 'var(--accent)', fontFamily: 'DM Mono' }}>{selectedMatch.mood}</span>
              </div>
            )}

            {reflection && (
              <div>
                {reflection.went_well && <ReflBlock label="🌟 What went well" text={reflection.went_well} />}
                {reflection.improve_next && <ReflBlock label="🎯 Improve next time" text={reflection.improve_next} />}
                {reflection.key_moment && <ReflBlock label="🎬 Moment of the match" text={reflection.key_moment} />}
                {reflection.coach_feedback_received && <ReflBlock label="📋 Coach feedback" text={reflection.coach_feedback_received} />}
                {reflection.ai_feedback && (
                  <div style={{ background: 'rgba(232,255,71,0.05)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: '10px', padding: '16px', marginTop: '16px' }}>
                    <div style={{ fontSize: '13px', fontFamily: 'DM Mono', color: 'var(--accent)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>⚡ AI Coach Feedback</div>
                    <p style={{ fontSize: '16px', lineHeight: 1.7 }}>{reflection.ai_feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatBox({ label, value, color = 'var(--white)' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', fontFamily: 'DM Mono', color: 'var(--muted)', textTransform: 'uppercase', marginTop: '3px' }}>{label}</div>
    </div>
  )
}

function ReflBlock({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '13px', fontFamily: 'DM Mono', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>{label}</div>
      <p style={{ fontSize: '16px', color: 'var(--white)', lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}
