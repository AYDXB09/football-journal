'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { today, formatDate } from '@/lib/utils/format'

type Season = { id: string; label: string; is_active: boolean | null }

const CATEGORIES = [
  { title: 'Technical — Ball Control & Passing', color: '#5ac8fa', questions: ['I decide what to do with the ball before it reaches me', 'My passes go exactly where I want them to go', 'I control the ball quickly when it arrives under pressure', 'I use my weaker foot comfortably, not just my stronger one', 'I can play a 1-2 and use overlaps during a game'] },
  { title: 'Technical — Shooting & Dribbling', color: '#e8ff47', questions: ['I dribble past opponents successfully', 'My shots go on target when I shoot', 'I score or come close to scoring when I get chances', 'I use tricks or skills to beat a defender', 'I shoot with my weaker foot when I need to'] },
  { title: 'Tactical — In Possession', color: '#ff9f5a', questions: ['I find teammates to pass to in more than one direction', 'I run into spaces to receive the ball', 'I create goal-scoring chances for my team', 'I know when to hold the ball and when to release it quickly', 'I make the right decisions when the game is fast'] },
  { title: 'Tactical — Out of Possession', color: '#ff6b6b', questions: ['I win the ball back quickly when my team loses it', 'I press the opponent as soon as we lose the ball', 'I get into the right position to cover my teammates', 'I anticipate where the ball will go next', 'I stop opponents from dribbling past me'] },
  { title: 'Mental & Attitude', color: '#c084fc', questions: ['If I make a mistake, I quickly recover and move on', 'I stay focused and concentrated for the whole game', 'I try new things in games even if I might make a mistake', 'I listen to my coach and follow their feedback', 'I encourage my teammates, especially when things are hard', 'I stay calm and focused in important or difficult games'] },
  { title: 'Development Habits', color: '#34d399', questions: ['I practise with a ball on my own between sessions', 'I watch professional footballers and study how they play', 'I set targets for myself to improve specific skills', 'I think about how I can improve even when not playing', 'I accept critical feedback and try to use it to improve'] },
]
const FREQ = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']

export default function DiagnosticPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [seasonId, setSeasonId] = useState('')
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [saved, setSaved] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('seasons').select('id, label, is_active').eq('player_id', user.id).order('created_at', { ascending: false })
      const s = data || []
      setSeasons(s)
      const active = s.find(x => x.is_active)
      if (active) setSeasonId(active.id)
    })
  }, [supabase])

  function setAnswer(pillar: number, question: number, val: number) {
    setAnswers(prev => ({ ...prev, [`${pillar}_${question}`]: val }))
  }
  function getAnswer(pillar: number, question: number) { return answers[`${pillar}_${question}`] ?? null }

  function buildScores() {
    return CATEGORIES.reduce((acc, cat, i) => {
      const total = cat.questions.length
      let score = 0; let answered = 0
      cat.questions.forEach((_, j) => {
        const a = getAnswer(i, j)
        if (a !== null) { score += a; answered++ }
      })
      const max = total * 4
      acc[`pillar_${i}`] = { score, max, pct: max > 0 ? Math.round((score / max) * 100) : 0, answered, total }
      return acc
    }, {} as Record<string, { score: number; max: number; pct: number; answered: number; total: number }>)
  }

  async function handleSave() {
    if (!userId || !seasonId) { showToast('Select a season first'); return }
    const scores = buildScores()
    const unanswered = Object.values(scores).reduce((s, p) => s + (p.total - p.answered), 0)
    if (unanswered > 0 && !confirm(`${unanswered} question${unanswered > 1 ? 's' : ''} are unanswered. Save anyway?`)) return
    setSaving(true)
    const { error } = await supabase.from('diagnostics').insert({ player_id: userId, season_id: seasonId, date: today(), scores })
    if (error) { showToast('Error saving'); console.error(error) }
    else { showToast('Diagnostic saved ✓'); setSaved(true) }
    setSaving(false)
  }

  const totalAnswered = Object.values(answers).filter(v => v !== null).length
  const totalQuestions = CATEGORIES.reduce((s, c) => s + c.questions.length, 0)

  return (
    <div>
      {/* Intro */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px' }}>
        <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '12px' }}>
          Do this every <strong style={{ color: 'var(--white)' }}>4–6 weeks</strong>, thinking about your overall experiences across all recent matches. Be honest — this is YOUR data.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '13px', fontFamily: 'DM Mono', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Season</label>
            <select value={seasonId} onChange={e => setSeasonId(e.target.value)} style={{ minWidth: '160px' }}>
              <option value="">— select —</option>
              {seasons.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '18px', color: 'var(--accent)', letterSpacing: '1px' }}>
            {totalAnswered} / {totalQuestions} answered
          </div>
        </div>
      </div>

      {/* Categories */}
      {CATEGORIES.map((cat, i) => (
        <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '17px', letterSpacing: '2px', color: cat.color, marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
            {cat.title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cat.questions.map((q, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '16px', flex: 1, lineHeight: 1.45, minWidth: '200px' }}>{q}</div>
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  {FREQ.map((label, val) => {
                    const selected = getAnswer(i, j) === val
                    return (
                      <button key={val} onClick={() => setAnswer(i, j, val)}
                        title={label}
                        style={{ width: '46px', height: '46px', borderRadius: '8px', border: `1px solid ${selected ? cat.color : 'var(--border)'}`, background: selected ? cat.color : 'var(--surface)', color: selected ? 'var(--surface)' : 'var(--muted)', cursor: 'pointer', fontSize: '11px', fontFamily: 'DM Mono', lineHeight: 1.2, padding: '3px', transition: 'all 0.15s' }}>
                        {label.slice(0, 3)}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleSave} disabled={saving || saved} style={{ width: '100%', padding: '16px', background: saved ? '#34d399' : saving ? 'var(--border)' : 'var(--accent)', border: 'none', borderRadius: '10px', color: 'var(--surface)', fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '3px', cursor: saving || saved ? 'not-allowed' : 'pointer', marginBottom: '24px' }}>
        {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save My Diagnostic'}
      </button>

      {toast && <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'var(--surface)', padding: '14px 24px', borderRadius: '10px', fontFamily: 'Bebas Neue', fontSize: '16px', letterSpacing: '1.5px', zIndex: 300 }}>{toast}</div>}
    </div>
  )
}
