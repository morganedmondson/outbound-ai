'use client'

import { useState } from 'react'
import type { GeneratedMessages, MessageFeedbackMap, MessageFeedback } from '@/types'

interface Props {
  messages: GeneratedMessages
  onRegenerate?: () => void
  isGenerating?: boolean
  feedback?: MessageFeedbackMap
  onFeedback?: (templateId: string, value: 'liked' | 'disliked') => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-ntext transition-colors"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

function FeedbackButtons({
  templateId,
  value,
  onChange,
}: {
  templateId: string
  value: MessageFeedback
  onChange: (templateId: string, v: 'liked' | 'disliked') => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(templateId, 'liked')}
        title="Good message"
        className={`rounded p-1 transition-colors ${value === 'liked' ? 'text-success bg-success/10' : 'text-muted hover:text-success'}`}
      >
        <svg className="h-4 w-4" fill={value === 'liked' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
        </svg>
      </button>
      <button
        onClick={() => onChange(templateId, 'disliked')}
        title="Needs work"
        className={`rounded p-1 transition-colors ${value === 'disliked' ? 'text-error bg-error/10' : 'text-muted hover:text-error'}`}
      >
        <svg className="h-4 w-4" fill={value === 'disliked' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384" />
        </svg>
      </button>
    </div>
  )
}

export default function MessageTabs({ messages, onRegenerate, isGenerating, feedback = {}, onFeedback }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)

  if (!messages.messages || messages.messages.length === 0) return null

  const activeMsg = messages.messages[activeIdx]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <p className="text-sm font-semibold text-ntext">{messages.prospectName}</p>
          {messages.companyName && messages.companyName !== 'your agency' && (
            <p className="text-xs text-muted">{messages.companyName}</p>
          )}
        </div>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-ntext transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            )}
            Regenerate
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-shrink-0 flex-wrap">
        {messages.messages.map((msg, i) => (
          <button
            key={msg.templateId}
            onClick={() => setActiveIdx(i)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              i === activeIdx
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-muted hover:text-ntext'
            }`}
          >
            {msg.templateName}
          </button>
        ))}
      </div>

      {/* Active message */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Message meta */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              activeMsg.channel === 'linkedin'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-surface border border-border text-muted'
            }`}>
              {activeMsg.channel === 'linkedin' ? 'LinkedIn' : 'Email'}
            </span>
            {activeMsg.subject && (
              <span className="text-xs text-muted">Subject: <span className="text-ntext font-medium">{activeMsg.subject}</span></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{activeMsg.wordCount}w · {activeMsg.charCount}c</span>
            {onFeedback && (
              <FeedbackButtons
                templateId={activeMsg.templateId}
                value={feedback[activeMsg.templateId] ?? null}
                onChange={onFeedback}
              />
            )}
            <CopyButton text={activeMsg.fullMessage} />
          </div>
        </div>

        {/* Icebreaker highlight */}
        {activeMsg.icebreaker && (
          <div className="mb-3 flex-shrink-0 rounded-lg bg-primary/5 border border-primary/15 px-3.5 py-2.5">
            <p className="text-xs text-primary/60 font-medium mb-1 uppercase tracking-wide">Personalised icebreaker</p>
            <p className="text-sm text-ntext">{activeMsg.icebreaker}</p>
          </div>
        )}

        {/* Full message */}
        <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-border bg-background px-5 py-4">
          <pre className="text-sm text-ntext whitespace-pre-wrap font-sans leading-relaxed">{activeMsg.fullMessage}</pre>
        </div>
      </div>
    </div>
  )
}
