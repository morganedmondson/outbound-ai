import { NextRequest, NextResponse } from 'next/server'
import { scrapeWebsite, scrapeLinkedIn } from '@/lib/scraper'
import type { ScrapeResult } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { websiteUrl, linkedinUrl } = await req.json()

    const [websiteResult, linkedinResult] = await Promise.allSettled([
      websiteUrl ? scrapeWebsite(websiteUrl) : Promise.resolve(null),
      linkedinUrl ? scrapeLinkedIn(linkedinUrl) : Promise.resolve({ content: null, blocked: false }),
    ])

    const websiteContent =
      websiteResult.status === 'fulfilled' ? websiteResult.value : null

    const linkedinData =
      linkedinResult.status === 'fulfilled'
        ? linkedinResult.value
        : { content: null, blocked: false }

    const result: ScrapeResult = {
      websiteContent,
      linkedinContent: linkedinData.content,
      linkedinBlocked: linkedinData.blocked,
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Scrape error:', err)
    return NextResponse.json({ error: 'Scrape failed' }, { status: 500 })
  }
}
