import { NextRequest, NextResponse } from 'next/server'
import { generateIcebreakers } from '@/lib/claude'
import {
  buildLinkedInMessage,
  buildEmail1,
  buildEmail2,
  buildEmail3,
  buildEmail4,
  getEmailConfigs,
  countWords,
} from '@/lib/templates'
import type { GeneratedMessages, GeneratePayload, NestiProduct } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: GeneratePayload = await req.json()

    const {
      prospectName,
      contextNotes,
      scrapeResult,
      notepadContent,
      likedExamples,
      selectedProducts = ['voice'] as NestiProduct[],
    } = body

    const claude = await generateIcebreakers({
      prospectName,
      websiteContent: scrapeResult.websiteContent,
      linkedinContent: scrapeResult.linkedinContent,
      contextNotes,
      notepadContent,
      likedExamples,
      selectedProducts,
    })

    const name = claude.prospect_first_name || prospectName || 'there'
    const company = claude.company_name || 'your agency'

    const emailConfigs = getEmailConfigs(selectedProducts)

    const linkedinFull = buildLinkedInMessage(name, claude.linkedin_icebreaker, selectedProducts)

    const emailBodies = [
      buildEmail1(name, claude.email_1_icebreaker, selectedProducts),
      buildEmail2(name, claude.email_2_icebreaker, selectedProducts),
      buildEmail3(name, claude.email_3_icebreaker, company, selectedProducts),
      buildEmail4(name, claude.email_4_icebreaker, company, selectedProducts),
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
      emails: emailConfigs.map((cfg, i) => ({
        id: cfg.id,
        label: cfg.label,
        angle: cfg.angle,
        subject: subjects[i],
        icebreaker: icebreakers[i],
        body: emailBodies[i],
        wordCount: countWords(emailBodies[i]),
      })),
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Generate error:', err)
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
