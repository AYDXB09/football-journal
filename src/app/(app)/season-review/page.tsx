'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Season = { id: string; label: string; is_active: boolean }
type Team = { id: string; team_label: string; season_id: string }

const SEASON_DIMS = [
  { id: 'sr_technical', label: 'Technical Quality', sub: 'Ball control, passing, shooting' },
  { id: 'sr_tactical', label: 'Tactical Awareness', sub: 'Reading the game, positioning' },
  { id: 'sr_mental', label: 'Mental Strength', sub: 'Composure, resilience, focus' },
  { id: 'sr_effort', label: 'Effort & Attitude', sub: 'Work rate, coachability' },
  { id: 'sr_leadership', label: 'Leadership', sub: 'Organising, encouraging teammates' },
  { id: 'sr_decision', label: 'Decision Making', sub: 'Speed and quality of choices' },
]

function FG({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>{label}</label>{children}</div>
}
function StepNum({ n }: { n: string }) {
  return <div style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color: 'var(--border)', minWidth: '32px', lineHeight: 1 }}>{n}</div>
}

export default function SeasonReviewPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [seasonId, setSeasonId] = useState('')
  const [seasonTeams, setSeasonTeams] = useState<Team[]>([])
  const [teamReflections, setTeamReflections] = useState<Record<string, { text: string; rating: number }>>({})
  const [proud, setProud] = useState('')
  const [hard, setHard] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [gap, setGap] = useState('')
  const [coachTheme, setCoachTheme] = useState('')
  const [letter, setLetter] = useState('')
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [existing, setExisting] = useState<boolean>(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const { data: s } = await supabase.from('seasons').select('id, label, is_active').eq('player_id', user.id).order('created_at', { ascending: false })
      setSeasons(s || [])
      const active = (s || []).find(x => x.is_active)
      if (active) { setSeasonId(active.id); loadSeason(user.id, active.id) }
    })
  }, [supabase])

  async function loadSeason(uid: string, sid: string) {
    const [tr, rr] = await Promise.all([
      supabase.from('teams').select('id, team_label, season_id').eq('player_id', uid).eq('season_id', sid),
      supabase.from('season_reviews').select('*').eq('player_id', uid).eq('season_id', sid).single(),
    ])
    setSeasonTeams(tr.data as Team[] || [])
    if (rr.data) {
      setExisting(true)
      setProud(rr.data.proud || '')
      setHard(rr.data.hardest_moment || '')
      setNewSkill(rr.data.new_skill || '')
      setGap(rr.data.gap || '')
      setCoachTheme(rr.data.coach_theme || '')
      setLetter(rr.data.letter_to_self || '')
      setRatings((rr.data.ratings as Record<string, number>) || {})
      setTeamReflections((rr.data.team_reflections as Record<string, { text: string; rating: number }>) || {})
      setAiText(rr.data.ai_feedback || '')
    }
  }

  function setTeamText(teamId: string, text: string) {
    setTeamReflections(prev => ({ ...prev, [teamId]: { ...prev[teamId], text, rating: prev[teamId]?.rating || 0 } }))
  }
  function setTeamRating(teamId: string, rating: number) {
    setTeamReflections(prev => ({ ...prev, [teamId]: { ...prev[teamId], rating, text: prev[teamId]?.text || '' } }))
  }
  function setRating(dim: string, val: number) { setRatings(prev => ({ ...prev, [dim]: val })) }

  async function handleSave() {
    if (!userId || !seasonId) { showToast('Select a season first'); return }
    setSaving(true)
    setAiLoading(true)

    const payload = {
      player_id: userId, season_id: seasonId,
      team_reflections: teamReflections, proud, hardest_moment: hard,
      new_skill: newSkill, gap, coach_theme: coachTheme,
      letter_to_self: letter, ratings,
    }

    const upsertFn = existing
      ? supabase.from('season_reviews').update(payload).eq('player_id', userId).eq('season_id', seasonId)
      : supabase.from('season_reviews').insert(payload)

    const { error } = await upsertFn
    if (error) { showToast('Error saving'); console.error(error); setSaving(false); setAiLoading(false); return }

    setExisting(true)
    showToast('Season review saved ✓')

    // AI feedback
    try {
      const res = await fetch('/api/ai/season-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proud, hardest_moment: hard, new_skill: newSkill, gap, coach_theme: coachTheme, letter_to_self: letter, team_reflections: teamReflections }),
      })
      const data = await res.json()
      if (data.feedback) {
        setAiText(data.feedback)
        await supabase.from('season_reviews').update({ ai_feedback: data.feedback }).eq('player_id', userId).eq('season_id', seasonId)
      }
    } catch (e) { console.error('AI error', e) }

    setAiLoading(false)
    setSaving(false)
  }

  return (
    <div>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg,rgba(255,179,71,0.08),rgba(232,255,71,0.04))', border: '1px solid rgba(255,179,71,0.25)', borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '28px' }}>🏁</span>
        <div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '2px', color: 'var(--warning)' }}>Season Closing Review</div>
          <div style={{ fontSize: '15px', color: 'var(--muted)', marginTop: '3px' }}>Take 10 minutes. Be honest with yourself.</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <select value={seasonId} onChange={e => { setSeasonId(e.target.value); if (userId) loadSeason(userId, e.target.value) }} style={{ background: 'var(--card-bg)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '8px', padding: '8px 12px', fontFamily: 'Bebas Neue', fontSize: '16px' }}>
            <option value="">— select season —</option>
            {seasons.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Step 1 — Team reflections */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', marginBottom: '4px' }}>
          <StepNum n="01" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '1.5px', marginBottom: '16px' }}>WHAT DID EACH TEAM TEACH ME?</div>
            <div style={{ display: 'grid', gridTemplateColumns: seasonTeams.length >= 2 ? '1fr 1fr' : '1fr', gap: '12px' }}>
              {seasonTeams.length === 0 && <p style={{ color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '14px' }}>Select a season with teams set up</p>}
              {seasonTeams.map(t => (
                <div key={t.id} style={{ background: 'var(--surface)', borderRadius: '8px', padding: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '8px' }}>{t.team_label}</div>
                  <textarea value={teamReflections[t.id]?.text || ''} onChange={e => setTeamText(t.id, e.target.value)} placeholder={`What did ${t.team_label} teach you this season?`} style={{ background: 'transparent', border: 'none', color: 'var(--white)', width: '100%', minHeight: '80px', fontFamily: 'DM Sans', fontSize: '16px', lineHeight: 1.6, resize: 'vertical' }} />
                  <div style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'DM Mono', marginTop: '8px', marginBottom: '4px', textTransform: 'uppercase' }}>Season Rating</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1,2,3,4,5].map(v => (
                      <button key={v} onClick={() => setTeamRating(t.id, v)}
                        style={{ fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer', opacity: (teamReflections[t.id]?.rating || 0) >= v ? 1 : 0.3, padding: '2px', lineHeight: 1 }}>⭐</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 — Growth */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <StepNum n="02" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '1.5px', marginBottom: '16px' }}>MY BIGGEST GROWTH THIS SEASON</div>
            <FG label="What am I most proud of improving?"><textarea value={proud} onChange={e => setProud(e.target.value)} placeholder="Where were you in September vs now?" /></FG>
            <FG label="Hardest moment — what did I learn from it?"><textarea value={hard} onChange={e => setHard(e.target.value)} placeholder="A tough loss, a bad game, a moment of frustration..." /></FG>
            <FG label="New skill or quality I have now that I didn't at the start"><textarea value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Be specific — technical, tactical, or mental..." /></FG>
          </div>
        </div>
      </div>

      {/* Step 3 — Self assessment */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <StepNum n="03" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '1.5px', marginBottom: '16px' }}>HONEST SELF-ASSESSMENT</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {SEASON_DIMS.map(d => (
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
          </div>
        </div>
      </div>

      {/* Step 4 — Gap */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <StepNum n="04" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '1.5px', marginBottom: '16px' }}>THE GAP — WHERE I NEED TO GROW</div>
            <FG label="Biggest gap between where I am and the player I want to become"><textarea value={gap} onChange={e => setGap(e.target.value)} placeholder="Think honestly. What do you see when you watch the professionals you admire?" /></FG>
            <FG label="What my coaches told me most often this season"><textarea value={coachTheme} onChange={e => setCoachTheme(e.target.value)} placeholder="What kept coming up?" /></FG>
          </div>
        </div>
      </div>

      {/* Step 5 — Letter */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <StepNum n="05" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '1.5px', marginBottom: '8px' }}>LETTER TO MYSELF — TO READ IN SEPTEMBER</div>
            <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '14px' }}>Write to yourself as if you&apos;ll open this on the first day back at training.</p>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '6px', left: '14px', fontSize: '56px', fontFamily: 'Bebas Neue', color: 'var(--border)', lineHeight: 1 }}>&ldquo;</span>
              <textarea value={letter} onChange={e => setLetter(e.target.value)} placeholder={'Dear me,\n\nThis season I learned...\n\nGoing into next season, I want to...'} style={{ background: 'transparent', border: 'none', paddingTop: '44px', fontFamily: 'DM Sans', fontSize: '17px', lineHeight: 1.8, color: 'var(--white)', width: '100%', minHeight: '180px', resize: 'vertical' }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)' }}>🔒 Sealed until September</div>
          </div>
        </div>
      </div>

      {/* AI Feedback */}
      {(aiText || aiLoading) && (
        <div style={{ background: 'rgba(232,255,71,0.05)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: '10px', padding: '16px 18px', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>⚡ Season Review — Coach AI Reflection</div>
          {aiLoading && !aiText
            ? <div style={{ display: 'flex', gap: '4px' }}><span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" /></div>
            : <p style={{ fontSize: '17px', lineHeight: 1.7 }}>{aiText}</p>}
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        style={{ width: '100%', padding: '16px', background: saving ? 'var(--border)' : 'linear-gradient(135deg,#ffb347,#e8ff47)', border: 'none', borderRadius: '10px', color: 'var(--surface)', fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '3px', cursor: saving ? 'not-allowed' : 'pointer', marginBottom: '24px' }}>
        {saving ? 'Saving...' : 'Save My Season Review'}
      </button>

      {toast && <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'var(--surface)', padding: '14px 24px', borderRadius: '10px', fontFamily: 'Bebas Neue', fontSize: '16px', letterSpacing: '1.5px', zIndex: 300 }}>{toast}</div>}
    </div>
  )
}
