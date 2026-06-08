'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/log-match', label: 'Log Match' },
  { href: '/log-training', label: 'Training' },
  { href: '/diagnostic', label: 'Diagnostic' },
  { href: '/matches', label: 'Matches' },
  { href: '/goals', label: 'Objectives' },
  { href: '/season-review', label: '⚡ Season', accent: '#ffb347' },
  { href: '/summer-plan', label: '☀️ Summer', accent: '#5ac8fa' },
  { href: '/journey', label: '🌟 Journey', accent: '#c084fc' },
]

export default function AppShell({ user, children }: { user: User | null; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [setupOpen, setSetupOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '960px', margin: '0 auto', padding: '0 16px 80px' }}>
      {/* Header */}
      <div style={{
        padding: '20px 0 16px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(32px,7vw,52px)', letterSpacing: '2px', lineHeight: 1, color: 'var(--accent)' }}>
            ⚽ My Football Journey
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'DM Mono', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>
            {user?.name || 'Player'} · Player View
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/setup"
            title="Setup"
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: pathname === '/setup' ? 'var(--accent)' : 'var(--muted)',
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              borderColor: pathname === '/setup' ? 'var(--accent)' : 'var(--border)',
            }}
          >
            ⚙️
          </Link>
          <button
            onClick={handleSignOut}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'DM Mono',
              fontSize: '13px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              minHeight: '44px',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '20px',
        background: 'var(--card-bg)',
        padding: '4px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                flex: '0 0 auto',
                padding: '11px 14px',
                background: isActive ? 'var(--accent)' : 'transparent',
                border: 'none',
                color: isActive ? 'var(--surface)' : (item.accent || 'var(--muted)'),
                borderRadius: '7px',
                fontFamily: 'DM Mono',
                fontSize: '13px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  )
}
