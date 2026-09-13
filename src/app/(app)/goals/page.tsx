'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, today, daysFromNow } from '@/lib/utils/format'

type Season = { id: string; label: string; is_active: boolean | null }
type Team = { id: string; team_label: string }
type Goal = { id: string; text: string; why: string | null; set_by: string | null; target_date: string | null; completed_at: string | null; visibility: string; teams?: { team_label: string } | null }

function FG({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: '14px' }}><label style={{ display: 'block', fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>{label}</label>{children}</div>
}

export default function GoalsPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [seasonId, setSeasonId] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const [text, setText] = useState('')
  const [why, setWhy] = useState('')
  const [teamId, setTeamId] = useState('')
  const [setBy, setSetBy] = useState('player')
  const [targetDate, setTargetDate] = useState(daysFromNow(30))

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadGoals = useCallback(async (uid: string, sid: string) => {
    const q = supabase.from('goals').select('*, teams(team_label)').eq('player_id', uid).order('created_at', { ascending: false })
    if (sid) q.eq('season_id', sid)
    const { data } = await q
    setGoals(data as Goal[] || [])
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const [sr, tr] = await Promise.all([
        supabase.from('seasons').select('id, label, is_active').eq('player_id', user.id).order('created_at', { ascending: false }),
        supabase.from('teams').select('id, team_label').eq('player_id', user.id),
      ])
      const s = sr.data || []
      setSeasons(s)
      setTeams(tr.data || [])
      const active = s.find(x => x.is_active)
      const sid = active?.id || s[0]?.id || ''
      setSeasonId(sid)
      await loadGoals(user.id, sid)
    })
  }, [supabase, loadGoals])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !seasonId || !text.trim()) { showToast('Add a goal text and select a season'); return }
    setSaving(true)
    const { error } = await supabase.from('goals').insert({
      player_id: userId, season_id: seasonId, team_id: teamId || null,
      text: text.trim(), why: why || null, set_by: setBy as 'player',
      target_date: targetDate || null, visibility: 'family',
    })
    if (error) { showToast('Error saving'); console.error(error) }
    else { showToast('Goal added ✓'); setText(''); setWhy(''); setTargetDate(daysFromNow(30)); await loadGoals(userId, seasonId) }
    setSaving(false)
  }

  async function handleComplete(id: string) {
    await supabase.from('goals').update({ completed_at: new Date().toISOString() }).eq('id', id)
    if (userId) await loadGoals(userId, seasonId)
    showToast('Goal completed! 🎉')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this goal?')) return
    await supabase.from('goals').delete().eq('id', id)
    if (userId) await loadGoals(userId, seasonId)
    showToast('Deleted')
  }

  const active = goals.filter(g => !g.completed_at)
  const completed = goals.filter(g => g.completed_at)

  return (
    <div>
      {/* Add Form */}
      <form onSubmit={handleAdd}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1.5px', marginBottom: '16px' }}>🎯 Add Objective</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FG label="Season">
              <select value={seasonId} onChange={e => { setSeasonId(e.target.value); if (userId) loadGoals(userId, e.target.value) }}>
                <option value="">— select —</option>
                {seasons.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </FG>
            <FG label="Set By">
              <select value={setBy} onChange={e => setSetBy(e.target.value)}>
                <option value="player">Me</option>
                <option value="coach">Coach</option>
                <option value="parent">Parent</option>
              </select>
            </FG>
            <div style={{ gridColumn: '1/-1' }}>
              <FG label="Focus Area (be very specific)">
                <input value={text} onChange={e => setText(e.target.value)} placeholder={'e.g. "When receiving under pressure, take one touch away before looking up"'} required />
              </FG>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <FG label="Why This Matters">
                <textarea value={why} onChange={e => setWhy(e.target.value)} placeholder="In your own words..." style={{ minHeight: '80px' }} />
              </FG>
            </div>
            <FG label="Team (optional)">
              <select value={teamId} onChange={e => setTeamId(e.target.value)}>
                <option value="">All teams</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.team_label}</option>)}
              </select>
            </FG>
            <FG label="Target Date">
              <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
            </FG>
          </div>
        </div>
        <button type="submit" disabled={saving} style={{ width: '100%', padding: '16px', background: saving ? 'var(--border)' : 'var(--accent)', border: 'none', borderRadius: '10px', color: 'var(--surface)', fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '3px', cursor: saving ? 'not-allowed' : 'pointer', marginBottom: '28px' }}>
          {saving ? 'Saving...' : 'Add Objective'}
        </button>
      </form>

      {/* Active Objectives */}
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '2px', color: 'var(--muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>Active Objectives <span style={{ color: 'var(--accent)' }}>({active.length})</span><span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'block' }} /></div>
      {active.length === 0
        ? <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '14px', marginBottom: '24px' }}>No active objectives — add one above</div>
        : active.map(g => (
          <div key={g.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: '8px', padding: '14px 16px', marginBottom: '10px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', lineHeight: 1.4 }}>{g.text}</div>
            {g.why && <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px', lineHeight: 1.5 }}>{g.why}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {g.target_date && <span style={{ fontSize: '12px', fontFamily: 'DM Mono', color: 'var(--muted)' }}>Target: {formatDate(g.target_date)}</span>}
                {g.set_by && g.set_by !== 'player' && <span style={{ fontSize: '12px', fontFamily: 'DM Mono', padding: '2px 8px', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--muted)' }}>Set by {g.set_by}</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleComplete(g.id)} style={{ background: 'rgba(232,255,71,0.1)', border: '1px solid rgba(232,255,71,0.3)', color: 'var(--accent)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'DM Mono', fontSize: '12px', letterSpacing: '0.5px' }}>✓ Complete</button>
                <button onClick={() => handleDelete(g.id)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--danger)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'DM Mono', fontSize: '12px' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}

      {/* Completed Goals */}
      {completed.length > 0 && (
        <>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '2px', color: 'var(--muted)', marginBottom: '14px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>Completed ({completed.length})<span style={{ flex: 1, height: '1px', background: 'var(--border)', display: 'block' }} /></div>
          {completed.map(g => (
            <div key={g.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid #34d399', borderRadius: '8px', padding: '14px 16px', marginBottom: '10px', opacity: 0.7 }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', textDecoration: 'line-through', color: 'var(--muted)' }}>{g.text}</div>
              <div style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#34d399' }}>✓ Completed {g.completed_at ? formatDate(g.completed_at.split('T')[0]) : ''}</div>
            </div>
          ))}
        </>
      )}

      {toast && <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'var(--surface)', padding: '14px 24px', borderRadius: '10px', fontFamily: 'Bebas Neue', fontSize: '16px', letterSpacing: '1.5px', zIndex: 300 }}>{toast}</div>}
    </div>
  )
}
