import * as cheerio from 'cheerio'

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function extractText(html: string): string {
  const $ = cheerio.load(html)
  $('script, style, nav, footer, header, [role="navigation"], .cookie-banner').remove()
  const text = $('body').text().replace(/\s+/g, ' ').trim()
  return text.slice(0, 4000)
}

export async function scrapeWebsite(websiteUrl: string): Promise<string | null> {
  if (!websiteUrl) return null

  const base = websiteUrl.replace(/\/$/, '')
  const pagePaths = ['', '/about', '/about-us', '/team', '/meet-the-team', '/our-team']

  const results: string[] = []

  await Promise.all(
    pagePaths.map(async (path) => {
      const url = base + path
      const html = await fetchPage(url)
      if (html) {
        const text = extractText(html)
        if (text.length > 100) results.push(text)
      }
    })
  )

  if (results.length === 0) return null

  // Deduplicate and join
  const combined = results.join('\n\n---\n\n')
  return combined.slice(0, 8000)
}

function isLinkedInBlocked(html: string): boolean {
  const lower = html.toLowerCase()
  if (lower.includes('authwall') || lower.includes('join-linkedin')) return true
  if (lower.includes('sign in') && lower.includes('linkedin') && html.length < 5000) return true
  if (lower.includes('you must be a linkedin member')) return true
  return false
}

export async function scrapeLinkedIn(
  linkedinUrl: string
): Promise<{ content: string | null; blocked: boolean }> {
  if (!linkedinUrl) return { content: null, blocked: false }

  // First try: regular browser UA
  let html = await fetchPage(linkedinUrl)
  if (html && !isLinkedInBlocked(html)) {
    const text = extractText(html)
    if (text.length > 200) return { content: text, blocked: false }
  }

  // Second try: Googlebot UA
  try {
    const res = await fetch(linkedinUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      html = await res.text()
      if (!isLinkedInBlocked(html)) {
        const text = extractText(html)
        if (text.length > 200) return { content: text, blocked: false }
      }
    }
  } catch {
    // ignore
  }

  return { content: null, blocked: true }
}
