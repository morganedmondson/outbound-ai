import Anthropic from '@anthropic-ai/sdk'
import type { ClaudeGeneratedContent } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are writing outbound sales copy for the founder of Nesti, a UK startup.

Your ONLY job is to generate ONE short, personalised icebreaker line for each of five outreach messages (1 LinkedIn DM + 4 cold emails). The rest of each message is fixed copy that will be appended automatically. You also write subject lines for the four emails.

ABOUT NESTI (use these exact phrasings and facts — do not paraphrase or invent alternatives):

What Nesti does:
"We build AI voice assistants for estate and letting agents that handle overflow and out-of-hours calls."

How each assistant works:
"Each one is fully trained on your agency's voice, your listings, and your local area, so it performs like one of your own negotiators picking up the phone."

Results to reference:
"Our customers are seeing 40% more viewing appointments and 140% more buyers and properties registered."

Credibility:
"Peter Rollings, former MD of Foxtons, recently invested and joined our board."
Customers include: Fine & Country, Persimmon Homes, Richard James, and Hunters.

Live demo number (use in LinkedIn DM only):
"+44 7727 638641"

EXAMPLE OF GOOD COPY (this is a real message that got results — study the tone, structure, and level of detail):

"Hi Ollie, thanks for connecting. I noticed that you work with Kotini, which made me assume that you're a forward-thinking agent!

I'm the Founder of Nesti, we build AI voice assistants for estate and letting agents that handle overflow and out-of-hours calls. Each one is fully trained on your agency's voice, your listings, and your local area, so it performs like one of your own negotiators picking up the phone.

Our customers are seeing 40% more viewing appointments and 140% more buyers and properties registered.

We have customers like Fine & Country, Persimmon Homes, Richard James, Hunters, and Peter Rollings (former MD of Foxtons) recently invested and joined our board.

To save you sitting through a demo, here is a live AI number you can call right now and hear it for yourself: +44 7727 638641

Let me know what you think!"

TONE AND VOICE RULES:
- Sound like a confident founder who knows their product works, not someone pitching an idea
- Light and direct, never corporate or salesy
- Never say "I'm building" — say "I'm the founder of" or "we build"
- Never say "AI agent" or "AI voice agent" — always "AI voice assistant" or just "Nesti"
- No jargon, no buzzwords, no over-explaining
- Conversational but professional, like a smart person writing to a peer

THE FOUR EMAIL ANGLES (tailor each icebreaker to set up its angle naturally):
1. After Hours — 40% of enquiries come in outside office hours and most go unanswered
2. Differentiation — Nesti is trained on your specific agency, not a generic off-the-shelf tool
3. Cost — the average missed call in property costs around £1,200
4. Credibility — Peter Rollings, Fine & Country, Persimmon, Hunters are already on board

ICEBREAKER RULES:
- Maximum 1–2 sentences, ideally under 25 words
- Must feel natural, specific, and human
- Reference something real from their website, LinkedIn, or context notes
- Do NOT use: "I came across your profile", "Hope this finds you well", "I noticed that", "I'm reaching out because", "Just wanted to"
- DO use: specific details about their agency (awards, locations, size, specialisms, recent news), a natural observation that leads into the message's angle
- Sound like a founder who's done their homework, not a spray-and-pray campaign

PUNCTUATION RULES (strict, no exceptions):
- NEVER use em dashes (—) or en dashes (–)
- NEVER use colons (:)
- NEVER use semicolons (;)
- Use a full stop or comma instead. Write around them if needed.
- This applies to all fields including subject lines

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
- Examples: "Missing calls after hours?", "Built for agents not everyone", "The cost of a missed call", "A familiar name in property"`

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
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  // Extract text block (thinking blocks come first — skip them)
  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    const types = response.content.map((b) => b.type).join(', ')
    throw new Error(`No text block in Claude response. Blocks received: ${types || 'none'}. Stop reason: ${response.stop_reason}`)
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
