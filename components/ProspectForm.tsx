'use client'

import { useState } from 'react'
import type { ProspectFormData, GeneratedMessages, GeneratePayload, ScrapeResult, NestiProduct } from '@/types'
import { getLikedExamples } from '@/lib/storage'

interface Props {
  onGenerate: (messages: GeneratedMessages, payload: GeneratePayload) => void
  isGenerating: boolean
  setIsGenerating: (v: boolean) => void
}

const PRODUCTS: { id: NestiProduct; label: string; description: string }[] = [
  {
    id: 'voice',
    label: 'AI Voice',
    description: 'Overflow and out-of-hours call handling',
  },
  {
    id: 'whatsapp',
    label: 'AI WhatsApp',
    description: 'Instant inbound lead qualification',
  },
  {
    id: 'qr_boards',
    label: 'AI QR Boards',
    description: 'Interactive for sale and to let boards',
  },
]

export default function ProspectForm({ onGenerate, isGenerating, setIsGenerating }: Props) {
  const [form, setForm] = useState<ProspectFormData>({
    name: '',
    websiteUrl: '',
    linkedinUrl: '',
    linkedinText: '',
    contextNotes: '',
  })

  const [selectedProducts, setSelectedProducts] = useState<NestiProduct[]>(['voice'])

  const [scrapeStatus, setScrapeStatus] = useState<{
    website: 'idle' | 'ok' | 'error'
    linkedin: 'idle' | 'ok' | 'blocked' | 'error'
  }>({ website: 'idle', linkedin: 'idle' })

  const [showLinkedinPaste, setShowLinkedinPaste] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof ProspectFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleProduct(id: NestiProduct) {
    setSelectedProducts((prev) => {
      if (prev.includes(id)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) return prev
        return prev.filter((p) => p !== id)
      }
      return [...prev, id]
    })
  }

  function selectAll() {
    setSelectedProducts(['voice', 'whatsapp', 'qr_boards'])
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

      // Read notepad content from localStorage
      const notepadContent =
        typeof window !== 'undefined' ? localStorage.getItem('nesti-notepad') || '' : ''

      const likedExamples = getLikedExamples()

      const payload: GeneratePayload = {
        prospectName: form.name,
        contextNotes: form.contextNotes,
        scrapeResult: mergedScrape,
        notepadContent: notepadContent || undefined,
        websiteUrl: form.websiteUrl,
        linkedinUrl: form.linkedinUrl,
        likedExamples,
        selectedProducts,
      }

      // Step 2: Generate
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!genRes.ok) {
        const err = await genRes.json()
        throw new Error(err.error || 'Generation failed')
      }

      const messages: GeneratedMessages = await genRes.json()
      onGenerate(messages, payload)
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

  const isAllSelected = selectedProducts.length === 3

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Product selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass + ' mb-0'}>Product focus</label>
          <button
            type="button"
            onClick={selectAll}
            className={`text-xs transition-colors ${
              isAllSelected
                ? 'text-primary font-medium'
                : 'text-muted hover:text-primary'
            }`}
          >
            {isAllSelected ? 'Full suite selected' : 'Select all'}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {PRODUCTS.map((product) => {
            const active = selectedProducts.includes(product.id)
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product.id)}
                className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all ${
                  active
                    ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border bg-surface hover:border-border/60 hover:bg-surface'
                }`}
              >
                <div
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                    active ? 'border-primary bg-primary' : 'border-border bg-white'
                  }`}
                >
                  {active && (
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${active ? 'text-primary' : 'text-ntext'}`}>
                    {product.label}
                  </p>
                  <p className="text-xs text-muted leading-snug">{product.description}</p>
                </div>
              </button>
            )
          })}
        </div>
        {selectedProducts.length > 1 && (
          <p className="mt-2 text-xs text-muted">
            Multi-product selected — messages will pitch the full Nesti suite.
          </p>
        )}
      </div>

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
