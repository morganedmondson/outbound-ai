import Anthropic from '@anthropic-ai/sdk'
import type { MessageTemplate } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are a specialist in writing personalised outbound sales icebreakers for the founder of Nesti, a UK AI startup for estate and letting agents.

Your ONLY job is to write a short, personalised icebreaker line for each message template provided. The icebreaker is a 1–2 sentence personalised hook that will be inserted into the message where [icebreaker] appears.

The greeting and the rest of the message are fixed — you write ONLY the icebreaker.

WHAT A GOOD ICEBREAKER LOOKS LIKE:
- "Running a 12-branch operation across the North West must mean the phones are pretty relentless, especially mid-week."
- "Congrats on the rebrand — the new branding looks sharp."
- "Winning Best Agent in Essex three years running is a serious track record."
- "Expanding from two branches to five in under two years is impressive growth."
- "Specialising in listed properties and rural estates is a niche that takes serious local knowledge to get right."

ICEBREAKER RULES (strict — these are absolute):
- 1–2 sentences maximum, ideally under 25 words
- DO NOT start with "Hi", "Hello", or any greeting
- DO NOT mention Nesti, AI, voice assistants, or any product
- DO NOT include "I'm the founder", "we build", or any company description
- DO NOT use: "I came across your profile", "Hope this finds you well", "I noticed that", "I'm reaching out because", "Just wanted to"
- DO reference something real and specific about this prospect — their agency name, locations, specialisms, team size, awards, recent news, or anything from their website or LinkedIn
- Each icebreaker should feel natural leading into THAT specific template's message body
- Sound like a founder who's done their homework, not a spray-and-pray campaign

PUNCTUATION RULES (no exceptions):
- NEVER use em dashes (—) or en dashes (–)
- NEVER use colons (:) or semicolons (;)
- Use a full stop or comma instead`

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err: unknown) {
      lastError = err
      const status = (err as { status?: number })?.status
      if ((status === 529 || status === 500) && i < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, i) // 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      throw err
    }
  }
  throw lastError
}

function sanitize(text: string): string {
  return text
    .replace(/[—–]/g, ' - ')
    .replace(/;/g, '.')
    .replace(/:/g, ' -')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

interface GenerateOptions {
  prospectName: string
  websiteContent: string | null
  linkedinContent: string | null
  contextNotes: string
  notepadContent?: string
  likedExamples?: string[]
  templates: MessageTemplate[]
}

export interface IcebreakersResult {
  prospectFirstName: string
  companyName: string
  icebreakers: Record<string, string>  // templateId → icebreaker text
}

export async function generateIcebreakers(opts: GenerateOptions): Promise<IcebreakersResult> {
  const { prospectName, websiteContent, linkedinContent, contextNotes, notepadContent, likedExamples, templates } = opts

  if (templates.length === 0) {
    throw new Error('No templates selected. Add at least one message template on the Templates page.')
  }

  // Build the template section for the prompt
  const templateSection = templates
    .map((t, i) => {
      const header = `TEMPLATE ${i + 1} — "${t.name}" (${t.channel}${t.subject ? `, subject: "${t.subject}"` : ''})`
      return `${header}\n---\n${t.body}\n---`
    })
    .join('\n\n')

  // Build the JSON schema keys dynamically
  const icebreakerKeys = templates.map((_, i) => `"icebreaker_${i + 1}": "string"`).join(',\n  ')

  const userMessage = `Generate personalised icebreakers for this prospect.

Prospect name: ${prospectName || 'Unknown'}

${websiteContent ? `WEBSITE CONTENT:\n${websiteContent}\n` : 'No website content available.\n'}
${linkedinContent ? `LINKEDIN CONTENT:\n${linkedinContent}\n` : 'No LinkedIn content available.\n'}
${contextNotes ? `EXTRA CONTEXT:\n${contextNotes}\n` : ''}
${notepadContent ? `COPY STYLE REFERENCE (match this tone):\n${notepadContent}\n` : ''}
${likedExamples && likedExamples.length > 0 ? `MESSAGES THAT WORKED WELL (match this personalisation level):\n\n${likedExamples.map((m, i) => `Example ${i + 1}:\n${m}`).join('\n\n---\n\n')}\n` : ''}

HERE ARE THE MESSAGE TEMPLATES. Write one icebreaker for each:

${templateSection}

Return ONLY valid JSON — no markdown fences, no extra text:
{
  "prospect_first_name": "string",
  "company_name": "string",
  ${icebreakerKeys}
}`

  const response = await withRetry(() =>
    client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })
  )

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    const types = response.content.map((b) => b.type).join(', ')
    throw new Error(`No text block in Claude response. Blocks: ${types || 'none'}. Stop reason: ${response.stop_reason}`)
  }

  const raw = textBlock.text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

  try {
    const parsed = JSON.parse(raw) as Record<string, string>
    const icebreakers: Record<string, string> = {}
    templates.forEach((t, i) => {
      const key = `icebreaker_${i + 1}`
      icebreakers[t.id] = sanitize(parsed[key] || '')
    })
    return {
      prospectFirstName: parsed.prospect_first_name || prospectName || 'there',
      companyName: parsed.company_name || 'your agency',
      icebreakers,
    }
  } catch {
    throw new Error(`Failed to parse Claude response: ${raw.slice(0, 200)}`)
  }
}
