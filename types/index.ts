export interface ProspectFormData {
  name: string
  websiteUrl: string
  linkedinUrl: string
  linkedinText: string
  contextNotes: string
}

export interface EmailMessage {
  id: 'email1' | 'email2' | 'email3' | 'email4'
  label: string
  angle: string
  subject: string
  icebreaker: string
  body: string
  wordCount: number
}

export interface GeneratedMessages {
  prospectName: string
  companyName: string
  linkedin: {
    icebreaker: string
    fullMessage: string
    wordCount: number
    charCount: number
  }
  emails: EmailMessage[]
}

export interface ClaudeGeneratedContent {
  prospect_first_name: string
  company_name: string
  linkedin_icebreaker: string
  email_1_subject: string
  email_1_icebreaker: string
  email_2_subject: string
  email_2_icebreaker: string
  email_3_subject: string
  email_3_icebreaker: string
  email_4_subject: string
  email_4_icebreaker: string
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
}

export type ProspectStatus = 'new' | 'contacted' | 'replied' | 'demo_booked' | 'not_interested'

export type MessageFeedback = 'liked' | 'disliked' | null

export interface ChannelTracker {
  linkedin: boolean
  email1: boolean
  email2: boolean
  email3: boolean
  email4: boolean
}

export interface MessageFeedbackMap {
  linkedin: MessageFeedback
  email1: MessageFeedback
  email2: MessageFeedback
  email3: MessageFeedback
  email4: MessageFeedback
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
