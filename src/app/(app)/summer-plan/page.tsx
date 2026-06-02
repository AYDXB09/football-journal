'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Season = { id: string; label: string; is_active: boolean }
type SkillRow = { skill: string; freq: number }

function FG({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>{label}</label>{children}</div>
}

function SkillSection({ icon, title, desc, rows, onAdd, onRemove, onChange }: {
  icon: string; title: string; desc: string
  rows: SkillRow[]; onAdd: () => void
  onRemove: (i: number) => void
  onChange: (i: number, field: 'skill' | 'freq', val: string | number) => void
}) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 16px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '19px', letterSpacing: '1.5px' }}>{title}</div>
          <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '3px' }}>{desc}</div>
        </div>
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 64px auto auto', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <input value={row.skill} onChange={e => onChange(i, 'skill', e.target.value)} placeholder="Skill / activity" style={{ fontSize: '16px', padding: '11px 13px' }} />
          <input type="number" value={row.freq} onChange={e => onChange(i, 'freq', parseInt(e.target.value) || 1)} min="1" max="7" style={{ fontSize: '16px', padding: '11px 10px', textAlign: 'center' }} />
          <span style={{ fontSize: '14px', color: 'var(--muted)', fontFamily: 'DM Mono', whiteSpace: 'nowrap' }}>×/wk</span>
          <button onClick={() => onRemove(i)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px', padding: '4px 6px', minWidth: '36px', minHeight: '36px' }}>✕</button>
        </div>
      ))}
      <button onClick={onAdd} style={{ background: 'transparent', border: '1px dashed var(--border)', color: 'var(--muted)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontFamily: 'DM Mono', width: '100%', minHeight: '44px', textAlign: 'center', marginTop: '4px' }}>
        + Add {title.split(' ')[0].toLowerCase()}
      </button>
    </div>
  )
}

export default function SummerPlanPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [seasonId, setSeasonId] = useState('')
  const [techSkills, setTechSkills] = useState<SkillRow[]>([{ skill: '', freq: 3 }])
  const [physSkills, setPhysSkills] = useState<SkillRow[]>([{ skill: '', freq: 2 }])
  const [watchSkills, setWatchSkills] = useState<SkillRow[]>([{ skill: '', freq: 1 }])
  const [minSessions, setMinSessions] = useState('5')
  const [sessionLen, setSessionLen] = useState('30')
  const [bigGoal, setBigGoal] = useState('')
  const [accountable, setAccountable] = useState('')
  const [selfImage, setSelfImage] = useState('')
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [existing, setExisting] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const { data: s } = await supabase.from('seasons').select('id, label, is_active').eq('player_id', user.id).order('created_at', { ascending: false })
      setSeasons(s || [])
      const active = (s || []).find(x => x.is_active)
      if (active) { setSeasonId(active.id); loadPlan(user.id, active.id) }
    })
  }, [supabase])

  async function loadPlan(uid: string, sid: string) {
    const { data } = await supabase.from('summer_plans').select('*').eq('player_id', uid).eq('season_id', sid).single()
    if (data) {
      setExisting(true)
      setTechSkills((data.technical_skills as SkillRow[]) || [{ skill: '', freq: 3 }])
      setPhysSkills((data.physical_skills as SkillRow[]) || [{ skill: '', freq: 2 }])
      setWatchSkills((data.watch_skills as SkillRow[]) || [{ skill: '', freq: 1 }])
      setMinSessions(String(data.min_sessions_per_week || '5'))
      setSessionLen(String(data.session_length_minutes || '30'))
      setBigGoal(data.big_goal || '')
      setAccountable(data.accountability_partner || '')
      setSelfImage(data.september_self_image || '')
      setAiText(data.ai_feedback || '')
    }
  }

  function addRow(setter: React.Dispatch<React.SetStateAction<SkillRow[]>>, def: SkillRow) {
    setter(prev => [...prev, { ...def }])
  }
  function removeRow(setter: React.Dispatch<React.SetStateAction<SkillRow[]>>, i: number) {
    setter(prev => prev.filter((_, idx) => idx !== i))
  }
  function changeRow(setter: React.Dispatch<React.SetStateAction<SkillRow[]>>, i: number, field: 'skill' | 'freq', val: string | number) {
    setter(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  async function handleSave() {
    if (!userId || !seasonId) { showToast('Select a season first'); return }
    setSaving(true)
    setAiLoading(true)

    const payload = {
      player_id: userId, season_id: seasonId,
      technical_skills: techSkills, physical_skills: physSkills, watch_skills: watchSkills,
      min_sessions_per_week: parseInt(minSessions), session_length_minutes: parseInt(sessionLen),
      big_goal: bigGoal || null, accountability_partner: accountable || null, september_self_image: selfImage || null,
    }

    const upsertFn = existing
      ? supabase.from('summer_plans').update(payload).eq('player_id', userId).eq('season_id', seasonId)
      : supabase.from('summer_plans').insert(payload)

    const { error } = await upsertFn
    if (error) { showToast('Error saving'); console.error(error); setSaving(false); setAiLoading(false); return }

    setExisting(true)
    showToast('Summer plan saved ✓')

    try {
      const res = await fetch('/api/ai/summer-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technical_skills: techSkills, physical_skills: physSkills, watch_skills: watchSkills, big_goal: bigGoal, september_self_image: selfImage, min_sessions_per_week: minSessions }),
      })
      const data = await res.json()
      if (data.feedback) {
        setAiText(data.feedback)
        await supabase.from('summer_plans').update({ ai_feedback: data.feedback }).eq('player_id', userId).eq('season_id', seasonId)
      }
    } catch (e) { console.error('AI error', e) }

    setAiLoading(false)
    setSaving(false)
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg,rgba(90,200,250,0.08),rgba(52,211,153,0.04))', border: '1px solid rgba(90,200,250,0.25)', borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '32px' }}>☀️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '2px', color: 'var(--info)' }}>Summer Training Plan</div>
          <div style={{ fontSize: '15px', color: 'var(--muted)', marginTop: '3px' }}>The players who improve most in summer work with a plan.</div>
        </div>
        <select value={seasonId} onChange={e => { setSeasonId(e.target.value); if (userId) loadPlan(userId, e.target.value) }} style={{ background: 'var(--card-bg)', border: '1px solid var(--info)', color: 'var(--info)', borderRadius: '8px', padding: '8px 12px', fontFamily: 'Bebas Neue', fontSize: '16px' }}>
          <option value="">— season —</option>
          {seasons.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      <SkillSection icon="⚽" title="Technical Skills" desc="Specific skills to practise alone with a ball." rows={techSkills} onAdd={() => addRow(setTechSkills, { skill: '', freq: 3 })} onRemove={i => removeRow(setTechSkills, i)} onChange={(i, f, v) => changeRow(setTechSkills, i, f, v)} />
      <SkillSection icon="💪" title="Physical Development" desc="Speed, agility, coordination. Movement quality." rows={physSkills} onAdd={() => addRow(setPhysSkills, { skill: '', freq: 2 })} onRemove={i => removeRow(setPhysSkills, i)} onChange={(i, f, v) => changeRow(setPhysSkills, i, f, v)} />
      <SkillSection icon="📺" title="Watch & Study" desc="Pick a player or tactical theme to study each week." rows={watchSkills} onAdd={() => addRow(setWatchSkills, { skill: '', freq: 1 })} onRemove={i => removeRow(setWatchSkills, i)} onChange={(i, f, v) => changeRow(setWatchSkills, i, f, v)} />

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1.5px', marginBottom: '16px' }}>📅 My Weekly Commitment</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FG label="Min ball sessions / week">
            <select value={minSessions} onChange={e => setMinSessions(e.target.value)}>
              {['3','4','5','6','7'].map(v => <option key={v} value={v}>{v === '7' ? 'Every day' : v}</option>)}
            </select>
          </FG>
          <FG label="Minutes per session">
            <select value={sessionLen} onChange={e => setSessionLen(e.target.value)}>
              {['20','30','45','60'].map(v => <option key={v} value={v}>{v} mins</option>)}
            </select>
          </FG>
          <div style={{ gridColumn: '1/-1' }}>
            <FG label="🎯 Big Summer Goal">
              <textarea value={bigGoal} onChange={e => setBigGoal(e.target.value)} placeholder="The one thing you want to be able to do by September that you cannot do now" />
            </FG>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <FG label="Who will keep me accountable?">
              <input value={accountable} onChange={e => setAccountable(e.target.value)} placeholder="e.g. Dad checks in every Sunday" />
            </FG>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(232,255,71,0.3)', borderRadius: '12px', padding: '20px', marginBottom: '16px', background: 'linear-gradient(135deg,rgba(232,255,71,0.05),transparent)' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '1.5px', marginBottom: '16px' }}>🎽 September Target</div>
        <FG label="In September, I want my coaches and teammates to see me as...">
          <textarea value={selfImage} onChange={e => setSelfImage(e.target.value)} placeholder="Think about your attitude, your role, your technical level..." />
        </FG>
      </div>

      {(aiText || aiLoading) && (
        <div style={{ background: 'rgba(90,200,250,0.05)', border: '1px solid rgba(90,200,250,0.2)', borderRadius: '10px', padding: '16px 18px', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--info)', marginBottom: '10px' }}>⚡ Summer Plan — Coach AI Review</div>
          {aiLoading && !aiText
            ? <div style={{ display: 'flex', gap: '4px' }}><span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" /></div>
            : <p style={{ fontSize: '17px', lineHeight: 1.7 }}>{aiText}</p>}
        </div>
      )}

      <button onClick={handleSave} disabled={saving}
        style={{ width: '100%', padding: '16px', background: saving ? 'var(--border)' : 'linear-gradient(135deg,#5ac8fa,#34d399)', border: 'none', borderRadius: '10px', color: 'var(--surface)', fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '3px', cursor: saving ? 'not-allowed' : 'pointer', marginBottom: '24px' }}>
        {saving ? 'Saving...' : 'Save My Summer Plan'}
      </button>

      {toast && <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'var(--surface)', padding: '14px 24px', borderRadius: '10px', fontFamily: 'Bebas Neue', fontSize: '16px', letterSpacing: '1.5px', zIndex: 300 }}>{toast}</div>}
    </div>
  )
}
