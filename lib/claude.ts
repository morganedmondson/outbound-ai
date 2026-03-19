import Anthropic from '@anthropic-ai/sdk'
import type { ClaudeGeneratedContent, NestiProduct } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are writing outbound sales copy for the founder of Nesti, a UK startup.

Your ONLY job is to generate ONE short, personalised icebreaker line for each of five outreach messages (1 LinkedIn DM + 4 cold emails). The rest of each message is fixed copy that will be appended automatically. You also write subject lines for the four emails.

ABOUT NESTI — THREE PRODUCTS:

1. AI VOICE ASSISTANT
What it does: "We build AI voice assistants for estate and letting agents that handle overflow and out-of-hours calls."
How it works: "Each one is fully trained on your agency's voice, your listings, and your local area, so it performs like one of your own negotiators picking up the phone."
Key use case: Replaces call centres and answering services. Catches missed calls evenings, weekends, and busy periods.
The problem it solves: 40% of property enquiries come in outside office hours and go unanswered. The average cost of a missed call in property is around £1,200.
Results: "Our customers are seeing 40% more viewing appointments and 140% more buyers and properties registered."
Live demo number (use in LinkedIn DM for Voice only): +44 7727 638641

2. AI WHATSAPP ASSISTANT
What it does: Handles inbound enquiries via WhatsApp. Qualifies buyers and tenants automatically, 24/7.
How it works: Responds to every inbound WhatsApp enquiry within seconds. Qualifies leads against the agency's criteria, books viewings directly into the diary, and only escalates to the team when genuinely needed.
Key use case: Inbound lead qualification. The alternative to slow email follow-up or missed enquiries from portals.
The problem it solves: The average response time to a property enquiry in the UK is over 47 hours. By then, most leads have moved on.
Results: More leads converted, faster, with no extra load on the team.

3. AI QR BOARDS
What it does: Embeds AI voice technology into for sale and to let property boards via QR code.
How it works: In partnership with Agency Express. Buyers and tenants scan a QR code on the board and speak directly to a voice AI that knows the property, the area, and the agency. Any time, day or night.
Key use case: Turn every board into a 24/7 negotiator. Capture buyers driving past at 8pm on a Sunday.
The problem it solves: Most boards display a phone number that goes unanswered after 5pm. Interested buyers drive on and forget.
Partnership: Agency Express (supply boards to thousands of UK estate agents).

CREDIBILITY (relevant to all products):
"Peter Rollings, former MD of Foxtons, recently invested and joined our board."
Customers include: Fine & Country, Persimmon Homes, Richard James, and Hunters.

EXAMPLE OF GOOD COPY (study the tone, structure, and level of detail):

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
- Examples for Voice: "Missing calls after hours?", "Built for agents not everyone", "The cost of a missed call", "A familiar name in property"
- Examples for WhatsApp: "Still waiting 47 hours to respond?", "Qualify every lead instantly", "The leads slipping through the cracks", "A familiar name in property"
- Examples for QR Boards: "Your boards could do more", "Make every board work 24/7", "Interactive boards for estate agents", "A familiar name in property"`

// Strip em dashes, en dashes, colons, semicolons from generated copy
function sanitize(text: string): string {
  return text
    .replace(/[—–]/g, ' - ')
    .replace(/;/g, '.')
    .replace(/:/g, ' -')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function productLabel(p: NestiProduct): string {
  if (p === 'voice') return 'AI Voice Assistant'
  if (p === 'whatsapp') return 'AI WhatsApp Assistant'
  return 'AI QR Boards'
}

function getEmailAngles(products: NestiProduct[]): string[] {
  if (products.length === 1) {
    if (products[0] === 'voice') {
      return [
        'Email 1 angle: After Hours — 40% of enquiries come in outside office hours and most go unanswered',
        'Email 2 angle: Differentiation — Nesti is trained on your specific agency, not a generic off-the-shelf tool',
        'Email 3 angle: Cost — the average missed call in property costs around £1,200',
        'Email 4 angle: Credibility — Peter Rollings, Fine & Country, Persimmon, Hunters are already on board',
      ]
    }
    if (products[0] === 'whatsapp') {
      return [
        'Email 1 angle: Response Speed — the average response time to a property enquiry is over 47 hours',
        'Email 2 angle: Qualification Quality — generic chatbots are useless; Nesti qualifies leads properly',
        'Email 3 angle: Efficiency — teams waste hours chasing bad leads while good ones slip through',
        'Email 4 angle: Credibility — Peter Rollings, Fine & Country, Persimmon, Hunters are already on board',
      ]
    }
    if (products[0] === 'qr_boards') {
      return [
        'Email 1 angle: Interactive Boards — every board could be a 24/7 agent but currently does nothing after 5pm',
        'Email 2 angle: First Mover — agencies that adopt interactive boards first will stand out in their market',
        'Email 3 angle: Revenue — every board is a missed lead source right now',
        'Email 4 angle: Credibility — Agency Express partnership, Peter Rollings, Fine & Country etc.',
      ]
    }
  }
  // Suite
  return [
    'Email 1 angle: AI Voice — 40% of enquiries come in outside office hours and go unanswered',
    'Email 2 angle: AI WhatsApp — 47-hour average response time; leads go cold before agents get back to them',
    'Email 3 angle: AI QR Boards — for sale and to let boards currently do nothing after 5pm',
    'Email 4 angle: Full Suite Credibility — Peter Rollings, Fine & Country, Persimmon, Hunters, the whole Nesti platform',
  ]
}

interface GenerateOptions {
  prospectName: string
  websiteContent: string | null
  linkedinContent: string | null
  contextNotes: string
  notepadContent?: string
  likedExamples?: string[]
  selectedProducts?: NestiProduct[]
}

export async function generateIcebreakers(opts: GenerateOptions): Promise<ClaudeGeneratedContent> {
  const {
    prospectName,
    websiteContent,
    linkedinContent,
    contextNotes,
    notepadContent,
    likedExamples,
    selectedProducts = ['voice'],
  } = opts

  const isSuite = selectedProducts.length > 1
  const productNames = selectedProducts.map(productLabel).join(', ')
  const emailAngles = getEmailAngles(selectedProducts)

  const productContext = isSuite
    ? `PRODUCTS TO SELL: ${productNames} (position Nesti as a full AI platform for estate agents covering all three areas)`
    : `PRODUCT TO SELL: ${productNames} (focus all five messages on this single product)`

  const userMessage = `Generate personalised icebreakers for this prospect.

Prospect name: ${prospectName || 'Unknown'}

${websiteContent ? `WEBSITE CONTENT:\n${websiteContent}\n` : 'No website content available.\n'}
${linkedinContent ? `LINKEDIN CONTENT:\n${linkedinContent}\n` : 'No LinkedIn content available.\n'}
${contextNotes ? `EXTRA CONTEXT:\n${contextNotes}\n` : ''}
${productContext}

EMAIL ANGLES (write each icebreaker to lead naturally into its angle):
${emailAngles.join('\n')}

${notepadContent ? `COPY STYLE REFERENCE (examples of copy the sender likes — match this tone, style, and structure):\n${notepadContent}\n` : ''}
${likedExamples && likedExamples.length > 0 ? `MESSAGES THAT WORKED WELL (these were marked as liked — match their tone, structure, and personalisation level closely):\n\n${likedExamples.map((m, i) => `Example ${i + 1}:\n${m}`).join('\n\n---\n\n')}\n` : ''}

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
