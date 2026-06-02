'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, formatDate } from '@/lib/utils/format'
import { WordCloud } from '@/components/ui/WordCloud'

type TrainingChips = { focus_areas: string[]; reflection_notes: string[] }

type Team = { id: string; team_label: string }
type Season = { id: string; label: string; is_active: boolean }
type Training = { id: string; date: string; duration_minutes: number | null; session_type: string | null; notes: string | null; rating: number | null; coach_led: boolean; teams?: { team_label: string } | null }

const SESSION_TYPES = [
  { value: 'technical', label: 'Technical' }, { value: 'tactical', label: 'Tactical' },
  { value: 'physical', label: 'Physical' }, { value: 'set_pieces', label: 'Set Pieces' },
  { value: 'small_sided', label: 'Small Sided Games' }, { value: 'fitness', label: 'Fitness' },
  { value: 'other', label: 'Other' },
]

function FG({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: '4px' }}><label style={{ display: 'block', fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>{label}</label>{children}</div>
}
function Badge({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: '12px', fontFamily: 'DM Mono', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--muted)' }}>{children}</span>
}

export default function LogTrainingPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [trainings, setTrainings] = useState<Training[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [date, setDate] = useState(today())
  const [teamId, setTeamId] = useState('')
  const [seasonId, setSeasonId] = useState('')
  const [duration, setDuration] = useState('60')
  const [sessionType, setSessionType] = useState('technical')
  const [focusAreas, setFocusAreas] = useState('')
  const [coachLed, setCoachLed] = useState('yes')
  const [rating, setRating] = useState(7)
  const [notes, setNotes] = useState('')

  const refFocus = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const refNotes = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null)
  const [trainingChips, setTrainingChips] = useState<TrainingChips | null>(null)
  const [chipsLoading, setChipsLoading] = useState(false)
  const chipsFetched = useRef(false)

  // Autosave
  const [savedTrainingId, setSavedTrainingId] = useState<string | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'' | 'saving' | 'saved'>('')
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTrainingIdRef = useRef<string | null>(null)
  useEffect(() => { savedTrainingIdRef.current = savedTrainingId }, [savedTrainingId])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // Fetch AI chips when session type changes (or on first load)
  useEffect(() => {
    if (!userId) return
    chipsFetched.current = false
    setTrainingChips(null)
  }, [sessionType])

  useEffect(() => {
    if (!userId || chipsFetched.current) return
    chipsFetched.current = true
    setChipsLoading(true)
    fetch('/api/ai/chip-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'training',
        context: { session_type: sessionType, duration: parseInt(duration), coach_led: coachLed === 'yes' },
      }),
    })
      .then(r => r.json())
      .then(d => { if (d.chips) setTrainingChips(d.chips) })
      .catch(err => console.error('Chip fetch error', err))
      .finally(() => setChipsLoading(false))
  }, [userId, sessionType])

  const loadTrainings = useCallback(async (uid: string) => {
    const { data } = await supabase.from('training_sessions').select('*, teams(team_label)').eq('player_id', uid).order('date', { ascending: false }).limit(20)
    setTrainings(data as Training[] || [])
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const [tr, sr] = await Promise.all([
        supabase.from('teams').select('id, team_label').eq('player_id', user.id),
        supabase.from('seasons').select('id, label, is_active').eq('player_id', user.id).order('created_at', { ascending: false }),
      ])
      const s = sr.data || []
      setTeams(tr.data || [])
      setSeasons(s)
      const active = s.find(x => x.is_active)
      if (active) setSeasonId(active.id)
      await loadTrainings(user.id)
    })
  }, [supabase, loadTrainings])

  // Autosave — creates or updates the training record
  const doAutoSave = useCallback(async (snap: {
    uid: string; seasonId: string; teamId: string; date: string
    duration: string; sessionType: string; focusAreas: string; coachLed: string; rating: number; notes: string
  }) => {
    if (!snap.seasonId) return
    setAutoSaveStatus('saving')
    const focusArr = snap.focusAreas ? snap.focusAreas.split(',').map(f => f.trim()).filter(Boolean) : []
    const payload = {
      player_id: snap.uid, season_id: snap.seasonId, team_id: snap.teamId || null, date: snap.date,
      duration_minutes: parseInt(snap.duration), session_type: snap.sessionType as 'technical',
      focus_areas: focusArr.length ? focusArr : null, coach_led: snap.coachLed === 'yes',
      rating: snap.rating, notes: snap.notes || null,
    }
    const currentId = savedTrainingIdRef.current
    if (!currentId) {
      const { data, error } = await supabase.from('training_sessions').insert(payload).select().single()
      if (!error && data) { setSavedTrainingId(data.id); setAutoSaveStatus('saved') }
      else setAutoSaveStatus('')
    } else {
      const { error } = await supabase.from('training_sessions').update(payload).eq('id', currentId)
      if (!error) setAutoSaveStatus('saved')
      else setAutoSaveStatus('')
    }
  }, [supabase])

  // Autosave effect — requires seasonId at minimum
  useEffect(() => {
    if (!userId || !seasonId) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setAutoSaveStatus('')
    const snap = { uid: userId, seasonId, teamId, date, duration, sessionType, focusAreas, coachLed, rating, notes }
    autoSaveTimer.current = setTimeout(() => doAutoSave(snap), 2000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [date, teamId, seasonId, duration, sessionType, focusAreas, coachLed, rating, notes, userId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !seasonId) { showToast('Select a season first'); return }
    setSaving(true)

    const focusArr = focusAreas ? focusAreas.split(',').map(f => f.trim()).filter(Boolean) : []
    const payload = {
      player_id: userId, season_id: seasonId, team_id: teamId || null, date,
      duration_minutes: parseInt(duration), session_type: sessionType as 'technical',
      focus_areas: focusArr.length ? focusArr : null, coach_led: coachLed === 'yes', rating, notes: notes || null,
    }

    const currentId = savedTrainingIdRef.current
    if (currentId) {
      // Already autosaved — just update
      await supabase.from('training_sessions').update(payload).eq('id', currentId)
    } else {
      const { error } = await supabase.from('training_sessions').insert(payload)
      if (error) { showToast('Error saving'); console.error(error); setSaving(false); return }
    }

    showToast('Training saved ✓')
    // Reset form for next entry
    setSavedTrainingId(null)
    setAutoSaveStatus('')
    setNotes(''); setFocusAreas(''); setRating(7); setDate(today())
    await loadTrainings(userId)
    setSaving(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1.5px', marginBottom: '16px' }}>🏋️ Training Session</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FG label="Date"><input type="date" value={date} onChange={e => setDate(e.target.value)} required /></FG>
            <FG label="Season"><select value={seasonId} onChange={e => setSeasonId(e.target.value)} required><option value="">— select —</option>{seasons.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></FG>
            <FG label="Team"><select value={teamId} onChange={e => setTeamId(e.target.value)}><option value="">— optional —</option>{teams.map(t => <option key={t.id} value={t.id}>{t.team_label}</option>)}</select></FG>
            <FG label="Duration (mins)"><input type="number" value={duration} onChange={e => setDuration(e.target.value)} min="15" max="180" /></FG>
            <FG label="Session Type"><select value={sessionType} onChange={e => setSessionType(e.target.value)}>{SESSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></FG>
            <FG label="Coach Led?"><select value={coachLed} onChange={e => setCoachLed(e.target.value)}><option value="yes">Yes</option><option value="no">No — solo</option></select></FG>
            <div style={{ gridColumn: '1/-1' }}>
              <FG label="What We Worked On (comma separated)">
                <input ref={refFocus as React.RefObject<HTMLInputElement>} value={focusAreas} onChange={e => setFocusAreas(e.target.value)} placeholder="e.g. Pressing triggers, finishing, set pieces" />
                {chipsLoading && <div style={{ fontSize: '12px', fontFamily: 'DM Mono', color: 'var(--muted)', marginTop: '6px' }}>⚡ generating suggestions...</div>}
                {trainingChips?.focus_areas && <WordCloud chips={trainingChips.focus_areas} inputRef={refFocus} value={focusAreas} onChange={setFocusAreas} separator=", " />}
              </FG>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>
                <span>My Rating</span><span style={{ color: 'var(--accent)', fontFamily: 'Bebas Neue', fontSize: '22px' }}>{rating}/10</span>
              </label>
              <input type="range" min="1" max="10" value={rating} onChange={e => setRating(parseInt(e.target.value))} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <FG label="My Reflection">
                <textarea ref={refNotes as React.RefObject<HTMLTextAreaElement>} value={notes} onChange={e => setNotes(e.target.value)} placeholder="What did you take away? What clicked? What still needs work?" style={{ minHeight: '100px' }} />
                {trainingChips?.reflection_notes && <WordCloud chips={trainingChips.reflection_notes} inputRef={refNotes} value={notes} onChange={setNotes} />}
              </FG>
            </div>
          </div>
        </div>

        {/* Autosave status */}
        {autoSaveStatus && (
          <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '13px', fontFamily: 'DM Mono', color: 'var(--muted)', letterSpacing: '0.5px' }}>
            {autoSaveStatus === 'saving' ? '· saving...' : '· autosaved ✓'}
          </div>
        )}

        <button type="submit" disabled={saving} style={{ width: '100%', padding: '16px', background: saving ? 'var(--border)' : 'var(--accent)', border: 'none', borderRadius: '10px', color: 'var(--surface)', fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '3px', cursor: saving ? 'not-allowed' : 'pointer', marginBottom: '28px' }}>
          {saving ? 'Saving...' : 'Save Training Session'}
        </button>
      </form>

      <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '2px', color: 'var(--muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>Recent Sessions<span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'block' }} /></div>
      {trainings.length === 0
        ? <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '14px' }}>No sessions logged yet</div>
        : trainings.map(t => (
          <div key={t.id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: '13px', color: 'var(--muted)' }}>{formatDate(t.date)}</span>
              <span style={{ flex: 1, fontWeight: 600 }}>{t.session_type?.replace('_', ' ').toUpperCase()}</span>
              {t.rating && <span style={{ fontFamily: 'Bebas Neue', fontSize: '24px', color: 'var(--accent)' }}>{t.rating}/10</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {t.teams?.team_label && <Badge>{t.teams.team_label}</Badge>}
              {t.duration_minutes && <Badge>{t.duration_minutes} mins</Badge>}
              {!t.coach_led && <Badge>Solo</Badge>}
            </div>
            {t.notes && <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.6, marginTop: '8px' }}>{t.notes}</p>}
          </div>
        ))}
      {toast && <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'var(--surface)', padding: '14px 24px', borderRadius: '10px', fontFamily: 'Bebas Neue', fontSize: '16px', letterSpacing: '1.5px', zIndex: 300 }}>{toast}</div>}
    </div>
  )
}
