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
