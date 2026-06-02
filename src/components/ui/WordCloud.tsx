'use client'

import React from 'react'

interface WordCloudProps {
  chips: string[]
  inputRef: React.MutableRefObject<HTMLTextAreaElement | HTMLInputElement | null>
  value: string
  onChange: (val: string) => void
  /** Separator inserted before the chip when cursor isn't at start. Default: ' ' */
  separator?: string
}

export function WordCloud({ chips, inputRef, value, onChange, separator = ' ' }: WordCloudProps) {
  function insertChip(chip: string) {
    const el = inputRef.current
    if (!el) {
      const trail = value && !value.endsWith(separator) ? separator : ''
      onChange(value + trail + chip)
      return
    }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const before = value.slice(0, start)
    const after = value.slice(end)
    const pre = before.length > 0 && !before.endsWith(separator) ? separator : ''
    const newVal = before + pre + chip + after
    onChange(newVal)
    requestAnimationFrame(() => {
      el.focus()
      const newPos = start + pre.length + chip.length
      el.setSelectionRange(newPos, newPos)
    })
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
      {chips.map(chip => (
        <button
          key={chip}
          type="button"
          onClick={() => insertChip(chip)}
          style={{
            fontSize: '12px', fontFamily: 'DM Mono', padding: '4px 11px',
            borderRadius: '20px', border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--muted)',
            cursor: 'pointer', lineHeight: 1.5, whiteSpace: 'nowrap',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)' }}
        >
          {chip}
        </button>
      ))}
    </div>
  )
}
