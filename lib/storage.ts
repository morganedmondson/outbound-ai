import type { ProspectRecord, GeneratedMessages, GeneratePayload, MessageFeedback } from '@/types'

const PROSPECTS_KEY = 'nesti-prospects'

export function getProspects(): ProspectRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PROSPECTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeProspects(prospects: ProspectRecord[]): void {
  localStorage.setItem(PROSPECTS_KEY, JSON.stringify(prospects))
}

export function saveProspect(prospect: ProspectRecord): void {
  const prospects = getProspects()
  const idx = prospects.findIndex((p) => p.id === prospect.id)
  if (idx >= 0) {
    prospects[idx] = prospect
  } else {
    prospects.unshift(prospect)
  }
  writeProspects(prospects)
}

export function updateProspect(id: string, updates: Partial<ProspectRecord>): void {
  const prospects = getProspects()
  const idx = prospects.findIndex((p) => p.id === id)
  if (idx >= 0) {
    prospects[idx] = { ...prospects[idx], ...updates, updatedAt: new Date().toISOString() }
    writeProspects(prospects)
  }
}

export function deleteProspect(id: string): void {
  writeProspects(getProspects().filter((p) => p.id !== id))
}

export function createProspectRecord(
  payload: GeneratePayload,
  messages: GeneratedMessages
): ProspectRecord {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: messages.prospectName,
    company: messages.companyName,
    websiteUrl: payload.websiteUrl || '',
    linkedinUrl: payload.linkedinUrl || '',
    contextNotes: payload.contextNotes || '',
    messages,
    lastPayload: payload,
    status: 'new',
    channels: { linkedin: false, email1: false, email2: false, email3: false, email4: false },
    feedback: { linkedin: null, email1: null, email2: null, email3: null, email4: null },
    notes: '',
  }
}

export function getLikedExamples(): string[] {
  const prospects = getProspects()
  const examples: string[] = []
  for (const p of prospects) {
    if (!p.messages) continue
    if (p.feedback.linkedin === 'liked') examples.push(p.messages.linkedin.fullMessage)
    for (const email of p.messages.emails) {
      const key = email.id as keyof typeof p.feedback
      if (p.feedback[key] === 'liked') examples.push(email.body)
    }
  }
  return examples.slice(0, 6)
}
