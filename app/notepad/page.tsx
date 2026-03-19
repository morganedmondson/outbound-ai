'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const STORAGE_KEY = 'nesti-notepad'

function NestiLogo() {
  return (
    <Link href="/" className="flex items-center no-underline">
      <img src="/nesti-logo.svg" alt="Nesti" className="h-7 w-auto" />
    </Link>
  )
}

function Nav() {
  const pathname = usePathname()
  const links = [
    { href: '/', label: 'Generate' },
    { href: '/notepad', label: 'Notepad' },
  ]
  return (
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
  )
}

export default function NotepadPage() {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setContent(stored)
  }, [])

  function handleChange(value: string) {
    setContent(value)
    setSaved(false)
    // Debounced auto-save
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, value)
      setSaved(true)
    }, 600)
  }

  function handleClear() {
    if (!confirm('Clear the notepad? This cannot be undone.')) return
    setContent('')
    localStorage.removeItem(STORAGE_KEY)
    setSaved(true)
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface shadow-soft flex-shrink-0">
        <div className="mx-auto max-w-screen-xl px-6 py-3.5 flex items-center">
          <NestiLogo />
          <Nav />
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-screen-xl w-full px-6 py-8 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-base font-semibold text-ntext mb-1">Notepad</h1>
            <p className="text-sm text-muted max-w-lg">
              Paste in copy you like, examples of good icebreakers, tone notes, anything. This gets sent to the AI as a style reference every time you generate messages.
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
            <span className={`text-xs ${saved ? 'text-muted' : 'text-warning'}`}>
              {saved ? 'Saved' : 'Saving…'}
            </span>
            <span className="text-xs text-muted">{wordCount} words</span>
            {content && (
              <button
                onClick={handleClear}
                className="text-xs text-error hover:underline underline-offset-2 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Paste examples of copy you like here. For example:\n\n"Congrats on the rebrand — the new branding looks sharp. I imagine the new website has been generating a lot more inbound enquiries."\n\n"Running a 12-branch operation across the North West must mean the phones are pretty relentless. Especially mid-week."\n\nAnything goes — subject lines, icebreakers, full emails, notes on what works and what doesn't.`}
            className="w-full h-full min-h-[500px] rounded-xl border border-border bg-surface px-5 py-4 text-sm text-ntext placeholder-muted shadow-soft resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed"
          />
        </div>
      </div>
    </div>
  )
}
