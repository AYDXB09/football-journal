'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'player' | 'parent' | 'coach'>('player')
  const [ageStatus, setAgeStatus] = useState<'adult' | 'minor' | ''>('')
  const [guardianName, setGuardianName] = useState('')
  const [guardianEmail, setGuardianEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isMinor = ageStatus === 'minor'

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // This Service is built around youth players, some well under 13 — a
    // flat "you must be 13+" gate would exclude the actual target users.
    // Instead: a Player account must say whether the player is under 18,
    // and if so, name a parent/guardian who's consenting on their behalf.
    // This isn't verified (no confirmation email loop to the guardian) —
    // it's an explicit record of what was asserted at signup, not a
    // hardened verified-consent flow. See docs/PRIVACY.md.
    if (role === 'player') {
      if (!ageStatus) {
        setError('Please confirm whether this player is under 18.')
        return
      }
      if (isMinor && (!guardianName.trim() || !guardianEmail.trim())) {
        setError("Please enter the parent or guardian's name and email.")
        return
      }
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          ...(role === 'player'
            ? {
                is_minor: isMinor,
                guardian_name: isMinor ? guardianName.trim() : null,
                guardian_email: isMinor ? guardianEmail.trim() : null,
              }
            : {}),
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--surface)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '48px', letterSpacing: '3px', color: 'var(--accent)', lineHeight: 1 }}>
            ⚽ Football Journal
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)', fontFamily: 'DM Mono', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '6px' }}>
            Start Your Journey
          </p>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px 24px' }}>
          <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '24px', letterSpacing: '2px', marginBottom: '20px' }}>
            Create Account
          </h2>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Zidane Al Rashid"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                I am a...
              </label>
              <select value={role} onChange={e => setRole(e.target.value as typeof role)}>
                <option value="player">Player</option>
                <option value="parent">Parent</option>
                <option value="coach">Coach</option>
              </select>
            </div>

            {role === 'player' && (
              <div
                className="flex flex-col gap-2"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}
              >
                <label style={{ fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Is this player under 18?
                </label>
                <select value={ageStatus} onChange={e => setAgeStatus(e.target.value as typeof ageStatus)} required>
                  <option value="" disabled>Select one...</option>
                  <option value="adult">No — 18 or older</option>
                  <option value="minor">Yes — under 18</option>
                </select>

                {isMinor && (
                  <>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                      A parent or guardian must consent to this account. If you&apos;re the player,
                      have a parent or guardian fill in the two fields below.
                    </p>
                    <label style={{ fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                      Parent/Guardian Name
                    </label>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={e => setGuardianName(e.target.value)}
                      placeholder="e.g. Fatima Al Rashid"
                      required
                    />
                    <label style={{ fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                      Parent/Guardian Email
                    </label>
                    <input
                      type="email"
                      value={guardianEmail}
                      onChange={e => setGuardianEmail(e.target.value)}
                      placeholder="parent@email.com"
                      required
                    />
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ fontSize: '13px', fontFamily: 'DM Mono', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                minLength={6}
                required
              />
            </div>

            {error && (
              <p style={{ fontSize: '14px', color: 'var(--danger)', fontFamily: 'DM Mono' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? 'var(--border)' : 'var(--accent)',
                border: 'none',
                borderRadius: '10px',
                color: 'var(--surface)',
                fontFamily: 'Bebas Neue',
                fontSize: '20px',
                letterSpacing: '3px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px',
              }}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '15px', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
