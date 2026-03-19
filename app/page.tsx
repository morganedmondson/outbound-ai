'use client'

import { useState } from 'react'
import ProspectForm from '@/components/ProspectForm'
import MessageTabs from '@/components/MessageTabs'
import AppShell from '@/components/AppShell'
import { createProspectRecord, saveProspect, updateProspect, getLikedExamples } from '@/lib/storage'
import type { GeneratedMessages, GeneratePayload, MessageFeedbackMap } from '@/types'

export default function Home() {
  const [messages, setMessages] = useState<GeneratedMessages | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastPayload, setLastPayload] = useState<GeneratePayload | null>(null)
  const [regenError, setRegenError] = useState<string | null>(null)
  const [prospectId, setProspectId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<MessageFeedbackMap>({})

  function handleGenerate(msgs: GeneratedMessages, payload: GeneratePayload) {
    const record = createProspectRecord(payload, msgs)
    saveProspect(record)
    setProspectId(record.id)
    setMessages(msgs)
    setLastPayload(payload)
    setFeedback({})
    setRegenError(null)
  }

  function handleFeedback(templateId: string, value: 'liked' | 'disliked') {
    const next = { ...feedback, [templateId]: feedback[templateId] === value ? null : value }
    setFeedback(next)
    if (prospectId) {
      updateProspect(prospectId, { feedback: next })
    }
  }

  async function handleRegenerate() {
    if (!lastPayload) return
    setIsGenerating(true)
    setRegenError(null)
    try {
      // Refresh notepad content in case it changed since last generate
      const notepadContent =
        typeof window !== 'undefined' ? localStorage.getItem('nesti-notepad') || '' : ''

      const likedExamples = getLikedExamples()
      const payload: GeneratePayload = { ...lastPayload, notepadContent: notepadContent || undefined, likedExamples }

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
      setMessages(msgs)
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AppShell>
      {/* Main layout */}
      <div className="px-6 py-5 flex gap-6 flex-1 min-h-0">
        {/* Left panel */}
        <aside className="w-[400px] flex-shrink-0 overflow-y-auto">
          <div className="rounded-xl border border-border bg-surface shadow-soft p-6">
            <h1 className="text-base font-semibold text-ntext mb-1">New prospect</h1>
            <p className="text-sm text-muted mb-6">
              Add their details and we&rsquo;ll generate personalised messages across all five touchpoints.
            </p>
            <ProspectForm
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </div>
        </aside>

        {/* Right panel */}
        <main className="flex-1 min-w-0">
          {messages ? (
            <div className="rounded-xl border border-border bg-surface shadow-soft p-6 h-full overflow-hidden flex flex-col">
              {regenError && (
                <div className="mb-4 rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
                  {regenError}
                </div>
              )}
              <div className="flex-1 min-h-0">
                <MessageTabs
                  messages={messages}
                  onRegenerate={handleRegenerate}
                  isGenerating={isGenerating}
                  feedback={feedback}
                  onFeedback={handleFeedback}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border">
              <div className="text-center max-w-xs">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-ntext mb-1">No messages yet</p>
                <p className="text-sm text-muted">Fill in the prospect details and click Generate to create personalised outreach.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </AppShell>
  )
}
