import { NextRequest, NextResponse } from 'next/server'
import { generateIcebreakers } from '@/lib/claude'
import type { GeneratedMessages, GeneratedMessage, GeneratePayload } from '@/types'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export async function POST(req: NextRequest) {
  try {
    const body: GeneratePayload = await req.json()
    const { prospectName, contextNotes, scrapeResult, notepadContent, likedExamples, templates } = body

    if (!templates || templates.length === 0) {
      return NextResponse.json({ error: 'No templates provided. Add templates on the Templates page.' }, { status: 400 })
    }

    const result = await generateIcebreakers({
      prospectName,
      websiteContent: scrapeResult.websiteContent,
      linkedinContent: scrapeResult.linkedinContent,
      contextNotes,
      notepadContent,
      likedExamples,
      templates,
    })

    const messages: GeneratedMessage[] = templates.map((template) => {
      const icebreaker = result.icebreakers[template.id] || ''
      // Replace [icebreaker] placeholder, also handle [name] with prospect first name
      const fullMessage = template.body
        .replace('[icebreaker]', icebreaker)
        .replace('[name]', result.prospectFirstName)

      return {
        templateId: template.id,
        templateName: template.name,
        channel: template.channel,
        subject: template.subject,
        icebreaker,
        fullMessage,
        wordCount: countWords(fullMessage),
        charCount: fullMessage.length,
      }
    })

    const output: GeneratedMessages = {
      prospectName: result.prospectFirstName,
      companyName: result.companyName,
      messages,
    }

    return NextResponse.json(output)
  } catch (err) {
    console.error('Generate error:', err)
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
