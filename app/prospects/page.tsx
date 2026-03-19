'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import MessageTabs from '@/components/MessageTabs'
import CopyButton from '@/components/CopyButton'
import { getProspects, updateProspect, deleteProspect, getLikedExamples } from '@/lib/storage'
import type { ProspectRecord, ProspectStatus, MessageFeedbackMap, ChannelTracker, GeneratePayload, GeneratedMessages } from '@/types'

const STATUS_CONFIG: Record<ProspectStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-border text-muted' },
  contacted: { label: 'Contacted', color: 'bg-primary/10 text-primary' },
  replied: { label: 'Replied', color: 'bg-warning/15 text-warning' },
  demo_booked: { label: 'Demo booked', color: 'bg-success/15 text-success' },
  not_interested: { label: 'Not interested', color: 'bg-error/10 text-error' },
}

const CHANNEL_LABELS: (keyof ChannelTracker)[] = ['linkedin', 'email1', 'email2', 'email3', 'email4']
const CHANNEL_DISPLAY: Record<keyof ChannelTracker, string> = {
  linkedin: 'LI',
  email1: 'E1',
  email2: 'E2',
  email3: 'E3',
  email4: 'E4',
}

function isOverdue(prospect: ProspectRecord): boolean {
  if (prospect.status !== 'contacted') return false
  const days = (Date.now() - new Date(prospect.updatedAt).getTime()) / 86400000
  return days > 7
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<ProspectRecord[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ProspectStatus | 'all'>('all')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenError, setRegenError] = useState<string | null>(null)

  const load = useCallback(() => {
    setProspects(getProspects())
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selectedProspect = prospects.find((p) => p.id === selected) ?? null

  const filtered = prospects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.company.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: prospects.length,
    new: prospects.filter((p) => p.status === 'new').length,
    contacted: prospects.filter((p) => p.status === 'contacted').length,
    replied: prospects.filter((p) => p.status === 'replied').length,
    demo: prospects.filter((p) => p.status === 'demo_booked').length,
  }

  // Best angle insight
  const angleCounts: Record<string, number> = { email1: 0, email2: 0, email3: 0, email4: 0 }
  const angleNames: Record<string, string> = { email1: 'After Hours', email2: 'Differentiation', email3: 'Cost', email4: 'Credibility' }
  for (const p of prospects) {
    for (const k of ['email1', 'email2', 'email3', 'email4'] as const) {
      if (p.feedback[k] === 'liked') angleCounts[k]++
    }
  }
  const bestAngle = Object.entries(angleCounts).sort((a, b) => b[1] - a[1])[0]
  const hasBestAngle = bestAngle && bestAngle[1] > 0

  function mutate(id: string, updates: Partial<ProspectRecord>) {
    updateProspect(id, updates)
    load()
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this prospect and all their messages?')) return
    deleteProspect(id)
    if (selected === id) setSelected(null)
    load()
  }

  function handleFeedback(
    id: string,
    tab: keyof MessageFeedbackMap,
    value: 'liked' | 'disliked'
  ) {
    const p = prospects.find((x) => x.id === id)
    if (!p) return
    const next: MessageFeedbackMap = {
      ...p.feedback,
      [tab]: p.feedback[tab] === value ? null : value,
    }
    mutate(id, { feedback: next })
  }

  async function handleRegenerate(prospect: ProspectRecord) {
    if (!prospect.lastPayload) return
    setIsRegenerating(true)
    setRegenError(null)
    try {
      const notepadContent =
        typeof window !== 'undefined' ? localStorage.getItem('nesti-notepad') || '' : ''
      const likedExamples = getLikedExamples()
      const payload: GeneratePayload = {
        ...prospect.lastPayload,
        notepadContent: notepadContent || undefined,
        likedExamples,
      }
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Regeneration failed')
      }
      const msgs: GeneratedMessages = await res.json()
      mutate(prospect.id, { messages: msgs, lastPayload: payload })
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-screen-xl w-full px-6 py-6 flex flex-col flex-1 min-h-0">

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-5 flex-wrap">
          {[
            { label: 'Total', value: stats.total, onClick: () => setFilterStatus('all'), active: filterStatus === 'all' },
            { label: 'New', value: stats.new, onClick: () => setFilterStatus('new'), active: filterStatus === 'new' },
            { label: 'Contacted', value: stats.contacted, onClick: () => setFilterStatus('contacted'), active: filterStatus === 'contacted' },
            { label: 'Replied', value: stats.replied, onClick: () => setFilterStatus('replied'), active: filterStatus === 'replied' },
            { label: 'Demo booked', value: stats.demo, onClick: () => setFilterStatus('demo_booked'), active: filterStatus === 'demo_booked' },
          ].map((s) => (
            <button
              key={s.label}
              onClick={s.onClick}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                s.active ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-background'
              }`}
            >
              <span className={`text-lg font-semibold leading-none ${s.active ? 'text-primary' : 'text-ntext'}`}>
                {s.value}
              </span>
              <span className={`text-xs ${s.active ? 'text-primary' : 'text-muted'}`}>{s.label}</span>
            </button>
          ))}

          {hasBestAngle && (
            <div className="ml-auto flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
              <svg className="h-3.5 w-3.5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium text-success">
                Best angle: {angleNames[bestAngle[0]]} ({bestAngle[1]} liked)
              </span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface pl-9 pr-4 py-2.5 text-sm text-ntext placeholder-muted shadow-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Main content */}
        <div className="flex gap-5 flex-1 min-h-0">

          {/* Prospect list */}
          <div className="w-72 flex-shrink-0 overflow-y-auto space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted mb-3">
                  {prospects.length === 0 ? 'No prospects yet.' : 'No matches.'}
                </p>
                {prospects.length === 0 && (
                  <Link href="/" className="text-sm text-primary hover:underline">
                    Generate your first one
                  </Link>
                )}
              </div>
            ) : (
              filtered.map((p) => {
                const overdue = isOverdue(p)
                const isActive = selected === p.id
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(isActive ? null : p.id)}
                    className={`w-full text-left rounded-xl border p-3.5 transition-all ${
                      isActive
                        ? 'border-primary bg-primary/5 shadow-glow'
                        : 'border-border bg-surface hover:bg-background'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ntext truncate">{p.name}</p>
                        <p className="text-xs text-muted truncate">{p.company}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {overdue && (
                          <span title="No update in 7+ days" className="h-2 w-2 rounded-full bg-warning flex-shrink-0" />
                        )}
                        <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${STATUS_CONFIG[p.status].color}`}>
                          {STATUS_CONFIG[p.status].label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {CHANNEL_LABELS.map((ch) => (
                          <span
                            key={ch}
                            className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${
                              p.channels[ch]
                                ? 'bg-primary text-white'
                                : 'bg-border text-muted'
                            }`}
                          >
                            {CHANNEL_DISPLAY[ch]}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-muted">{formatDate(p.createdAt)}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Detail panel */}
          {selectedProspect ? (
            <div className="flex-1 min-w-0 rounded-xl border border-border bg-surface shadow-soft overflow-hidden flex flex-col">
              {/* Detail header */}
              <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4 flex-shrink-0">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-ntext">{selectedProspect.name}</h2>
                  <p className="text-sm text-muted">{selectedProspect.company}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Status dropdown */}
                  <select
                    value={selectedProspect.status}
                    onChange={(e) => mutate(selectedProspect.id, { status: e.target.value as ProspectStatus })}
                    className="text-xs rounded-lg border border-border bg-background px-2.5 py-1.5 text-ntext focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {(Object.keys(STATUS_CONFIG) as ProspectStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(selectedProspect.id)}
                    className="rounded-lg border border-border p-1.5 text-muted hover:text-error hover:border-error/30 transition-colors"
                    title="Delete prospect"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="px-6 py-4 space-y-5">
                  {/* Channel tracker */}
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Channels sent</p>
                    <div className="flex gap-2">
                      {CHANNEL_LABELS.map((ch) => (
                        <button
                          key={ch}
                          onClick={() =>
                            mutate(selectedProspect.id, {
                              channels: { ...selectedProspect.channels, [ch]: !selectedProspect.channels[ch] },
                              status: !selectedProspect.channels[ch] && selectedProspect.status === 'new'
                                ? 'contacted'
                                : selectedProspect.status,
                            })
                          }
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            selectedProspect.channels[ch]
                              ? 'bg-primary text-white'
                              : 'bg-background border border-border text-muted hover:text-ntext'
                          }`}
                        >
                          {selectedProspect.channels[ch] && (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                          {CHANNEL_DISPLAY[ch]}
                        </button>
                      ))}
                    </div>
                    {isOverdue(selectedProspect) && (
                      <p className="mt-2 text-xs text-warning flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        No update in 7+ days. Worth a follow-up?
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Notes</p>
                    <textarea
                      rows={3}
                      placeholder="Add notes about this prospect..."
                      value={selectedProspect.notes}
                      onChange={(e) => mutate(selectedProspect.id, { notes: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-ntext placeholder-muted shadow-input resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* Messages */}
                  {selectedProspect.messages ? (
                    <div>
                      {regenError && (
                        <div className="mb-3 rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
                          {regenError}
                        </div>
                      )}
                      <MessageTabs
                        messages={selectedProspect.messages}
                        onRegenerate={() => handleRegenerate(selectedProspect)}
                        isGenerating={isRegenerating}
                        feedback={selectedProspect.feedback}
                        onFeedback={(tab, value) => handleFeedback(selectedProspect.id, tab, value)}
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center">
                      <p className="text-sm text-muted">No messages generated yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted">Select a prospect to view their messages</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
