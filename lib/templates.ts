export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ─── LinkedIn DM ──────────────────────────────────────────────────────────────

export function buildLinkedInMessage(firstName: string, icebreaker: string): string {
  return `Hi ${firstName}, thanks for connecting.

${icebreaker}

I'm building Nesti — an AI voice agent built specifically for estate and letting agents. It answers calls 24/7, qualifies buyers and tenants, books viewings, and captures every enquiry — even at 11pm on a Sunday.

Peter Rollings (former CEO of Foxtons) is an investor and advisor, and we're already live with agencies across the UK.

Worth a quick 15-min call to see if it's a fit for ${firstName === firstName ? 'you' : firstName}? Happy to show you a live demo.`
}

// ─── Email 1: After Hours ─────────────────────────────────────────────────────

export function buildEmail1(firstName: string, icebreaker: string): string {
  return `Hi ${firstName},

${icebreaker}

40% of property enquiries happen outside office hours — and most agents miss them.

Nesti is an AI voice agent built specifically for estate and letting agents. It answers every call 24/7, qualifies buyers and tenants, books viewings, and makes sure no enquiry ever slips through the cracks.

No more missed calls. No more lost valuations. Just more instructions.

Would it be worth a quick 15-minute call to see how it works?`
}

// ─── Email 2: Differentiation ─────────────────────────────────────────────────

export function buildEmail2(firstName: string, icebreaker: string): string {
  return `Hi ${firstName},

${icebreaker}

Most AI tools used in property are generic — built for any industry, trained on nothing specific.

Nesti is different. It's trained specifically on how estate and letting agents work: how to qualify a buyer, handle a tenant enquiry, respond to a valuation request, and sound like a natural extension of your team — not a robot.

It handles calls 24/7, books viewings, and captures every lead — so your team can focus on the work that actually needs a human.

Happy to show you a 10-minute demo if you'd like to see it in action?`
}

// ─── Email 3: Cost ────────────────────────────────────────────────────────────

export function buildEmail3(firstName: string, icebreaker: string, companyName: string): string {
  return `Hi ${firstName},

${icebreaker}

The average cost of a missed business call in the property industry is £1,200.

Most agents are missing dozens every month — evenings, weekends, busy periods when the team just can't get to the phone.

Nesti is an AI voice agent that answers every call for ${companyName}, 24/7. It qualifies buyers and tenants, books viewings, and handles all the back-and-forth — so nothing falls through the cracks.

It pays for itself the first time it catches a valuation your team would have missed.

Worth a quick 15-minute call?`
}

// ─── Email 4: Credibility ─────────────────────────────────────────────────────

export function buildEmail4(firstName: string, icebreaker: string, companyName: string): string {
  return `Hi ${firstName},

${icebreaker}

Peter Rollings — former CEO of Foxtons and one of the most respected names in UK residential property — is an investor and advisor at Nesti.

He joined because he's seen first-hand how much revenue agents lose to missed calls, slow response times, and leads that go cold overnight.

Nesti is an AI voice agent built specifically for estate and letting agents. It answers every call 24/7, qualifies buyers and tenants, books viewings, and makes sure ${companyName} never misses an instruction.

I'd love to show you a quick demo — would 15 minutes this week work?`
}

// ─── Email config metadata ────────────────────────────────────────────────────

export const EMAIL_CONFIGS = [
  { id: 'email1' as const, label: 'Email 1', angle: 'After Hours' },
  { id: 'email2' as const, label: 'Email 2', angle: 'Differentiation' },
  { id: 'email3' as const, label: 'Email 3', angle: 'Cost' },
  { id: 'email4' as const, label: 'Email 4', angle: 'Credibility' },
]
