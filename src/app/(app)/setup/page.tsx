'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──
type Season = { id: string; label: string; start_date: string | null; end_date: string | null; is_active: boolean }
type Club = { id: string; name: string; logo_url: string | null; has_professional_pathway: boolean }
type Team = { id: string; team_label: string; age_group: string; club_id: string; season_id: string; kit_primary_colour: string | null; kit_secondary_colour: string | null; training_hours_per_week: number | null; league_level: string | null; clubs?: { name: string } | null; seasons?: { label: string } | null }
type Competition = { id: string; name: string; type: string | null; team_id: string; teams?: { team_label: string } | null }
type Teammate = { id: string; name: string; nickname: string | null; kit_number: number | null; positions: string[] | null; team_id: string; teams?: { team_label: string } | null }
type ModalType = 'season' | 'club' | 'team' | 'competition' | 'teammate' | null

// ── Shared sub-components (defined OUTSIDE SetupPage to prevent remount on re-render) ──
const smBtn: React.CSSProperties = { background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'DM Mono', fontSize: '12px', minHeight: '36px' }
const dangerBtn: React.CSSProperties = { ...smBtn, color: 'var(--danger)' }

function Row({ label, sub, onEdit, onDel }: { label: string; sub?: string; onEdit: () => void; onDel: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'DM Mono', marginTop: '2px' }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button style={smBtn} onClick={onEdit}>Edit</button>
        <button style={dangerBtn} onClick={onDel}>Delete</button>
      </div>
    </div>
  )
}

function FG({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '7px' }}>{label}</label>
      {children}
    </div>
  )
}

export default function SetupPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [teammates, setTeammates] = useState<Teammate[]>([])
  const [modal, setModal] = useState<ModalType>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async (uid: string) => {
    const [s, c, t, comp, mate] = await Promise.all([
      supabase.from('seasons').select('*').eq('player_id', uid).order('created_at', { ascending: false }),
      supabase.from('clubs').select('*').eq('player_id', uid).order('created_at', { ascending: false }),
      supabase.from('teams').select('*, clubs(name), seasons(label)').eq('player_id', uid).order('created_at', { ascending: false }),
      supabase.from('competitions').select('*, teams(team_label)').eq('player_id', uid).order('created_at', { ascending: false }),
      supabase.from('teammates').select('*, teams(team_label)').eq('player_id', uid).order('created_at', { ascending: false }),
    ])
    setSeasons(s.data || [])
    setClubs(c.data || [])
    setTeams(t.data as Team[] || [])
    setCompetitions(comp.data as Competition[] || [])
    setTeammates(mate.data as Teammate[] || [])
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); load(user.id) }
    })
  }, [supabase, load])

  function openModal(type: ModalType, prefill?: Record<string, string>, id?: string) {
    setModal(type); setForm(prefill || {}); setEditId(id || null)
  }
  function closeModal() { setModal(null); setForm({}); setEditId(null) }
  const f = (key: string) => form[key] || ''
  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    try {
      if (modal === 'season') {
        const p = { player_id: userId, label: f('label'), start_date: f('start_date') || null, end_date: f('end_date') || null, is_active: f('is_active') === 'true' }
        editId ? await supabase.from('seasons').update(p).eq('id', editId) : await supabase.from('seasons').insert(p)
        showToast('Season saved ✓')
      }
      if (modal === 'club') {
        const p = { player_id: userId, name: f('name'), website: f('website') || null, contact_email: f('contact_email') || null, has_professional_pathway: f('has_professional_pathway') === 'true' }
        editId ? await supabase.from('clubs').update(p).eq('id', editId) : await supabase.from('clubs').insert(p)
        showToast('Club saved ✓')
      }
      if (modal === 'team') {
        const p = { player_id: userId, club_id: f('club_id'), season_id: f('season_id'), age_group: f('age_group'), team_label: f('team_label'), kit_primary_colour: f('kit_primary_colour') || null, kit_secondary_colour: f('kit_secondary_colour') || null, training_hours_per_week: f('training_hours_per_week') ? parseFloat(f('training_hours_per_week')) : null, league_level: f('league_level') || null }
        editId ? await supabase.from('teams').update(p).eq('id', editId) : await supabase.from('teams').insert(p)
        showToast('Team saved ✓')
      }
      if (modal === 'competition') {
        const teamSeasonId = teams.find(t => t.id === f('team_id'))?.season_id || ''
        const p = { player_id: userId, team_id: f('team_id'), season_id: teamSeasonId, name: f('name'), type: f('type') || null, start_date: f('start_date') || null, end_date: f('end_date') || null }
        editId ? await supabase.from('competitions').update(p).eq('id', editId) : await supabase.from('competitions').insert(p)
        showToast('Competition saved ✓')
      }
      if (modal === 'teammate') {
        const positions = f('positions') ? f('positions').split(',').map(p => p.trim()).filter(Boolean) : []
        const teamSeasonId = teams.find(t => t.id === f('team_id'))?.season_id || ''
        const p = { player_id: userId, team_id: f('team_id'), season_id: teamSeasonId, name: f('name'), nickname: f('nickname') || null, kit_number: f('kit_number') ? parseInt(f('kit_number')) : null, positions: positions.length ? positions : null }
        editId ? await supabase.from('teammates').update(p).eq('id', editId) : await supabase.from('teammates').insert(p)
        showToast('Teammate saved ✓')
      }
      await load(userId)
      closeModal()
    } catch (e) { showToast('Error saving'); console.error(e) }
    setSaving(false)
  }

  async function handleDelete(table: string, id: string) {
    if (!confirm('Delete this item?')) return
    await supabase.from(table as 'seasons').delete().eq('id', id)
    if (userId) await load(userId)
    showToast('Deleted')
  }

  // ── Styles ──
  const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 16px', marginBottom: '12px' }
  const addBtn: React.CSSProperties = { background: 'var(--accent)', border: 'none', color: 'var(--surface)', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Bebas Neue', fontSize: '15px', letterSpacing: '1px', minHeight: '40px' }

  const empty = (msg: string) => <p style={{ color: 'var(--muted)', fontFamily: 'DM Mono', fontSize: '14px', textAlign: 'center', padding: '12px 0' }}>{msg}</p>
  const counter = (n: number) => <span style={{ fontSize: '13px', fontFamily: 'DM Mono', color: 'var(--muted)', padding: '3px 10px', border: '1px solid var(--border)', borderRadius: '20px' }}>{n}</span>
  const sectionTitle = (icon: string, label: string, count: number) => (
    <div style={{ fontFamily: 'Bebas Neue', fontSize: '18px', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      {icon} {label} {counter(count)}
    </div>
  )

  return (
    <div>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.08),rgba(232,255,71,0.04))', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '32px' }}>⚙️</span>
        <div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: '22px', letterSpacing: '2px', color: '#34d399' }}>Setup Your Season</div>
          <div style={{ fontSize: '15px', color: 'var(--muted)', marginTop: '3px' }}>Build in order: Season → Club → Team → Competition → Teammates</div>
        </div>
      </div>

      {/* Seasons */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          {sectionTitle('📅', 'Seasons', seasons.length)}
          <button style={addBtn} onClick={() => openModal('season')}>+ Add Season</button>
        </div>
        {seasons.length === 0 ? empty('No seasons yet') : seasons.map(s => (
          <Row key={s.id} label={s.label}
            sub={[s.start_date, s.end_date].filter(Boolean).join(' → ') + (s.is_active ? ' · ✓ ACTIVE' : '')}
            onEdit={() => openModal('season', { label: s.label, start_date: s.start_date || '', end_date: s.end_date || '', is_active: String(s.is_active) }, s.id)}
            onDel={() => handleDelete('seasons', s.id)} />
        ))}
      </div>

      <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '20px', margin: '4px 0' }}>↓</div>

      {/* Clubs */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          {sectionTitle('🏆', 'Clubs', clubs.length)}
          <button style={addBtn} onClick={() => openModal('club')}>+ Add Club</button>
        </div>
        {clubs.length === 0 ? empty('No clubs yet') : clubs.map(c => (
          <Row key={c.id} label={c.name} sub={c.has_professional_pathway ? 'Pro pathway ✓' : undefined}
            onEdit={() => openModal('club', { name: c.name, has_professional_pathway: String(c.has_professional_pathway) }, c.id)}
            onDel={() => handleDelete('clubs', c.id)} />
        ))}
      </div>

      <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '20px', margin: '4px 0' }}>↓</div>

      {/* Teams */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          {sectionTitle('⚽', 'Teams', teams.length)}
          <button style={addBtn} onClick={() => openModal('team')} disabled={clubs.length === 0 || seasons.length === 0}>+ Add Team</button>
        </div>
        {clubs.length === 0 || seasons.length === 0
          ? empty('Add a club and season first')
          : teams.length === 0 ? empty('No teams yet')
          : teams.map(t => (
            <Row key={t.id} label={t.team_label}
              sub={`${t.clubs?.name || ''} · ${t.seasons?.label || ''} · ${t.age_group}`}
              onEdit={() => openModal('team', { team_label: t.team_label, age_group: t.age_group, club_id: t.club_id, season_id: t.season_id, kit_primary_colour: t.kit_primary_colour || '#162a1f', kit_secondary_colour: t.kit_secondary_colour || '#e8ff47', training_hours_per_week: String(t.training_hours_per_week || ''), league_level: t.league_level || '' }, t.id)}
              onDel={() => handleDelete('teams', t.id)} />
          ))}
      </div>

      <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '20px', margin: '4px 0' }}>↓</div>

      {/* Competitions */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          {sectionTitle('🏅', 'Competitions', competitions.length)}
          <button style={addBtn} onClick={() => openModal('competition')} disabled={teams.length === 0}>+ Add Competition</button>
        </div>
        {teams.length === 0 ? empty('Add a team first')
          : competitions.length === 0 ? empty('No competitions yet')
          : competitions.map(c => (
            <Row key={c.id} label={c.name} sub={`${c.teams?.team_label || ''} · ${c.type || ''}`}
              onEdit={() => openModal('competition', { name: c.name, type: c.type || '', team_id: c.team_id }, c.id)}
              onDel={() => handleDelete('competitions', c.id)} />
          ))}
      </div>

      <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '20px', margin: '4px 0' }}>↓</div>

      {/* Teammates */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          {sectionTitle('👥', 'Teammates', teammates.length)}
          <button style={addBtn} onClick={() => openModal('teammate')} disabled={teams.length === 0}>+ Add Teammate</button>
        </div>
        {teams.length === 0 ? empty('Add a team first')
          : teammates.length === 0 ? empty('No teammates yet')
          : teammates.map(m => (
            <Row key={m.id} label={m.name}
              sub={`${m.teams?.team_label || ''} · Kit #${m.kit_number || '?'}${m.nickname ? ` · "${m.nickname}"` : ''}`}
              onEdit={() => openModal('teammate', { name: m.name, nickname: m.nickname || '', kit_number: String(m.kit_number || ''), positions: (m.positions || []).join(', '), team_id: m.team_id }, m.id)}
              onDel={() => handleDelete('teammates', m.id)} />
          ))}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px 24px', maxWidth: '520px', width: '100%', maxHeight: '88vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '24px', letterSpacing: '2px', color: 'var(--accent)', marginBottom: '4px' }}>
              {editId ? 'Edit' : 'Add'} {modal.charAt(0).toUpperCase() + modal.slice(1)}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'DM Mono', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fill in the details below</p>

            {modal === 'season' && <>
              <FG label="Season Label (e.g. 2024-25)"><input value={f('label')} onChange={e => set('label', e.target.value)} placeholder="2024-25" /></FG>
              <FG label="Start Date"><input type="date" value={f('start_date')} onChange={e => set('start_date', e.target.value)} /></FG>
              <FG label="End Date"><input type="date" value={f('end_date')} onChange={e => set('end_date', e.target.value)} /></FG>
              <FG label="Active Season?">
                <select value={f('is_active') || 'false'} onChange={e => set('is_active', e.target.value)}>
                  <option value="true">Yes — current season</option>
                  <option value="false">No</option>
                </select>
              </FG>
            </>}

            {modal === 'club' && <>
              <FG label="Club Name"><input value={f('name')} onChange={e => set('name', e.target.value)} placeholder="e.g. United FC" /></FG>
              <FG label="Website (optional)"><input value={f('website')} onChange={e => set('website', e.target.value)} placeholder="https://..." /></FG>
              <FG label="Contact Email (optional)"><input type="email" value={f('contact_email')} onChange={e => set('contact_email', e.target.value)} placeholder="coach@club.com" /></FG>
              <FG label="Professional Pathway?">
                <select value={f('has_professional_pathway') || 'false'} onChange={e => set('has_professional_pathway', e.target.value)}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </FG>
            </>}

            {modal === 'team' && <>
              <FG label="Club">
                <select value={f('club_id')} onChange={e => set('club_id', e.target.value)}>
                  <option value="">— select club —</option>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FG>
              <FG label="Season">
                <select value={f('season_id')} onChange={e => set('season_id', e.target.value)}>
                  <option value="">— select season —</option>
                  {seasons.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </FG>
              <FG label="Age Group (e.g. U9)"><input value={f('age_group')} onChange={e => set('age_group', e.target.value)} placeholder="U9" /></FG>
              <FG label="Team Label"><input value={f('team_label')} onChange={e => set('team_label', e.target.value)} placeholder="e.g. United FC U9" /></FG>
              <FG label="Training Hours / Week"><input type="number" value={f('training_hours_per_week')} onChange={e => set('training_hours_per_week', e.target.value)} placeholder="6" min="0" max="40" /></FG>
              <FG label="League Level"><input value={f('league_level')} onChange={e => set('league_level', e.target.value)} placeholder="e.g. UAE Pro Division" /></FG>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <FG label="Kit Primary"><input type="color" value={f('kit_primary_colour') || '#162a1f'} onChange={e => set('kit_primary_colour', e.target.value)} /></FG>
                <FG label="Kit Secondary"><input type="color" value={f('kit_secondary_colour') || '#e8ff47'} onChange={e => set('kit_secondary_colour', e.target.value)} /></FG>
              </div>
            </>}

            {modal === 'competition' && <>
              <FG label="Team">
                <select value={f('team_id')} onChange={e => set('team_id', e.target.value)}>
                  <option value="">— select team —</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.team_label}</option>)}
                </select>
              </FG>
              <FG label="Competition Name"><input value={f('name')} onChange={e => set('name', e.target.value)} placeholder="e.g. UAE Youth League 2024-25" /></FG>
              <FG label="Type">
                <select value={f('type')} onChange={e => set('type', e.target.value)}>
                  <option value="">— select —</option>
                  <option value="league">League</option>
                  <option value="cup">Cup</option>
                  <option value="tournament">Tournament</option>
                  <option value="friendly">Friendly</option>
                  <option value="trial">Trial</option>
                </select>
              </FG>
              <FG label="Start Date"><input type="date" value={f('start_date')} onChange={e => set('start_date', e.target.value)} /></FG>
              <FG label="End Date"><input type="date" value={f('end_date')} onChange={e => set('end_date', e.target.value)} /></FG>
            </>}

            {modal === 'teammate' && <>
              <FG label="Team">
                <select value={f('team_id')} onChange={e => set('team_id', e.target.value)}>
                  <option value="">— select team —</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.team_label}</option>)}
                </select>
              </FG>
              <FG label="Full Name"><input value={f('name')} onChange={e => set('name', e.target.value)} placeholder="e.g. Omar Al Farsi" /></FG>
              <FG label="Nickname (for @mentions)"><input value={f('nickname')} onChange={e => set('nickname', e.target.value)} placeholder="e.g. Omo" /></FG>
              <FG label="Kit Number"><input type="number" value={f('kit_number')} onChange={e => set('kit_number', e.target.value)} placeholder="7" min="1" max="99" /></FG>
              <FG label="Positions (comma separated)"><input value={f('positions')} onChange={e => set('positions', e.target.value)} placeholder="e.g. CB, CDM" /></FG>
            </>}

            <button onClick={handleSave} disabled={saving}
              style={{ width: '100%', padding: '14px', background: saving ? 'var(--border)' : 'var(--accent)', border: 'none', borderRadius: '10px', color: 'var(--surface)', fontFamily: 'Bebas Neue', fontSize: '20px', letterSpacing: '3px', cursor: saving ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'var(--surface)', padding: '14px 24px', borderRadius: '10px', fontFamily: 'Bebas Neue', fontSize: '16px', letterSpacing: '1.5px', zIndex: 300 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
