'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today } from '@/lib/utils/format'
import { WordCloud } from '@/components/ui/WordCloud'
import GoalContributionCard, { type GoalState } from '@/components/GoalContributionCard'

type MatchChips = { went_well: string[]; improve_next: string[]; key_moment: string[]; coach_feedback: string[] }

type Season = { id: string; label: string; is_active: boolean }
type Team = { id: string; team_label: string; season_id: string; format: string | null }
type Competition = { id: string; name: string; team_id: string; default_match_minutes: number | null }
type Teammate = { id: string; name: string; nickname: string | null; team_id: string }

const POSITIONS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','SS','ST']
const STAGES = ['friendly','pool','group','knockout','final','other']
const MOMENT_TYPES = ['highlight','learning','error','goal','assist']
const MOODS = [{ v: 'brilliant', e: '🔥' }, { v: 'good', e: '😊' }, { v: 'ok', e: '😐' }, { v: 'tough', e: '😤' }, { v: 'frustrated', e: '😞' }]

const DIMENSIONS: Record<string, { id: string; label: string; sub: string }[]> = {
  CB: [{ id: 'distribution', label: 'Distribution', sub: 'Passing from the back' }, { id: 'positioning', label: 'Positioning', sub: 'Reading the game' }, { id: 'leadership', label: 'Leadership', sub: 'Organising the team' }, { id: 'defending', label: 'Defending', sub: 'Tackles, headers, blocks' }, { id: 'composure', label: 'Composure', sub: 'Calm under pressure' }, { id: 'effort', label: 'Effort', sub: 'Work rate' }],
  ST: [{ id: 'movement', label: 'Movement', sub: 'Runs in behind' }, { id: 'firstTouch', label: 'First Touch', sub: 'Controlling fast balls' }, { id: 'decisionSpeed', label: 'Decision Speed', sub: 'Quick passing or holding' }, { id: 'pressing', label: 'Pressing', sub: 'Hunting the ball' }, { id: 'composure', label: 'Composure', sub: 'Calm under pressure' }, { id: 'effort', label: 'Effort', sub: 'Work rate' }],
  default: [{ id: 'technical', label: 'Technical Quality', sub: 'Ball control & passing' }, { id: 'tactical', label: 'Tactical Awareness', sub: 'Reading the game' }, { id: 'physical', label: 'Physical Effort', sub: 'Work rate' }, { id: 'composure', label: 'Composure', sub: 'Calm under pressure' }, { id: 'decision', label: 'Decision Making', sub: 'Speed of choices' }, { id: 'effort', label: 'Effort', sub: 'Overall effort' }],
}

type PosRow = { position: string; from: string; to: string }
type VideoRow = { url: string; timestamp: string; label: string; type: string }

function numOr(s: string, fallback: number) {
  const n = parseInt(s, 10)
  return Number.isNaN(n) ? fallback : n
}

function FG({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div style={{ gridColumn: full ? '1/-1' : undefined }}><label style={{ display: 'block', fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>{label}</label>{children}</div>
}

export default function LogMatchPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [filteredComps, setFilteredComps] = useState<Competition[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [saved, setSaved] = useState(false)
  const [contributions, setContributions] = useState<GoalState[]>([])
  const [contributionsSaved, setContributionsSaved] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [teamFormat, setTeamFormat] = useState<string>('7v7')

  // Autosave
  const [savedMatchId, setSavedMatchId] = useState<string | null>(null)
  const [savedReflId, setSavedReflId] = useState<string | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'' | 'saving' | 'saved'>('')
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedMatchIdRef = useRef<string | null>(null)
  const savedReflIdRef = useRef<string | null>(null)
  useEffect(() => { savedMatchIdRef.current = savedMatchId }, [savedMatchId])
  useEffect(() => { savedReflIdRef.current = savedReflId }, [savedReflId])

  // Match details
  const [date, setDate] = useState(today())
  const [seasonId, setSeasonId] = useState('')
  const [teamId, setTeamId] = useState('')
  const [compId, setCompId] = useState('')
  const [stage, setStage] = useState('friendly')
  const [opponent, setOpponent] = useState('')
  const [venue, setVenue] = useState('home')
  const [goalsFor, setGoalsFor] = useState('')
  const [goalsAgainst, setGoalsAgainst] = useState('')
  const [myGoals, setMyGoals] = useState('')
  const gf = parseInt(goalsFor) || 0
  const ga = parseInt(goalsAgainst) || 0
  const myGf = parseInt(myGoals) || 0
  const [totalMins, setTotalMins] = useState('60')
  const [minsPlayed, setMinsPlayed] = useState('60')
  const totalMinsNum = numOr(totalMins, 60)
  const minsPlayedNum = numOr(minsPlayed, 60)
  const [mood, setMood] = useState('')
  const [overallRating, setOverallRating] = useState(7)

  // Positions
  const [posRows, setPosRows] = useState<PosRow[]>([{ position: 'CB', from: '', to: '' }])

  // Ratings
  const [ratings, setRatings] = useState<Record<string, number>>({})

  // AI chips
  const [matchChips, setMatchChips] = useState<MatchChips | null>(null)
  const [chipsLoading, setChipsLoading] = useState(false)
  const chipsFetched = useRef(false)

  // Reflection
  const [reflWell, setReflWell] = useState('')
  const [reflImprove, setReflImprove] = useState('')
  const [reflMoment, setReflMoment] = useState('')
  const [reflCoach, setReflCoach] = useState('')
  const refWell = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const refImprove = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const refMoment = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const refCoach = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // Video
  const [videoRows, setVideoRows] = useState<VideoRow[]>([])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const [sr, tr, cr, mr] = await Promise.all([
        supabase.from('seasons').select('id, label, is_active').eq('player_id', user.id).order('created_at', { ascending: false }),
        supabase.from('teams').select('id, team_label, season_id, format').eq('player_id', user.id),
        supabase.from('competitions').select('id, name, team_id, default_match_minutes').eq('player_id', user.id),
        supabase.from('teammates').select('id, name, nickname, team_id').eq('player_id', user.id),
      ])
      const s = sr.data || []
      setSeasons(s)
      setTeams(tr.data as Team[] || [])
      setCompetitions(cr.data as Competition[] || [])
      setTeammates(mr.data as Teammate[] || [])
      const active = s.find(x => x.is_active)
      if (active) setSeasonId(active.id)
    })
  }, [supabase])

  // Fetch AI chips once opponent + team are filled
  useEffect(() => {
    if (!opponent || !teamId || chipsFetched.current) return
    chipsFetched.current = true
    setChipsLoading(true)
    const result = gf > ga ? 'W' : gf < ga ? 'L' : 'D'
    fetch('/api/ai/chip-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'match',
        context: { opponent, result, goals_for: gf, goals_against: ga, position: posRows[0]?.position, mood },
      }),
    })
      .then(r => r.json())
      .then(d => { if (d.chips) setMatchChips(d.chips) })
      .catch(err => console.error('Chip fetch error', err))
      .finally(() => setChipsLoading(false))
  }, [opponent, teamId])

  function onSeasonChange(sid: string) {
    setSeasonId(sid)
    setTeamId('')
    setCompId('')
    setFilteredComps([])
  }

  function onTeamChange(tid: string) {
    setTeamId(tid)
    setCompId('')
    setFilteredComps(competitions.filter(c => c.team_id === tid))
    const found = teams.find(t => t.id === tid)
    if (found?.format) setTeamFormat(found.format)
  }

  function onCompChange(cid: string) {
    setCompId(cid)
    const found = competitions.find(c => c.id === cid)
    if (found?.default_match_minutes) setTotalMins(String(found.default_match_minutes))
  }

  function getDims() {
    const firstPos = posRows[0]?.position || 'default'
    return DIMENSIONS[firstPos] || DIMENSIONS.default
  }

  function setRating(dim: string, val: number) { setRatings(prev => ({ ...prev, [dim]: val })) }

  function addPosRow() { setPosRows(prev => [...prev, { position: 'CB', from: '', to: '' }]) }
  function removePosRow(i: number) { setPosRows(prev => prev.filter((_, idx) => idx !== i)) }
  function updatePosRow(i: number, field: keyof PosRow, val: string) { setPosRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r)) }

  function addVideoRow() { setVideoRows(prev => [...prev, { url: '', timestamp: '', label: '', type: '' }]) }
  function removeVideoRow(i: number) { setVideoRows(prev => prev.filter((_, idx) => idx !== i)) }
  function updateVideoRow(i: number, field: keyof VideoRow, val: string) { setVideoRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r)) }

  function calcResult() {
    if (gf > ga) return 'W'
    if (gf < ga) return 'L'
    return 'D'
  }

  function deriveZone(x: number, y: number): string {
    return `${y < 1/3 ? 'Top' : y < 2/3 ? 'Mid' : 'Low'} ${x < 1/3 ? 'Left' : x < 2/3 ? 'Centre' : 'Right'}`
  }

  const P_W_LM = 300, P_H_LM = 175, P_GL_LM = 16
  const PITCH_FORMATS_LM: Record<string, { pitchW: number; goalW: number; penW: number; penH: number; sixW: number; sixH: number }> = {
    '5v5':  { pitchW: 37, goalW: 3.66, penW: 22,    penH: 7,    sixW: 8,    sixH: 3   },
    '7v7':  { pitchW: 46, goalW: 5,    penW: 28,    penH: 10,   sixW: 12,   sixH: 4   },
    '9v9':  { pitchW: 61, goalW: 6,    penW: 37,    penH: 13,   sixW: 16,   sixH: 5   },
    '11v11':{ pitchW: 68, goalW: 7.32, penW: 40.32, penH: 16.5, sixW: 18.32,sixH: 5.5 },
  }

  function pitchZoneLabel(x: number, y: number, fmt: string): string {
    const pf = PITCH_FORMATS_LM[fmt] || PITCH_FORMATS_LM['7v7']
    const ppx = P_W_LM / pf.pitchW
    const cx = P_W_LM / 2
    const penW = pf.penW * ppx, penH = pf.penH * ppx, sixH = pf.sixH * ppx
    const penX1 = cx - penW / 2, penX2 = cx + penW / 2
    const col = x < penX1 ? 'Left wing'
              : x > penX2 ? 'Right wing'
              : x < cx - penW / 6 ? 'Left channel'
              : x > cx + penW / 6 ? 'Right channel'
              : 'Centre'
    const depth = y - P_GL_LM
    const row = depth < sixH      ? 'Goal area'
              : depth < penH      ? 'Penalty area'
              : depth < penH + 45 ? 'Edge of box'
              : 'Outside box'
    return `${col} · ${row}`
  }

  // Autosave — creates/updates match + reflection only (positions/ratings/video handled on full submit)
  const doAutoSave = useCallback(async (snap: {
    uid: string; seasonId: string; teamId: string; compId: string; date: string
    stage: string; opponent: string; venue: string; gf: number; ga: number
    totalMins: number; minsPlayed: number; mood: string; overallRating: number
    reflWell: string; reflImprove: string; reflMoment: string; reflCoach: string
  }) => {
    if (!snap.opponent || !snap.seasonId || !snap.teamId) return
    setAutoSaveStatus('saving')
    const result = snap.gf > snap.ga ? 'W' : snap.gf < snap.ga ? 'L' : 'D'
    const matchPayload = {
      player_id: snap.uid, season_id: snap.seasonId, team_id: snap.teamId,
      competition_id: snap.compId || null, date: snap.date, opponent: snap.opponent,
      venue_type: snap.venue as 'home', stage: snap.stage as 'friendly',
      total_match_minutes: snap.totalMins, minutes_played: snap.minsPlayed,
      goals_for: snap.gf, goals_against: snap.ga, result,
      mood: snap.mood as 'good' || null, overall_rating: snap.overallRating,
    }
    const currentMatchId = savedMatchIdRef.current
    const currentReflId = savedReflIdRef.current

    if (!currentMatchId) {
      // First autosave — create match + reflection
      const { data: match, error: matchErr } = await supabase.from('matches').insert(matchPayload).select().single()
      if (matchErr || !match) { setAutoSaveStatus(''); return }
      setSavedMatchId(match.id)
      const { data: refl } = await supabase.from('reflections').insert({
        player_id: snap.uid, entity_type: 'match', entity_id: match.id, author_role: 'player',
        went_well: snap.reflWell || null, improve_next: snap.reflImprove || null,
        key_moment: snap.reflMoment || null, coach_feedback_received: snap.reflCoach || null,
        visibility: 'family',
      }).select().single()
      if (refl) setSavedReflId(refl.id)
    } else {
      // Subsequent autosaves — update existing records
      await Promise.all([
        supabase.from('matches').update(matchPayload).eq('id', currentMatchId),
        currentReflId ? supabase.from('reflections').update({
          went_well: snap.reflWell || null, improve_next: snap.reflImprove || null,
          key_moment: snap.reflMoment || null, coach_feedback_received: snap.reflCoach || null,
        }).eq('id', currentReflId) : Promise.resolve(),
      ])
    }
    setAutoSaveStatus('saved')
  }, [supabase])

  // Autosave effect — watches all form fields, requires opponent + team + season
  useEffect(() => {
    if (!userId || !seasonId || !teamId || !opponent) return
    if (saved) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setAutoSaveStatus('')
    const snap = { uid: userId, seasonId, teamId, compId, date, stage, opponent, venue, gf, ga, totalMins: totalMinsNum, minsPlayed: minsPlayedNum, mood, overallRating, reflWell, reflImprove, reflMoment, reflCoach }
    autoSaveTimer.current = setTimeout(() => doAutoSave(snap), 2000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [date, seasonId, teamId, compId, stage, opponent, venue, goalsFor, goalsAgainst, totalMins, minsPlayed, mood, overallRating, reflWell, reflImprove, reflMoment, reflCoach, userId, saved])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !seasonId || !teamId || !opponent) { showToast('Fill in season, team and opponent'); return }
    setSaving(true)

    const result = calcResult()
    const matchPayload = {
      player_id: userId, season_id: seasonId, team_id: teamId,
      competition_id: compId || null, date, opponent, venue_type: venue as 'home',
      stage: stage as 'friendly', total_match_minutes: totalMinsNum, minutes_played: minsPlayedNum,
      goals_for: gf, goals_against: ga, result, mood: mood as 'good' || null, overall_rating: overallRating,
    }

    let matchId = savedMatchIdRef.current
    let reflId = savedReflIdRef.current

    if (matchId) {
      // Match already autosaved — just update it
      await supabase.from('matches').update(matchPayload).eq('id', matchId)
      if (reflId) {
        await supabase.from('reflections').update({
          went_well: reflWell || null, improve_next: reflImprove || null,
          key_moment: reflMoment || null, coach_feedback_received: reflCoach || null,
        }).eq('id', reflId)
      }
      // Replace positions and ratings (autosave skipped these)
      await supabase.from('match_positions').delete().eq('match_id', matchId)
      await supabase.from('match_ratings').delete().eq('match_id', matchId)
    } else {
      // No autosave yet — full insert
      const { data: match, error: matchErr } = await supabase.from('matches').insert(matchPayload).select().single()
      if (matchErr || !match) { showToast('Error saving match'); console.error(matchErr); setSaving(false); return }
      matchId = match.id

      const { data: refl } = await supabase.from('reflections').insert({
        player_id: userId, entity_type: 'match', entity_id: matchId, author_role: 'player',
        went_well: reflWell || null, improve_next: reflImprove || null,
        key_moment: reflMoment || null, coach_feedback_received: reflCoach || null,
        visibility: 'family',
      }).select().single()
      if (refl) reflId = refl.id
    }

    // Positions
    if (posRows.filter(r => r.position).length > 0) {
      await supabase.from('match_positions').insert(posRows.filter(r => r.position).map(r => ({ match_id: matchId, position: r.position, minutes_from: r.from ? parseInt(r.from) : null, minutes_to: r.to ? parseInt(r.to) : null })))
    }

    // Ratings
    const dims = getDims()
    await supabase.from('match_ratings').insert(dims.map(d => ({ match_id: matchId, dimension: d.id, score: ratings[d.id] || 5 })))

    // Video moments
    const validVideos = videoRows.filter(v => v.url)
    if (validVideos.length > 0) {
      await supabase.from('match_video_moments').insert(validVideos.map(v => ({ match_id: matchId, url: v.url, timestamp_in_video: v.timestamp || null, label: v.label || null, moment_type: v.type as 'highlight' || null })))
    }

    // Goal contributions
    if (contributions.length > 0 && matchId) {
      await supabase.from('match_contributions').insert(
        contributions.map((g, i) => ({
          match_id: matchId,
          player_id: userId,
          goal_index: i + 1,
          goal_type: g.goalType,
          ball_x: g.ballX, ball_y: g.ballY,
          ball_zone: g.ballX != null ? deriveZone(g.ballX, g.ballY!) : null,
          keeper_x_pct: g.keeperXPct,
          keeper_posture: g.keeperPosture,
          body_part: g.bodyPart, technique: g.technique,
          score_us: g.scoreUs, score_opp: g.scoreOpp,
          period: g.period,
          shot_x: g.shotX, shot_y: g.shotY,
          shot_zone: g.shotX != null ? pitchZoneLabel(g.shotX, g.shotY!, teamFormat) : null,
          video_url: g.videoUrl || null,
        }))
      )
    }

    showToast('Match saved ✓')
    setSaved(true)
    setAutoSaveStatus('saved')

    // AI feedback
    if (reflId && (reflWell || reflImprove || reflMoment)) {
      setAiLoading(true)
      try {
        const res = await fetch('/api/ai/match-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opponent, result, position: posRows[0]?.position, overall_rating: overallRating, went_well: reflWell, improve_next: reflImprove, key_moment: reflMoment, coach_feedback: reflCoach, ratings: Object.fromEntries(getDims().map(d => [d.label, ratings[d.id] || 5])) }),
        })
        const data = await res.json()
        if (data.feedback) {
          setAiText(data.feedback)
          await supabase.from('reflections').update({ ai_feedback: data.feedback }).eq('id', reflId)
        }
      } catch (err) { console.error('AI error', err) }
      setAiLoading(false)
    }

    setSaving(false)
  }

  const dims = getDims()
  const seasonTeams = seasonId ? teams.filter(t => t.season_id === seasonId) : teams

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Match Details */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1.5px', marginBottom: '16px' }}>📅 Match Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FG label="Date"><input type="date" value={date} onChange={e => setDate(e.target.value)} required /></FG>
            <FG label="Season"><select value={seasonId} onChange={e => onSeasonChange(e.target.value)} required><option value="">— select —</option>{seasons.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></FG>
            <FG label="Team"><select value={teamId} onChange={e => onTeamChange(e.target.value)} required><option value="">— select team —</option>{seasonTeams.map(t => <option key={t.id} value={t.id}>{t.team_label}</option>)}</select></FG>
            <FG label="Competition"><select value={compId} onChange={e => onCompChange(e.target.value)}><option value="">— select —</option>{filteredComps.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></FG>
            <FG label="Stage"><select value={stage} onChange={e => setStage(e.target.value)}>{STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></FG>
            <FG label="Venue"><select value={venue} onChange={e => setVenue(e.target.value)}><option value="home">Home</option><option value="away">Away</option><option value="neutral">Neutral</option></select></FG>
            <FG label="Opponent"><input value={opponent} onChange={e => setOpponent(e.target.value)} placeholder="e.g. Al Nasr Academy" required /></FG>
            <FG label=""><div /></FG>
            <FG label="Our Goals"><input type="number" value={goalsFor} onChange={e => setGoalsFor(e.target.value)} placeholder="0" min="0" max="20" /></FG>
            <FG label="Their Goals"><input type="number" value={goalsAgainst} onChange={e => setGoalsAgainst(e.target.value)} placeholder="0" min="0" max="20" /></FG>
            <FG label="My Goals ⚽" full>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  value={myGoals}
                  onChange={e => {
                    const n = parseInt(e.target.value)
                    if (!isNaN(n) && gf > 0 && n > gf) setMyGoals(String(gf))
                    else setMyGoals(e.target.value)
                  }}
                  placeholder="0"
                  min="0"
                  max={gf || 20}
                  style={{ width: '80px' }}
                />
                {myGf > 0 && (
                  <button
                    type="button"
                    onClick={() => setGoalModalOpen(true)}
                    style={{ padding: '10px 16px', background: contributionsSaved ? 'rgba(52,211,153,0.1)' : 'rgba(232,255,71,0.08)', border: `1px solid ${contributionsSaved ? '#34d399' : 'var(--accent)'}`, borderRadius: '8px', color: contributionsSaved ? '#34d399' : 'var(--accent)', fontFamily: 'Bebas Neue', fontSize: '16px', letterSpacing: '1.5px', cursor: 'pointer', whiteSpace: 'nowrap' as const }}
                  >
                    {contributionsSaved ? `✓ Details Saved` : `⚽ Record My ${myGf === 1 ? 'Goal' : `${myGf} Goals`}`}
                  </button>
                )}
              </div>
            </FG>
            <FG label="Total Match Time (mins)"><input type="number" value={totalMins} onChange={e => setTotalMins(e.target.value)} min="10" max="120" /></FG>
            <FG label="My Time Played (mins)"><input type="number" value={minsPlayed} onChange={e => setMinsPlayed(e.target.value)} min="0" max="120" /></FG>
          </div>
        </div>

        {/* Goal Detail Modal */}
        {goalModalOpen && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
            onClick={e => { if (e.target === e.currentTarget) setGoalModalOpen(false) }}
          >
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Modal header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '2px', color: 'var(--accent)' }}>⚽ My Goal Details</div>
                <button type="button" onClick={() => setGoalModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
              </div>
              <GoalContributionCard
                goalCount={myGf}
                format={(teamFormat as '5v5' | '7v7' | '9v9' | '11v11') || '7v7'}
                onChange={setContributions}
              />
              {/* Modal save button */}
              <button
                type="button"
                onClick={() => { setContributionsSaved(true); setGoalModalOpen(false) }}
                style={{ padding: '14px', background: 'var(--accent)', border: 'none', borderRadius: '10px', color: 'var(--surface)', fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '3px', cursor: 'pointer' }}
              >
                Save Goal Details
              </button>
            </div>
          </div>
        )}

        {/* Positions */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1.5px', marginBottom: '8px' }}>🔢 Positions Played</div>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '14px' }}>Add each position with time range — split if you changed roles.</p>
          {posRows.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(90px,130px) 66px 66px 32px auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <select value={row.position} onChange={e => updatePosRow(i, 'position', e.target.value)} style={{ fontSize: '15px', padding: '8px 10px' }}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input type="number" placeholder="From" min="0" max="120" value={row.from} onChange={e => updatePosRow(i, 'from', e.target.value)} style={{ fontSize: '15px', padding: '8px' }} />
              <input type="number" placeholder="To" min="0" max="120" value={row.to} onChange={e => updatePosRow(i, 'to', e.target.value)} style={{ fontSize: '15px', padding: '8px' }} />
              <button type="button" onClick={() => removePosRow(i)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '16px', minWidth: '32px', minHeight: '32px' }}>✕</button>
              {i === posRows.length - 1
                ? <button type="button" onClick={addPosRow} style={{ background: 'transparent', border: '1px dashed var(--border)', color: 'var(--muted)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Mono', whiteSpace: 'nowrap' as const, minHeight: '36px' }}>+ Add</button>
                : <div />
              }
            </div>
          ))}
          {posRows.length === 0 && (
            <button type="button" onClick={addPosRow} style={{ background: 'transparent', border: '1px dashed var(--border)', color: 'var(--muted)', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Mono' }}>+ Add Position</button>
          )}
        </div>

        {/* Mood */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1.5px', marginBottom: '16px' }}>😊 How Did I Feel?</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {MOODS.map(m => (
              <button key={m.v} type="button" onClick={() => setMood(m.v)}
                style={{ background: mood === m.v ? 'rgba(232,255,71,0.08)' : 'var(--surface)', border: `2px solid ${mood === m.v ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '10px', padding: '12px 14px', cursor: 'pointer', fontSize: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', minWidth: '72px', minHeight: '72px', justifyContent: 'center' }}>
                {m.e}
                <span style={{ fontSize: '12px', fontFamily: 'DM Mono', color: 'var(--muted)', textTransform: 'uppercase' }}>{m.v}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1.5px', marginBottom: '8px' }}>📊 Rate My Performance (1–10)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            {dims.map(d => (
              <div key={d.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 500 }}>{d.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'DM Mono' }}>{d.sub}</div>
                  </div>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '26px', color: 'var(--accent)', minWidth: '32px', textAlign: 'right' }}>{ratings[d.id] || 5}</div>
                </div>
                <input type="range" min="1" max="10" value={ratings[d.id] || 5} onChange={e => setRating(d.id, parseInt(e.target.value))} />
              </div>
            ))}
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>
              <span>Overall Rating</span><span style={{ color: 'var(--accent)', fontFamily: 'Bebas Neue', fontSize: '26px' }}>{overallRating}/10</span>
            </label>
            <input type="range" min="1" max="10" value={overallRating} onChange={e => setOverallRating(parseInt(e.target.value))} />
          </div>
        </div>


        {/* Reflection */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1.5px', marginBottom: '16px' }}>💬 My Reflection</div>
          {chipsLoading && (
            <div style={{ fontSize: '12px', fontFamily: 'DM Mono', color: 'var(--muted)', marginBottom: '12px', letterSpacing: '0.5px' }}>⚡ generating suggestions...</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FG label="🌟 One thing I did really well today">
              <textarea ref={refWell as React.RefObject<HTMLTextAreaElement>} value={reflWell} onChange={e => setReflWell(e.target.value)} placeholder="Be specific — what exactly did you do well?" style={{ minHeight: '80px' }} />
              {matchChips?.went_well && <WordCloud chips={matchChips.went_well} inputRef={refWell} value={reflWell} onChange={setReflWell} />}
            </FG>
            <FG label="🎯 One thing I want to improve next time">
              <textarea ref={refImprove as React.RefObject<HTMLTextAreaElement>} value={reflImprove} onChange={e => setReflImprove(e.target.value)} placeholder="What specific situation could you handle differently?" style={{ minHeight: '80px' }} />
              {matchChips?.improve_next && <WordCloud chips={matchChips.improve_next} inputRef={refImprove} value={reflImprove} onChange={setReflImprove} />}
            </FG>
            <FG label="🎬 Moment of the Match">
              <textarea ref={refMoment as React.RefObject<HTMLTextAreaElement>} value={reflMoment} onChange={e => setReflMoment(e.target.value)} placeholder="Describe a specific moment — good or bad" style={{ minHeight: '80px' }} />
              {matchChips?.key_moment && <WordCloud chips={matchChips.key_moment} inputRef={refMoment} value={reflMoment} onChange={setReflMoment} />}
            </FG>
            <FG label="📋 Coach Feedback">
              <textarea ref={refCoach as React.RefObject<HTMLTextAreaElement>} value={reflCoach} onChange={e => setReflCoach(e.target.value)} placeholder="What did the coach say?" style={{ minHeight: '80px' }} />
              {matchChips?.coach_feedback && <WordCloud chips={matchChips.coach_feedback} inputRef={refCoach} value={reflCoach} onChange={setReflCoach} />}
            </FG>
          </div>
          {(aiText || aiLoading) && (
            <div style={{ background: 'rgba(232,255,71,0.05)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: '10px', padding: '16px', marginTop: '16px' }}>
              <div style={{ fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>⚡ Coach AI Feedback</div>
              {aiLoading && !aiText
                ? <div style={{ display: 'flex', gap: '4px' }}><span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" /></div>
                : <p style={{ fontSize: '17px', lineHeight: 1.7 }}>{aiText}</p>}
            </div>
          )}
        </div>

        {/* Video Moments */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1.5px', marginBottom: '8px' }}>🎥 Video Moments</div>
          <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '14px' }}>Paste links to specific moments — YouTube, Hudl, Google Drive, anything.</p>
          {videoRows.map((row, i) => (
            <div key={i} style={{ marginBottom: '14px', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', background: 'var(--surface)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', marginBottom: '10px' }}>
                <input type="url" placeholder="Paste video URL (YouTube, Hudl, Drive...)" value={row.url} onChange={e => updateVideoRow(i, 'url', e.target.value)} style={{ fontSize: '16px' }} />
                <button type="button" onClick={() => removeVideoRow(i)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px', minWidth: '36px' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="Timestamp (e.g. 2:14)" value={row.timestamp} onChange={e => updateVideoRow(i, 'timestamp', e.target.value)} style={{ fontSize: '16px' }} />
                <input type="text" placeholder="Label" value={row.label} onChange={e => updateVideoRow(i, 'label', e.target.value)} style={{ fontSize: '16px' }} />
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {MOMENT_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => updateVideoRow(i, 'type', row.type === t ? '' : t)}
                    style={{ fontSize: '13px', fontFamily: 'DM Mono', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', border: `1px solid ${row.type === t ? 'var(--accent)' : 'var(--border)'}`, color: row.type === t ? 'var(--accent)' : 'var(--muted)', background: row.type === t ? 'rgba(232,255,71,0.08)' : 'var(--surface)', cursor: 'pointer' }}>{t}</button>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={addVideoRow} style={{ background: 'transparent', border: '1px dashed var(--border)', color: 'var(--muted)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontFamily: 'DM Mono', width: '100%', minHeight: '44px' }}>+ Add Video Moment</button>
        </div>

        {/* Autosave status */}
        {autoSaveStatus && (
          <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '13px', fontFamily: 'DM Mono', color: 'var(--muted)', letterSpacing: '0.5px' }}>
            {autoSaveStatus === 'saving' ? '· saving...' : '· autosaved ✓'}
          </div>
        )}

        <button type="submit" disabled={saving || saved}
          style={{ width: '100%', padding: '16px', background: saved ? '#34d399' : saving ? 'var(--border)' : 'var(--accent)', border: 'none', borderRadius: '10px', color: 'var(--surface)', fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '3px', cursor: saving || saved ? 'not-allowed' : 'pointer', marginBottom: '24px' }}>
          {saved ? '✓ Match Saved' : saving ? 'Saving...' : 'Save Match Reflection'}
        </button>
      </form>

      {toast && <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'var(--surface)', padding: '14px 24px', borderRadius: '10px', fontFamily: 'Bebas Neue', fontSize: '16px', letterSpacing: '1.5px', zIndex: 300 }}>{toast}</div>}
    </div>
  )
}
