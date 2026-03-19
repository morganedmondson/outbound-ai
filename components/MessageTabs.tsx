'use client'

import { useState } from 'react'
import type { GeneratedMessages, MessageFeedbackMap } from '@/types'
import CopyButton from './CopyButton'

interface Props {
  messages: GeneratedMessages
  onRegenerate: () => void
  isGenerating: boolean
  feedback?: MessageFeedbackMap
  onFeedback?: (tab: 'linkedin' | 'email1' | 'email2' | 'email3' | 'email4', value: 'liked' | 'disliked') => void
}

type TabId = 'linkedin' | 'email1' | 'email2' | 'email3' | 'email4'

export default function MessageTabs({ messages, onRegenerate, isGenerating, feedback, onFeedback }: Props) {
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

  function FeedbackButtons({ tabId }: { tabId: 'linkedin' | 'email1' | 'email2' | 'email3' | 'email4' }) {
    const current = feedback?.[tabId]
    if (!onFeedback) return null
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onFeedback(tabId, 'liked')}
          title="This worked well"
          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
            current === 'liked'
              ? 'bg-success/15 text-success'
              : 'bg-background text-muted hover:bg-success/10 hover:text-success'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill={current === 'liked' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
          </svg>
          Liked
        </button>
        <button
          onClick={() => onFeedback(tabId, 'disliked')}
          title="Not great"
          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
            current === 'disliked'
              ? 'bg-error/15 text-error'
              : 'bg-background text-muted hover:bg-error/10 hover:text-error'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill={current === 'disliked' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
          </svg>
          Disliked
        </button>
      </div>
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
            <div className="flex items-center gap-2">
              <FeedbackButtons tabId="linkedin" />
              <CopyButton text={messages.linkedin.fullMessage} />
            </div>
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
              <div className="flex items-center gap-2">
                <FeedbackButtons tabId={email.id} />
                <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} label="Copy email" />
              </div>
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
