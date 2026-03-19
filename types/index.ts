export interface MessageTemplate {
  id: string
  name: string
  channel: 'linkedin' | 'email'
  subject?: string        // for email templates only
  body: string            // full message body — must contain [icebreaker] placeholder
  createdAt: string
  updatedAt: string
}

export interface GeneratedMessage {
  templateId: string
  templateName: string
  channel: 'linkedin' | 'email'
  subject?: string
  icebreaker: string
  fullMessage: string
  wordCount: number
  charCount: number
}

export interface GeneratedMessages {
  prospectName: string
  companyName: string
  messages: GeneratedMessage[]
}

export interface ScrapeResult {
  websiteContent: string | null
  linkedinContent: string | null
  linkedinBlocked: boolean
}

export interface GeneratePayload {
  prospectName: string
  contextNotes: string
  scrapeResult: ScrapeResult
  notepadContent?: string
  websiteUrl?: string
  linkedinUrl?: string
  likedExamples?: string[]
  templates: MessageTemplate[]
}

export type ProspectStatus = 'new' | 'contacted' | 'replied' | 'demo_booked' | 'not_interested'

export type MessageFeedback = 'liked' | 'disliked' | null

export type MessageFeedbackMap = Record<string, MessageFeedback>

export type ChannelTracker = Record<string, boolean>

export interface ProspectFormData {
  name: string
  websiteUrl: string
  linkedinUrl: string
  linkedinText: string
  contextNotes: string
}

export interface ProspectRecord {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  company: string
  websiteUrl: string
  linkedinUrl: string
  contextNotes: string
  messages: GeneratedMessages | null
  lastPayload: GeneratePayload | null
  status: ProspectStatus
  channels: ChannelTracker
  feedback: MessageFeedbackMap
  notes: string
}
