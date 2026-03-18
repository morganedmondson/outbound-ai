import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nesti Outbound',
  description: 'Generate personalised outbound messages for estate agent prospects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-ntext antialiased">{children}</body>
    </html>
  )
}
