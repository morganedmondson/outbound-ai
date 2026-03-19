'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { getTemplates, saveTemplate, deleteTemplate } from '@/lib/storage'
import type { MessageTemplate } from '@/types'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<MessageTemplate | null>(null)
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    const t = getTemplates()
    setTemplates(t)
    if (t.length > 0) {
      setSelectedId(t[0].id)
      setEditing(t[0])
    }
  }, [])

  function selectTemplate(t: MessageTemplate) {
    setSelectedId(t.id)
    setEditing({ ...t })
    setSaved(true)
  }

  function handleFieldChange(field: keyof MessageTemplate, value: string) {
    if (!editing) return
    setEditing((prev) => prev ? { ...prev, [field]: value } : prev)
    setSaved(false)
  }

  function handleSave() {
    if (!editing) return
    const updated = { ...editing, updatedAt: new Date().toISOString() }
    saveTemplate(updated)
    setTemplates(getTemplates())
    setEditing(updated)
    setSaved(true)
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this template? This cannot be undone.')) return
    deleteTemplate(id)
    const remaining = getTemplates()
    setTemplates(remaining)
    if (remaining.length > 0) {
      setSelectedId(remaining[0].id)
      setEditing(remaining[0])
    } else {
      setSelectedId(null)
      setEditing(null)
    }
    setSaved(true)
  }

  function handleNew() {
    const newTemplate: MessageTemplate = {
      id: generateId(),
      name: 'New template',
      channel: 'email',
      subject: '',
      body: `Hi [name],\n\n[icebreaker]\n\n`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveTemplate(newTemplate)
    const updated = getTemplates()
    setTemplates(updated)
    setSelectedId(newTemplate.id)
    setEditing(newTemplate)
    setSaved(true)
  }

  const hasPlaceholder = editing?.body.includes('[icebreaker]')

  return (
    <AppShell>
      <div className="flex flex-1 min-h-0 gap-0">
        {/* Left: template list */}
        <div className="w-72 flex-shrink-0 border-r border-border flex flex-col">
          <div className="px-4 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-sm font-semibold text-ntext">Templates</h2>
              <p className="text-xs text-muted">{templates.length} saved</p>
            </div>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {templates.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted">No templates yet. Create one to get started.</p>
            )}
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t)}
                className={`w-full text-left px-4 py-3 transition-colors border-b border-border/50 last:border-0 ${
                  selectedId === t.id ? 'bg-primary/5' : 'hover:bg-background'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`inline-flex rounded-full px-1.5 py-0.5 text-xs font-medium ${
                    t.channel === 'linkedin' ? 'bg-blue-50 text-blue-600' : 'bg-surface border border-border text-muted'
                  }`}>
                    {t.channel === 'linkedin' ? 'LI' : 'EM'}
                  </span>
                  <span className={`text-sm font-medium truncate ${selectedId === t.id ? 'text-primary' : 'text-ntext'}`}>
                    {t.name}
                  </span>
                </div>
                <p className="text-xs text-muted truncate">{t.body.slice(0, 60).replace(/\n/g, ' ')}…</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: editor */}
        {editing ? (
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Editor header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <input
                  value={editing.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="text-base font-semibold text-ntext bg-transparent border-0 outline-none focus:ring-0 min-w-0 flex-1"
                  placeholder="Template name"
                />
                <span className={`text-xs flex-shrink-0 ${saved ? 'text-muted' : 'text-warning'}`}>
                  {saved ? 'Saved' : 'Unsaved'}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => handleDelete(editing.id)}
                  className="text-xs text-error hover:underline underline-offset-2 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              {/* Channel + subject */}
              <div className="flex gap-4">
                <div className="w-40 flex-shrink-0">
                  <label className="block text-xs font-medium text-muted mb-1.5">Channel</label>
                  <select
                    value={editing.channel}
                    onChange={(e) => handleFieldChange('channel', e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ntext focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="linkedin">LinkedIn DM</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                {editing.channel === 'email' && (
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-muted mb-1.5">Subject line</label>
                    <input
                      type="text"
                      value={editing.subject || ''}
                      onChange={(e) => handleFieldChange('subject', e.target.value)}
                      placeholder="e.g. Missing calls after hours?"
                      className="w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-ntext placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Placeholder notice */}
              {!hasPlaceholder && (
                <div className="rounded-lg bg-warning/8 border border-warning/20 px-4 py-3 text-sm text-warning">
                  Add <code className="font-mono bg-warning/10 px-1 rounded">[icebreaker]</code> somewhere in the body — that&apos;s where the personalised line will be inserted.
                </div>
              )}

              {hasPlaceholder && (
                <div className="rounded-lg bg-success/8 border border-success/20 px-3.5 py-2.5 text-xs text-success flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  [icebreaker] placeholder detected — Claude will fill this in for each prospect.
                </div>
              )}

              {/* Body */}
              <div className="flex-1 flex flex-col">
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Message body
                  <span className="ml-2 text-muted/60 font-normal">Use [icebreaker] and [name] as placeholders</span>
                </label>
                <textarea
                  value={editing.body}
                  onChange={(e) => handleFieldChange('body', e.target.value)}
                  className="flex-1 w-full min-h-[400px] rounded-xl border border-border bg-surface px-5 py-4 text-sm text-ntext placeholder-muted shadow-soft resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary leading-relaxed font-mono"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-xs">
              <p className="text-sm font-medium text-ntext mb-1">No template selected</p>
              <p className="text-sm text-muted mb-4">Create a new template to get started.</p>
              <button
                onClick={handleNew}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
              >
                Create template
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
