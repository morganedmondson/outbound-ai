'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const links = [
    { href: '/', label: 'Generate' },
    { href: '/prospects', label: 'Prospects' },
    { href: '/templates', label: 'Templates' },
    { href: '/notepad', label: 'Notepad' },
  ]
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-surface shadow-soft flex-shrink-0">
        <div className="px-6 py-3.5 flex items-center">
          <Link href="/" className="flex items-center no-underline">
            <img src="/nesti-logo.svg" alt="Nesti" className="h-7 w-auto" />
          </Link>
          <nav className="flex items-center gap-1 ml-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:text-ntext hover:bg-background'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </div>
  )
}
