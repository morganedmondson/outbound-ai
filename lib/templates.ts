export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ─── LinkedIn DM ──────────────────────────────────────────────────────────────

export function buildLinkedInMessage(firstName: string, icebreaker: string): string {
  return `Hi ${firstName}, thanks for connecting.

${icebreaker}

I'm the founder of Nesti. We build AI voice assistants for estate and letting agents that handle overflow and out-of-hours calls. Each one is fully trained on your agency's voice, your listings, and your local area, so it performs like one of your own negotiators picking up the phone.

Our customers are seeing 40% more viewing appointments and 140% more buyers and properties registered.

We work with agencies like Fine & Country, Persimmon Homes, Richard James, and Hunters, and Peter Rollings, former MD of Foxtons, recently invested and joined our board.

To save you sitting through a demo, here is a live AI number you can call right now and hear it for yourself: +44 7727 638641

Let me know what you think!`
}

// ─── Email 1: After Hours ─────────────────────────────────────────────────────

export function buildEmail1(firstName: string, icebreaker: string): string {
  return `Hi ${firstName},

${icebreaker}

40% of property enquiries come in outside office hours, and most of those calls go unanswered.

I'm the founder of Nesti. We build AI voice assistants for estate and letting agents that handle overflow and out-of-hours calls. Each one is trained on your agency's voice, your listings, and your local area, so it sounds like one of your own team picking up the phone.

Our customers are typically seeing 40% more viewing appointments and 140% more buyers and properties registered.

Worth a quick 15-minute call to see how it works?`
}

// ─── Email 2: Differentiation ─────────────────────────────────────────────────

export function buildEmail2(firstName: string, icebreaker: string): string {
  return `Hi ${firstName},

${icebreaker}

Most voice tools in property are generic, built for any industry and trained on nothing specific.

Nesti is different. Each assistant is trained on your agency's voice, your listings, and your local area, so it performs like one of your own negotiators picking up the phone. It qualifies buyers and tenants, books viewings, and handles the back-and-forth, so your team can focus on the work that actually needs a human.

Our customers are typically seeing 40% more viewing appointments and 140% more buyers and properties registered.

Happy to show you a 10-minute demo if you'd like to see it in action?`
}

// ─── Email 3: Cost ────────────────────────────────────────────────────────────

export function buildEmail3(firstName: string, icebreaker: string, companyName: string): string {
  return `Hi ${firstName},

${icebreaker}

The average cost of a missed call in property is around £1,200. Most agencies are missing dozens every month, evenings, weekends, and the busy periods when the team just can't get to the phone.

At Nesti, we build AI voice assistants for estate and letting agents that handle those calls. Each one is trained on your agency's voice, your listings, and your local area, so it sounds like one of the ${companyName} team picking up.

It typically pays for itself the first time it catches a valuation your team would have missed.

Worth a quick 15-minute call?`
}

// ─── Email 4: Credibility ─────────────────────────────────────────────────────

export function buildEmail4(firstName: string, icebreaker: string, companyName: string): string {
  return `Hi ${firstName},

${icebreaker}

Peter Rollings, former MD of Foxtons and one of the most respected names in UK residential property, is an investor and advisor at Nesti.

He came on board because he's seen first-hand how much revenue agents lose to missed calls and slow response times, and he wanted to be part of fixing it.

We build AI voice assistants for estate and letting agents that handle overflow and out-of-hours calls. Each one is trained on your agency's voice, your listings, and your local area, so it sounds like one of the ${companyName} team picking up.

Our customers are typically seeing 40% more viewing appointments and 140% more buyers and properties registered.

I'd love to show you a quick demo. Would 15 minutes this week work?`
}

// ─── Email config metadata ────────────────────────────────────────────────────

export const EMAIL_CONFIGS = [
  { id: 'email1' as const, label: 'Email 1', angle: 'After Hours' },
  { id: 'email2' as const, label: 'Email 2', angle: 'Differentiation' },
  { id: 'email3' as const, label: 'Email 3', angle: 'Cost' },
  { id: 'email4' as const, label: 'Email 4', angle: 'Credibility' },
]
