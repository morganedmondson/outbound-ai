import type { ProspectRecord, GeneratedMessages, GeneratePayload, MessageFeedback, MessageTemplate } from '@/types'

const PROSPECTS_KEY = 'nesti-prospects'
const TEMPLATES_KEY = 'nesti-message-templates'

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
    channels: {},
    feedback: {},
    notes: '',
  }
}

export function getLikedExamples(): string[] {
  const prospects = getProspects()
  const examples: string[] = []
  for (const p of prospects) {
    if (!p.messages) continue
    // New format: messages.messages[]
    if (p.messages.messages) {
      for (const msg of p.messages.messages) {
        const feedback = p.feedback?.[msg.templateId]
        if (feedback === 'liked') examples.push(msg.fullMessage)
      }
    }
  }
  return examples.slice(0, 6)
}

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'default-linkedin-1',
    name: 'LinkedIn DM',
    channel: 'linkedin',
    body: `Hi [name],

[icebreaker]

I'm the founder of Nesti, we are an AI company for estate and letting agents, focusing on helping agents never miss an enquiry or opportunity. We do this through two core products:

- AI-enabled call handling that is a significantly better and cheaper alternative to voicemails and traditional call centres like Moneypenny
- AI WhatsApp that can deal with incoming portal enquiries and qualify applicants over WhatsApp automatically

Here is a number you can try calling for yourself: +44 7727 638641

We're already working with businesses like Fine & Country, Persimmon Homes, Hunters, Richard James, and we have investors like Peter Rollings, former Foxtons MD, on board.

Would you potentially be interested in a 15-min demo at some point in the coming weeks?`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-email-1',
    name: 'Email — After Hours',
    channel: 'email',
    subject: 'Missing calls after hours?',
    body: `Hi [name],

[icebreaker]

40% of property enquiries come in outside office hours, and most of those calls go unanswered.

I'm the founder of Nesti. We build AI-enabled call handling for estate and letting agents — a significantly better and cheaper alternative to voicemails and traditional call centres like Moneypenny. Each assistant is trained on your agency's voice, your listings, and your local area.

Our customers are typically seeing 40% more viewing appointments and 140% more buyers and properties registered.

We're already working with Fine & Country, Persimmon Homes, Hunters, and Richard James, and Peter Rollings, former MD of Foxtons, is an investor and board advisor.

Worth a quick 15-minute call to see how it works?`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'default-email-2',
    name: 'Email — Credibility',
    channel: 'email',
    subject: 'A familiar name in property',
    body: `Hi [name],

[icebreaker]

Peter Rollings, former MD of Foxtons and one of the most respected names in UK residential property, is an investor and advisor at Nesti.

He came on board because he's seen first-hand how much revenue agents lose to missed calls and slow response times.

We build AI-enabled call handling and AI WhatsApp qualification for estate and letting agents. Our customers include Fine & Country, Persimmon Homes, Hunters, and Richard James, and they're typically seeing 40% more viewing appointments and 140% more buyers and properties registered.

I'd love to show you a quick demo. Would 15 minutes this week work?`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function getTemplates(): MessageTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES
  const stored = localStorage.getItem(TEMPLATES_KEY)
  if (!stored) {
    // Seed with defaults on first load
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(DEFAULT_TEMPLATES))
    return DEFAULT_TEMPLATES
  }
  try {
    return JSON.parse(stored) as MessageTemplate[]
  } catch {
    return DEFAULT_TEMPLATES
  }
}

export function saveTemplate(template: MessageTemplate): void {
  const templates = getTemplates()
  const existing = templates.findIndex((t) => t.id === template.id)
  if (existing >= 0) {
    templates[existing] = template
  } else {
    templates.push(template)
  }
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates().filter((t) => t.id !== id)
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
}

export function updateTemplate(id: string, updates: Partial<MessageTemplate>): void {
  const templates = getTemplates()
  const idx = templates.findIndex((t) => t.id === id)
  if (idx >= 0) {
    templates[idx] = { ...templates[idx], ...updates, updatedAt: new Date().toISOString() }
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
  }
}
