import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Football Journal',
  description: 'Your personal player development journal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
