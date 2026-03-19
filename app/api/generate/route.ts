import { NextRequest, NextResponse } from 'next/server'
import { generateIcebreakers } from '@/lib/claude'
import {
  buildLinkedInMessage,
  buildEmail1,
  buildEmail2,
  buildEmail3,
  buildEmail4,
  countWords,
  EMAIL_CONFIGS,
} from '@/lib/templates'
import type { GeneratedMessages, GeneratePayload } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: GeneratePayload = await req.json()

    const { prospectName, contextNotes, scrapeResult, notepadContent } = body

    const claude = await generateIcebreakers({
      prospectName,
      websiteContent: scrapeResult.websiteContent,
      linkedinContent: scrapeResult.linkedinContent,
      contextNotes,
      notepadContent,
    })

    const name = claude.prospect_first_name || prospectName || 'there'
    const company = claude.company_name || 'your agency'

    const linkedinFull = buildLinkedInMessage(name, claude.linkedin_icebreaker)

    const emailBuilders = [
      buildEmail1(name, claude.email_1_icebreaker),
      buildEmail2(name, claude.email_2_icebreaker),
      buildEmail3(name, claude.email_3_icebreaker, company),
      buildEmail4(name, claude.email_4_icebreaker, company),
    ]

    const subjects = [
      claude.email_1_subject,
      claude.email_2_subject,
      claude.email_3_subject,
      claude.email_4_subject,
    ]

    const icebreakers = [
      claude.email_1_icebreaker,
      claude.email_2_icebreaker,
      claude.email_3_icebreaker,
      claude.email_4_icebreaker,
    ]

    const result: GeneratedMessages = {
      prospectName: name,
      companyName: company,
      linkedin: {
        icebreaker: claude.linkedin_icebreaker,
        fullMessage: linkedinFull,
        wordCount: countWords(linkedinFull),
        charCount: linkedinFull.length,
      },
      emails: EMAIL_CONFIGS.map((cfg, i) => ({
        id: cfg.id,
        label: cfg.label,
        angle: cfg.angle,
        subject: subjects[i],
        icebreaker: icebreakers[i],
        body: emailBuilders[i],
        wordCount: countWords(emailBuilders[i]),
      })),
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Generate error:', err)
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
