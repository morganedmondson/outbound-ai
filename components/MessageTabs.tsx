'use client'

import { useState } from 'react'
import type { GeneratedMessages } from '@/types'
import CopyButton from './CopyButton'

interface Props {
  messages: GeneratedMessages
  onRegenerate: () => void
  isGenerating: boolean
}

type TabId = 'linkedin' | 'email1' | 'email2' | 'email3' | 'email4'

export default function MessageTabs({ messages, onRegenerate, isGenerating }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('linkedin')

  const tabs = [
    { id: 'linkedin' as TabId, label: 'LinkedIn DM' },
    { id: 'email1' as TabId, label: 'Email 1' },
    { id: 'email2' as TabId, label: 'Email 2' },
    { id: 'email3' as TabId, label: 'Email 3' },
    { id: 'email4' as TabId, label: 'Email 4' },
  ]

  function WordBadge({ count, warn }: { count: number; warn?: number }) {
    const isWarn = warn && count > warn
    return (
      <span
        className={`inline-flex items-center rounded-xs px-2 py-0.5 text-xs font-medium ${
          isWarn ? 'bg-warning/10 text-warning' : 'bg-border text-muted'
        }`}
      >
        {count}w
      </span>
    )
  }

  function CharBadge({ count, warn }: { count: number; warn?: number }) {
    const isWarn = warn && count > warn
    return (
      <span
        className={`inline-flex items-center rounded-xs px-2 py-0.5 text-xs font-medium ${
          isWarn ? 'bg-warning/10 text-warning' : 'bg-border text-muted'
        }`}
      >
        {count}c
      </span>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-ntext">{messages.prospectName}</h2>
          <p className="text-sm text-muted">{messages.companyName}</p>
        </div>
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ntext shadow-soft hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Regenerate
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-ntext'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LinkedIn panel */}
      {activeTab === 'linkedin' && (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Icebreaker highlight */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
              Personalised hook
            </p>
            <p className="text-sm text-ntext leading-relaxed">{messages.linkedin.icebreaker}</p>
          </div>

          {/* Full message */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-ntext">Full message</span>
              <WordBadge count={messages.linkedin.wordCount} warn={180} />
              <CharBadge count={messages.linkedin.charCount} warn={300} />
            </div>
            <CopyButton text={messages.linkedin.fullMessage} />
          </div>

          <div className="flex-1 overflow-y-auto">
            <pre className="rounded-lg border border-border bg-background p-4 text-sm text-ntext leading-relaxed whitespace-pre-wrap font-sans">
              {messages.linkedin.fullMessage}
            </pre>
          </div>
        </div>
      )}

      {/* Email panels */}
      {messages.emails.map((email) => (
        activeTab === email.id && (
          <div key={email.id} className="flex flex-col gap-4 flex-1 min-h-0">
            {/* Angle badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {email.angle}
              </span>
            </div>

            {/* Subject line */}
            <div className="rounded-lg border border-border bg-surface px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
                  Subject line
                </p>
                <CopyButton text={email.subject} label="Copy subject" />
              </div>
              <p className="text-sm font-medium text-ntext">{email.subject}</p>
            </div>

            {/* Icebreaker highlight */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                Personalised hook
              </p>
              <p className="text-sm text-ntext leading-relaxed">{email.icebreaker}</p>
            </div>

            {/* Full email */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ntext">Full email</span>
                <WordBadge count={email.wordCount} warn={250} />
              </div>
              <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} label="Copy email" />
            </div>

            <div className="flex-1 overflow-y-auto">
              <pre className="rounded-lg border border-border bg-background p-4 text-sm text-ntext leading-relaxed whitespace-pre-wrap font-sans">
                {email.body}
              </pre>
            </div>
          </div>
        )
      ))}
    </div>
  )
}
