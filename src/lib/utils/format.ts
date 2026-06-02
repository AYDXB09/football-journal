export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '?'
  const dt = new Date(dateStr + 'T00:00:00')
  const day = String(dt.getDate()).padStart(2, '0')
  const mon = dt.toLocaleDateString('en-GB', { month: 'short' })
  const yr = dt.getFullYear()
  return `${day}-${mon}-${yr}`
}

export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 864e5).toISOString().split('T')[0]
}
