'use client'

import { useState } from 'react'
import type { ProspectFormData, GeneratedMessages, ScrapeResult } from '@/types'

interface Props {
  onGenerate: (messages: GeneratedMessages) => void
  isGenerating: boolean
  setIsGenerating: (v: boolean) => void
}

export default function ProspectForm({ onGenerate, isGenerating, setIsGenerating }: Props) {
  const [form, setForm] = useState<ProspectFormData>({
    name: '',
    websiteUrl: '',
    linkedinUrl: '',
    linkedinText: '',
    contextNotes: '',
  })

  const [scrapeStatus, setScrapeStatus] = useState<{
    website: 'idle' | 'ok' | 'error'
    linkedin: 'idle' | 'ok' | 'blocked' | 'error'
  }>({ website: 'idle', linkedin: 'idle' })

  const [showLinkedinPaste, setShowLinkedinPaste] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof ProspectFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsGenerating(true)
    setScrapeStatus({ website: 'idle', linkedin: 'idle' })

    try {
      // Step 1: Scrape
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: form.websiteUrl,
          linkedinUrl: form.linkedinUrl,
        }),
      })

      const scrapeData: ScrapeResult = await scrapeRes.json()

      setScrapeStatus({
        website: scrapeData.websiteContent ? 'ok' : form.websiteUrl ? 'error' : 'idle',
        linkedin: scrapeData.linkedinBlocked
          ? 'blocked'
          : scrapeData.linkedinContent
          ? 'ok'
          : form.linkedinUrl
          ? 'error'
          : 'idle',
      })

      // If LinkedIn was blocked, show paste area and wait for user to paste
      if (scrapeData.linkedinBlocked && !form.linkedinText) {
        setShowLinkedinPaste(true)
        setIsGenerating(false)
        return
      }

      // Merge manual LinkedIn paste if provided
      const mergedScrape: ScrapeResult = {
        ...scrapeData,
        linkedinContent: form.linkedinText || scrapeData.linkedinContent,
      }

      // Step 2: Generate
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName: form.name,
          contextNotes: form.contextNotes,
          scrapeResult: mergedScrape,
        }),
      })

      if (!genRes.ok) {
        const err = await genRes.json()
        throw new Error(err.error || 'Generation failed')
      }

      const messages: GeneratedMessages = await genRes.json()
      onGenerate(messages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ntext placeholder-muted shadow-input transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'

  const labelClass = 'block text-sm font-medium text-ntext mb-1.5'

  function StatusDot({ status }: { status: 'idle' | 'ok' | 'error' | 'blocked' }) {
    if (status === 'idle') return null
    const colors = {
      ok: 'bg-success',
      error: 'bg-error',
      blocked: 'bg-warning',
    }
    const labels = { ok: 'Scraped', error: 'Failed', blocked: 'Blocked' }
    return (
      <span className="inline-flex items-center gap-1 ml-2 text-xs text-muted">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[status as 'ok' | 'error' | 'blocked']}`} />
        {labels[status as 'ok' | 'error' | 'blocked']}
      </span>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className={labelClass}>Contact name</label>
        <input
          type="text"
          placeholder="e.g. James Wilson"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Website */}
      <div>
        <label className={labelClass}>
          Agency website
          <StatusDot status={scrapeStatus.website} />
        </label>
        <input
          type="url"
          placeholder="https://example.co.uk"
          value={form.websiteUrl}
          onChange={(e) => set('websiteUrl', e.target.value)}
          className={inputClass}
        />
      </div>

      {/* LinkedIn URL */}
      <div>
        <label className={labelClass}>
          LinkedIn profile URL
          <StatusDot status={scrapeStatus.linkedin} />
        </label>
        <input
          type="url"
          placeholder="https://linkedin.com/in/..."
          value={form.linkedinUrl}
          onChange={(e) => set('linkedinUrl', e.target.value)}
          className={inputClass}
        />
        {scrapeStatus.linkedin === 'blocked' && (
          <p className="mt-1.5 text-xs text-warning">
            LinkedIn blocked scraping — paste profile text below.
          </p>
        )}
      </div>

      {/* LinkedIn paste — shown when blocked or manually toggled */}
      {(showLinkedinPaste || scrapeStatus.linkedin === 'blocked') && (
        <div>
          <label className={labelClass}>LinkedIn profile text (paste manually)</label>
          <p className="text-xs text-muted mb-2">
            Open their LinkedIn profile → Ctrl+A → Ctrl+C → paste here
          </p>
          <textarea
            rows={6}
            placeholder="Paste LinkedIn profile content here..."
            value={form.linkedinText}
            onChange={(e) => set('linkedinText', e.target.value)}
            className={inputClass + ' resize-y'}
          />
        </div>
      )}

      {!showLinkedinPaste && scrapeStatus.linkedin !== 'blocked' && (
        <button
          type="button"
          onClick={() => setShowLinkedinPaste(true)}
          className="text-xs text-muted hover:text-primary underline underline-offset-2 transition-colors"
        >
          Paste LinkedIn text manually instead
        </button>
      )}

      {/* Context notes */}
      <div>
        <label className={labelClass}>Context notes (optional)</label>
        <textarea
          rows={3}
          placeholder="e.g. Uses Moneypenny, won Best Agent 2024, 3 branches in Bolton"
          value={form.contextNotes}
          onChange={(e) => set('contextNotes', e.target.value)}
          className={inputClass + ' resize-y'}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isGenerating}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-elevated transition-all hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {isGenerating ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating…
          </span>
        ) : (
          'Generate messages'
        )}
      </button>
    </form>
  )
}
