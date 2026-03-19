import type { NestiProduct } from '@/types'

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ─── Email config metadata ─────────────────────────────────────────────────────

export interface EmailConfig {
  id: 'email1' | 'email2' | 'email3' | 'email4'
  label: string
  angle: string
}

export function getEmailConfigs(products: NestiProduct[]): EmailConfig[] {
  if (products.length === 1) {
    if (products[0] === 'voice') {
      return [
        { id: 'email1', label: 'Email 1', angle: 'After Hours' },
        { id: 'email2', label: 'Email 2', angle: 'Differentiation' },
        { id: 'email3', label: 'Email 3', angle: 'Cost' },
        { id: 'email4', label: 'Email 4', angle: 'Credibility' },
      ]
    }
    if (products[0] === 'whatsapp') {
      return [
        { id: 'email1', label: 'Email 1', angle: 'Response Speed' },
        { id: 'email2', label: 'Email 2', angle: 'Qualification Quality' },
        { id: 'email3', label: 'Email 3', angle: 'Efficiency' },
        { id: 'email4', label: 'Email 4', angle: 'Credibility' },
      ]
    }
    if (products[0] === 'qr_boards') {
      return [
        { id: 'email1', label: 'Email 1', angle: 'Interactive Boards' },
        { id: 'email2', label: 'Email 2', angle: 'First Mover' },
        { id: 'email3', label: 'Email 3', angle: 'Revenue' },
        { id: 'email4', label: 'Email 4', angle: 'Credibility' },
      ]
    }
  }
  // Suite (2 or 3 products)
  return [
    { id: 'email1', label: 'Email 1', angle: 'AI Voice' },
    { id: 'email2', label: 'Email 2', angle: 'AI WhatsApp' },
    { id: 'email3', label: 'Email 3', angle: 'AI QR Boards' },
    { id: 'email4', label: 'Email 4', angle: 'Credibility' },
  ]
}

// ─── Backwards-compatible default (Voice only) ────────────────────────────────
export const EMAIL_CONFIGS = getEmailConfigs(['voice'])

// ─── LinkedIn DM ──────────────────────────────────────────────────────────────

export function buildLinkedInMessage(
  firstName: string,
  icebreaker: string,
  products: NestiProduct[] = ['voice'],
): string {
  const isSuite = products.length > 1

  if (isSuite) {
    return `Hi ${firstName}, thanks for connecting.

${icebreaker}

I'm the founder of Nesti. We build an AI platform for estate and letting agents covering missed calls, inbound WhatsApp enquiries, and interactive property boards. Each product is trained on your agency's voice, your listings, and your local area.

Our customers are seeing 40% more viewing appointments and 140% more buyers and properties registered.

We work with agencies like Fine & Country, Persimmon Homes, Richard James, and Hunters, and Peter Rollings, former MD of Foxtons, recently invested and joined our board.

To hear our AI in action, call this live number now: +44 7727 638641

Let me know what you think!`
  }

  if (products[0] === 'whatsapp') {
    return `Hi ${firstName}, thanks for connecting.

${icebreaker}

I'm the founder of Nesti. We build AI WhatsApp assistants for estate and letting agents that qualify inbound enquiries instantly, 24 hours a day. Every buyer and tenant gets a response within seconds, fully qualified, with viewings booked directly into your diary.

Our customers are seeing 40% more viewing appointments and 140% more buyers and properties registered.

We work with agencies like Fine & Country, Persimmon Homes, Richard James, and Hunters, and Peter Rollings, former MD of Foxtons, recently invested and joined our board.

Let me know if you'd like to see how it works!`
  }

  if (products[0] === 'qr_boards') {
    return `Hi ${firstName}, thanks for connecting.

${icebreaker}

I'm the founder of Nesti. We've partnered with Agency Express to embed AI voice technology into property boards. Buyers and tenants scan a QR code on your for sale or to let board and speak directly to a voice AI that knows the property, the area, and your agency. Any time, day or night.

It turns every board into a 24/7 negotiator and captures buyers who would otherwise have driven past and forgotten.

Peter Rollings, former MD of Foxtons, recently invested and joined our board, and we're already working with agencies like Fine & Country, Persimmon Homes, Richard James, and Hunters.

Let me know if you'd like to see it in action!`
  }

  // Voice (default)
  return `Hi ${firstName}, thanks for connecting.

${icebreaker}

I'm the founder of Nesti. We build AI voice assistants for estate and letting agents that handle overflow and out-of-hours calls. Each one is fully trained on your agency's voice, your listings, and your local area, so it performs like one of your own negotiators picking up the phone.

Our customers are seeing 40% more viewing appointments and 140% more buyers and properties registered.

We work with agencies like Fine & Country, Persimmon Homes, Richard James, and Hunters, and Peter Rollings, former MD of Foxtons, recently invested and joined our board.

To save you sitting through a demo, here is a live AI number you can call right now and hear it for yourself: +44 7727 638641

Let me know what you think!`
}

// ─── Email 1 ──────────────────────────────────────────────────────────────────

export function buildEmail1(
  firstName: string,
  icebreaker: string,
  products: NestiProduct[] = ['voice'],
): string {
  const isSuite = products.length > 1

  if (isSuite) {
    return `Hi ${firstName},

${icebreaker}

40% of property enquiries come in outside office hours, and most of those calls go unanswered.

I'm the founder of Nesti. We build AI voice assistants for estate and letting agents that handle overflow and out-of-hours calls. Each one is trained on your agency's voice, your listings, and your local area, so it sounds like one of your own team picking up the phone.

We also cover inbound WhatsApp qualification and interactive AI-enabled property boards, so the whole picture of missed opportunity gets handled in one place.

Worth a quick 15-minute call to see how it works?`
  }

  if (products[0] === 'whatsapp') {
    return `Hi ${firstName},

${icebreaker}

The average response time to a property enquiry in the UK is over 47 hours. By then, most people have already spoken to three other agents.

I'm the founder of Nesti. We build AI WhatsApp assistants for estate and letting agents that respond to every inbound enquiry instantly, qualify them properly, and book viewings directly into your diary. 24/7, with no extra load on your team.

Worth a quick 15-minute call to see how it works?`
  }

  if (products[0] === 'qr_boards') {
    return `Hi ${firstName},

${icebreaker}

Most for sale and to let boards do one thing: display a phone number that goes unanswered after 5pm. Someone drives past on a Sunday evening, they're genuinely interested, they can't reach anyone, and the moment is gone.

I'm the founder of Nesti. We've partnered with Agency Express to embed AI voice technology into property boards. Buyers and tenants scan a QR code and speak directly to a voice AI that knows the property and your agency. 24/7, no missed opportunities.

Worth a quick 15-minute call?`
  }

  // Voice
  return `Hi ${firstName},

${icebreaker}

40% of property enquiries come in outside office hours, and most of those calls go unanswered.

I'm the founder of Nesti. We build AI voice assistants for estate and letting agents that handle overflow and out-of-hours calls. Each one is trained on your agency's voice, your listings, and your local area, so it sounds like one of your own team picking up the phone.

Our customers are typically seeing 40% more viewing appointments and 140% more buyers and properties registered.

Worth a quick 15-minute call to see how it works?`
}

// ─── Email 2 ──────────────────────────────────────────────────────────────────

export function buildEmail2(
  firstName: string,
  icebreaker: string,
  products: NestiProduct[] = ['voice'],
): string {
  const isSuite = products.length > 1

  if (isSuite) {
    return `Hi ${firstName},

${icebreaker}

The average response time to a property enquiry in the UK is over 47 hours. Most leads have already spoken to three other agents by the time you get back to them.

At Nesti, our AI WhatsApp assistant responds to every inbound enquiry within seconds, qualifies them properly, and books viewings directly into your diary. 24/7, with no extra load on your team.

It sits alongside our AI voice assistant for missed calls and our AI-enabled property boards, giving agencies a full AI layer across every touchpoint.

Happy to show you a 10-minute demo?`
  }

  if (products[0] === 'whatsapp') {
    return `Hi ${firstName},

${icebreaker}

Most chatbots in property ask a few scripted questions and dump the lead in a spreadsheet. Your team still ends up chasing people who were never serious.

Nesti is different. Our AI WhatsApp assistant is trained on your listings, your processes, and your local area. It qualifies buyers and tenants the way a good negotiator would, and only escalates to your team when the lead is genuinely worth their time.

Our customers are typically seeing 40% more viewing appointments and 140% more buyers and properties registered.

Happy to show you a 10-minute demo?`
  }

  if (products[0] === 'qr_boards') {
    return `Hi ${firstName},

${icebreaker}

Interactive property boards are coming. Agencies that adopt them first will stand out on every street they work on, and generate more buyer and tenant registrations from the same stock.

Nesti has partnered with Agency Express to make this happen now. Our AI voice technology sits behind a QR code on your boards. Scan it, speak to an AI that knows the property and the area, book a viewing on the spot.

Happy to show you what it looks like in practice?`
  }

  // Voice
  return `Hi ${firstName},

${icebreaker}

Most voice tools in property are generic, built for any industry and trained on nothing specific.

Nesti is different. Each assistant is trained on your agency's voice, your listings, and your local area, so it performs like one of your own negotiators picking up the phone. It qualifies buyers and tenants, books viewings, and handles the back-and-forth, so your team can focus on the work that actually needs a human.

Our customers are typically seeing 40% more viewing appointments and 140% more buyers and properties registered.

Happy to show you a 10-minute demo if you'd like to see it in action?`
}

// ─── Email 3 ──────────────────────────────────────────────────────────────────

export function buildEmail3(
  firstName: string,
  icebreaker: string,
  companyName: string,
  products: NestiProduct[] = ['voice'],
): string {
  const isSuite = products.length > 1

  if (isSuite) {
    return `Hi ${firstName},

${icebreaker}

Most for sale and to let boards display a phone number that goes unanswered after 5pm. Someone drives past on a Sunday, they're interested, they can't reach anyone, and the moment is gone.

We've partnered with Agency Express to change that. Our AI voice technology is embedded into property boards via a QR code. Scan it, speak to an AI that knows the property, the area, and your agency. 24/7.

Combined with our AI voice assistant for overflow calls and our AI WhatsApp qualification tool, it gives estate agents a full AI operating layer across every touchpoint.

Worth 15 minutes?`
  }

  if (products[0] === 'whatsapp') {
    return `Hi ${firstName},

${icebreaker}

Most agency teams spend hours every week chasing enquiries that go nowhere, and the best leads, the ones who are ready to move, sometimes slip through because the team couldn't get back to them fast enough.

At Nesti, we build AI WhatsApp assistants that handle all of that instantly. Every inbound enquiry gets a proper response within seconds, qualified against your criteria, with viewings booked directly into the ${companyName} diary.

It typically pays for itself in the first week.

Worth 15 minutes?`
  }

  if (products[0] === 'qr_boards') {
    return `Hi ${firstName},

${icebreaker}

Every for sale or to let board ${companyName} puts up is a potential lead source. Most of the time, that potential goes nowhere because there's no easy way for someone to engage outside office hours.

At Nesti, we've partnered with Agency Express to change that. Our AI voice technology is embedded directly into property boards via QR code. Buyers and tenants engage instantly, get qualified, and book viewings without anyone from your team needing to pick up the phone.

Worth 15 minutes to see the numbers?`
  }

  // Voice
  return `Hi ${firstName},

${icebreaker}

The average cost of a missed call in property is around £1,200. Most agencies are missing dozens every month, evenings, weekends, and the busy periods when the team just can't get to the phone.

At Nesti, we build AI voice assistants for estate and letting agents that handle those calls. Each one is trained on your agency's voice, your listings, and your local area, so it sounds like one of the ${companyName} team picking up.

It typically pays for itself the first time it catches a valuation your team would have missed.

Worth a quick 15-minute call?`
}

// ─── Email 4 ──────────────────────────────────────────────────────────────────

export function buildEmail4(
  firstName: string,
  icebreaker: string,
  companyName: string,
  products: NestiProduct[] = ['voice'],
): string {
  const isSuite = products.length > 1

  if (isSuite) {
    return `Hi ${firstName},

${icebreaker}

Peter Rollings, former MD of Foxtons and one of the most respected names in UK residential property, is an investor and advisor at Nesti.

He came on board because he's seen first-hand how much revenue agents lose to missed calls, slow responses, and boards that do nothing. Nesti covers all of it, with an AI voice assistant for overflow and out-of-hours calls, an AI WhatsApp assistant for instant inbound qualification, and AI-enabled property boards in partnership with Agency Express.

Our customers include Fine & Country, Persimmon Homes, Richard James, and Hunters, and they're typically seeing 40% more viewing appointments and 140% more buyers and properties registered.

I'd love to show you a quick demo. Would 15 minutes this week work?`
  }

  if (products[0] === 'whatsapp') {
    return `Hi ${firstName},

${icebreaker}

Peter Rollings, former MD of Foxtons and one of the most respected names in UK residential property, is an investor and advisor at Nesti.

He came on board because he's seen first-hand how many good leads agents lose simply because they couldn't respond fast enough. Our AI WhatsApp assistant fixes that, responding to every inbound enquiry within seconds, qualifying buyers and tenants, and booking viewings directly into your diary.

Our customers include Fine & Country, Persimmon Homes, Richard James, and Hunters, and they're typically seeing 40% more viewing appointments and 140% more buyers and properties registered.

I'd love to show you a quick demo. Would 15 minutes this week work?`
  }

  if (products[0] === 'qr_boards') {
    return `Hi ${firstName},

${icebreaker}

Agency Express supply boards to thousands of estate agents across the UK. We've partnered with them to bring AI voice technology directly into property boards for the first time.

Scan a QR code on any of the boards we've equipped, and you speak to an AI negotiator that knows the property, the local area, and the agency. It books viewings, answers questions, and qualifies interest around the clock.

Peter Rollings, former MD of Foxtons, is an investor and advisor at Nesti, and we're already working with agencies like Fine & Country, Persimmon Homes, Richard James, and Hunters.

I'd love to show you a quick demo. Would 15 minutes this week work?`
  }

  // Voice
  return `Hi ${firstName},

${icebreaker}

Peter Rollings, former MD of Foxtons and one of the most respected names in UK residential property, is an investor and advisor at Nesti.

He came on board because he's seen first-hand how much revenue agents lose to missed calls and slow response times, and he wanted to be part of fixing it.

We build AI voice assistants for estate and letting agents that handle overflow and out-of-hours calls. Each one is trained on your agency's voice, your listings, and your local area, so it sounds like one of the ${companyName} team picking up.

Our customers are typically seeing 40% more viewing appointments and 140% more buyers and properties registered.

I'd love to show you a quick demo. Would 15 minutes this week work?`
}
