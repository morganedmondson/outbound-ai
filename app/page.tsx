'use client'

import { useState } from 'react'
import ProspectForm from '@/components/ProspectForm'
import MessageTabs from '@/components/MessageTabs'
import type { GeneratedMessages } from '@/types'

export default function Home() {
  const [messages, setMessages] = useState<GeneratedMessages | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface shadow-soft">
        <div className="mx-auto max-w-screen-xl px-6 py-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-ntext">Nesti</span>
            <span className="ml-2 text-sm text-muted">Outbound</span>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="mx-auto max-w-screen-xl px-6 py-8 flex gap-8 h-[calc(100vh-65px)]">
        {/* Left panel — form */}
        <aside className="w-[360px] flex-shrink-0 overflow-y-auto">
          <div className="rounded-xl border border-border bg-surface shadow-soft p-6">
            <h1 className="text-base font-semibold text-ntext mb-1">New prospect</h1>
            <p className="text-sm text-muted mb-6">
              Add their details and we&rsquo;ll generate personalised messages across all five touchpoints.
            </p>
            <ProspectForm
              onGenerate={setMessages}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </div>
        </aside>

        {/* Right panel — output */}
        <main className="flex-1 min-w-0">
          {messages ? (
            <div className="rounded-xl border border-border bg-surface shadow-soft p-6 h-full overflow-hidden">
              <MessageTabs
                messages={messages}
                onRegenerate={() => {
                  // Re-trigger form submit from parent — simpler to just clear
                  setMessages(null)
                }}
                isGenerating={isGenerating}
              />
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
    </div>
  )
}
