import Anthropic from '@anthropic-ai/sdk'
import type { ClaudeGeneratedContent } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert outbound sales copywriter for Nesti — an AI voice agent built specifically for UK estate and letting agents.

Your ONLY job is to generate ONE short, personalised icebreaker line for each of five outreach messages (1 LinkedIn DM + 4 cold emails). The rest of each message is fixed copy that will be appended automatically. You also write subject lines for the four emails.

Nesti product summary:
- AI voice agent that answers calls 24/7, qualifies buyers and tenants, books viewings
- Built specifically for estate and letting agents (not generic AI)
- Peter Rollings (former CEO of Foxtons) is investor and advisor
- Used by agencies across the UK
- Key pain it solves: missed calls, after-hours enquiries, slow response time

The four email angles you must tailor each icebreaker to:
1. After Hours — 40% of enquiries happen outside office hours
2. Differentiation — Nesti is trained specifically for agents, not a generic AI tool
3. Cost — £1,200 average cost of a missed business call
4. Credibility — Peter Rollings (ex-Foxtons CEO) is an investor/advisor

ICEBREAKER RULES:
- Maximum 1–2 sentences, ideally under 25 words
- Must feel natural and conversational, not salesy
- Reference something SPECIFIC from their website, LinkedIn, or context notes
- Do NOT use: "I came across your profile", "Hope this finds you well", "I noticed that", "I'm reaching out because", "Just wanted to"
- DO use: specific agency details (awards, locations, specialisms, recent news), implied acknowledgement, hooks that make the email angle feel timely and relevant to THEIR business specifically
- Each icebreaker should set up the email angle naturally without being too on the nose
- Sound like it comes from a founder who's done their homework, not a spray-and-pray campaign

PUNCTUATION RULES (strict — no exceptions):
- NEVER use em dashes (—) or en dashes (–) anywhere in your output
- NEVER use colons (:) anywhere in your output
- NEVER use semicolons (;) anywhere in your output
- Use a full stop or a new sentence instead. Use a comma or "and" instead of a dash.
- This applies to ALL fields including subject lines and icebreakers

GOOD EXAMPLES:
- "Congrats on winning Best Agency in [Area] — expanding into lettings as well as sales must keep the team incredibly busy."
- "Your Mayfair portfolio is impressive — I imagine fielding enquiries from international buyers at all hours is something your team deals with regularly."
- "[Agency] has clearly built a strong reputation in [Area] over the years — the kind of brand that generates a lot of inbound, I'd imagine."

Return ONLY valid JSON with these exact keys — no markdown fences, no extra text:
{
  "prospect_first_name": "string",
  "company_name": "string",
  "linkedin_icebreaker": "string",
  "email_1_subject": "string",
  "email_1_icebreaker": "string",
  "email_2_subject": "string",
  "email_2_icebreaker": "string",
  "email_3_subject": "string",
  "email_3_icebreaker": "string",
  "email_4_subject": "string",
  "email_4_icebreaker": "string"
}

Subject line rules:
- Under 8 words
- No clickbait, no excessive punctuation
- Should feel like it came from a real person
- Relevant to the email angle
- Examples: "Missing calls after hours?", "AI built for agents, not just any business", "The cost of a missed call", "A familiar name in property tech"`

// Strip em dashes, en dashes, colons, semicolons from generated copy
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
}

export async function generateIcebreakers(opts: GenerateOptions): Promise<ClaudeGeneratedContent> {
  const { prospectName, websiteContent, linkedinContent, contextNotes, notepadContent } = opts

  const userMessage = `Generate personalised icebreakers for this prospect.

Prospect name: ${prospectName || 'Unknown'}

${websiteContent ? `WEBSITE CONTENT:\n${websiteContent}\n` : 'No website content available.\n'}
${linkedinContent ? `LINKEDIN CONTENT:\n${linkedinContent}\n` : 'No LinkedIn content available.\n'}
${contextNotes ? `EXTRA CONTEXT:\n${contextNotes}\n` : ''}
${notepadContent ? `COPY STYLE REFERENCE (examples of copy the sender likes — match this tone, style, and structure):\n${notepadContent}\n` : ''}

Use any specific details you can find (agency name, location, specialisms, awards, team size, recent news) to make each icebreaker feel genuinely personalised. If you don't have much to work with, make a plausible, professional inference based on what you do know. Remember: absolutely no em dashes, colons, or semicolons anywhere in your output.`

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  // Extract text block
  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Strip any accidental markdown fences
  const raw = textBlock.text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

  try {
    const parsed = JSON.parse(raw) as ClaudeGeneratedContent
    // Sanitize all generated text fields
    return {
      prospect_first_name: parsed.prospect_first_name,
      company_name: parsed.company_name,
      linkedin_icebreaker: sanitize(parsed.linkedin_icebreaker),
      email_1_subject: sanitize(parsed.email_1_subject),
      email_1_icebreaker: sanitize(parsed.email_1_icebreaker),
      email_2_subject: sanitize(parsed.email_2_subject),
      email_2_icebreaker: sanitize(parsed.email_2_icebreaker),
      email_3_subject: sanitize(parsed.email_3_subject),
      email_3_icebreaker: sanitize(parsed.email_3_icebreaker),
      email_4_subject: sanitize(parsed.email_4_subject),
      email_4_icebreaker: sanitize(parsed.email_4_icebreaker),
    }
  } catch {
    throw new Error(`Failed to parse Claude JSON response: ${raw.slice(0, 200)}`)
  }
}
