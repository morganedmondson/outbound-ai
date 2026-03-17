import streamlit as st
import streamlit.components.v1 as components
import anthropic
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import os
import re
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# System prompt (verbatim from spec)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are a copywriting assistant for Morgan, founder of Nesti (nesti.io). Your job is to write personalised cold outreach messages — LinkedIn DMs and cold emails — to estate and letting agents in the UK.

---

ABOUT NESTI:
Nesti builds AI voice assistants for estate and letting agents. Each assistant is fully trained on the agency's voice, their listings, and their local area. It handles overflow and out-of-hours calls perfectly, books viewings directly into the calendar, qualifies buyers and tenants, and speaks 16 languages. It goes live in an average of 2 days. Nesti offers Voice, Avatar, and WhatsApp solutions. It integrates with the CRMs estate agents already use — no data migration, no complicated setup.

Key proof points:
- 40% more viewing appointments
- 140% more buyers and properties registered
- Customers include Fine & Country, Richard James, Hunters, Persimmon Homes
- Peter Rollings (former MD of Foxtons) has invested and joined the board
- Live demo number: +44 7727 638641

Nesti's positioning: Not a call centre. Not a generic AI. An AI trained to sound exactly like your agency — your voice, your area, your listings. Available 24/7.

---

MORGAN'S WRITING STYLE — study these examples carefully and replicate the tone exactly:

Example LinkedIn DM (good):
"Hi Michael, thanks for connecting.

Top 0.5% in the UK Best Estate Agency Guide — clearly Butler & Stag sets a high bar for service.

I'm the founder of Nesti. We build AI voice assistants for estate agents, trained on your agency's voice, your listings, and your local area. Every call answered perfectly, 24/7 or whenever the team aren't available.

Fine & Country, Richard James and Hunters are seeing 40% more viewings booked and 140% more buyers and properties registered. Peter Rollings (former MD of Foxtons) invested and joined our board.

Rather than sit through a demo — call this number and hear it for yourself: +44 7727 638641

Morgan"

Example LinkedIn DM (good):
"Hi Tom, thanks for connecting!

We build AI voice assistants for estate and letting agents that handle overflow and out-of-hours calls. Each one is fully trained on your agency's voice, your listings, and your local area.

Our customers are seeing 40% more viewing appointments and 140% more buyers and properties registered. We work with Fine & Country, Richard James, Hunters, and Peter Rollings (former MD of Foxtons), who recently invested and joined our board.

To save you sitting through a demo, here is a live AI number you can call right now and hear it for yourself: +44 7727 638641

Morgan"

---

STYLE RULES — follow these without exception:

1. Always open with the prospect's first name and "thanks for connecting" for LinkedIn. For email, use first name only.
2. Use ONE personalisation hook in the second line — a specific fact about their agency (award, location, number of branches, expansion, notable achievement). Never use generic openers like "I came across your profile."
3. State what Nesti does in plain English. No jargon, no buzzwords like "leverage", "synergy", "innovative solution."
4. Include the proof points: 40% more viewings, 140% more registrations, named customers, Peter Rollings.
5. ONE CTA only — always end with the demo number: +44 7727 638641. Never add a second ask like "let me know if you're interested in a demo."
6. Sign off as "Morgan" only. No title, no company name in the sign-off.
7. Keep LinkedIn DMs under 180 words. Cold emails under 250 words.
8. Never use bullet points in LinkedIn messages. Short paragraphs only.
9. Cold emails may use a short bullet list for proof points but keep it tight — maximum 3 bullets.
10. Never end with a question. End with the demo number.
11. Tone: Direct, warm, confident. Not salesy. Not corporate. Sounds like a founder, not a marketing department.
12. If the agency uses a call centre (e.g. Moneypenny, Face for Business, Orca) — include a subtle displacement angle: "Nesti doesn't just answer calls — it knows your listings, your area, and sounds exactly like your team."
13. Never make up facts. Only use information provided in the prospect data.

---

EMAIL SUBJECT LINE RULES:
- Under 8 words
- Specific to the agency — use their name or a specific detail
- No clickbait, no ALL CAPS, no emojis
- Examples of good subject lines: "AI that sounds like [Agency Name]", "Your calls, handled perfectly — [Agency Name]", "48 viewings booked this weekend — worth 5 mins?"

---

OUTPUT FORMAT:
Return your response in this exact JSON structure:
{
  "linkedin_message": "...",
  "email_subject": "...",
  "email_body": "..."
}"""

# ---------------------------------------------------------------------------
# Scraping
# ---------------------------------------------------------------------------

def scrape_website(url: str) -> tuple[str, str | None]:
    """Fetch homepage + about/team pages. Returns (content_str, error_msg)."""
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }

    base = url.rstrip("/")
    paths = ["", "/about", "/about-us", "/our-story", "/team", "/meet-the-team"]
    page_texts = []
    agency_name = ""

    for path in paths:
        try:
            r = requests.get(base + path, headers=headers, timeout=10, allow_redirects=True)
            if r.status_code != 200:
                continue
            soup = BeautifulSoup(r.content, "html.parser")

            # Grab agency name from <title> or first <h1>
            if not agency_name:
                title_tag = soup.find("title")
                h1_tag = soup.find("h1")
                if title_tag:
                    raw = title_tag.get_text(strip=True)
                    agency_name = re.split(r"[|\-–—]", raw)[0].strip()
                elif h1_tag:
                    agency_name = h1_tag.get_text(strip=True)

            # Strip noise
            for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
                tag.decompose()

            text = soup.get_text(separator=" ", strip=True)
            text = re.sub(r"\s{2,}", " ", text).strip()

            if len(text) > 150:
                label = path if path else "homepage"
                page_texts.append(f"[{label}]\n{text[:1800]}")

            if len(page_texts) >= 3:
                break

        except requests.RequestException:
            continue

    if not page_texts:
        return "", "Could not load any pages from that URL. Check the address and try again, or paste the website content manually below."

    combined = ""
    if agency_name:
        combined += f"Agency name (extracted): {agency_name}\n\n"
    combined += "\n\n---\n\n".join(page_texts)

    # Keep it to ~500 words to avoid bloating the prompt
    words = combined.split()
    if len(words) > 500:
        combined = " ".join(words[:500]) + " [truncated]"

    return combined, None


# ---------------------------------------------------------------------------
# API call
# ---------------------------------------------------------------------------

def build_user_message(website_content: str, linkedin_text: str, context_notes: str) -> str:
    return f"""Generate a LinkedIn message and cold email for the following prospect.

AGENCY WEBSITE DATA:
{website_content.strip() if website_content.strip() else "No website data available."}

LINKEDIN PROFILE:
{linkedin_text.strip() if linkedin_text.strip() else "No LinkedIn profile provided."}

ADDITIONAL CONTEXT:
{context_notes.strip() if context_notes.strip() else "None provided."}

Use only the facts provided above. Personalise using the most compelling specific detail you can find — awards, branch count, location, expansion news, known pain points. Follow all style rules exactly."""


def generate_messages(
    website_content: str,
    linkedin_text: str,
    context_notes: str,
    api_key: str,
) -> tuple[dict | None, str | None]:
    """Call Anthropic and return parsed dict or (None, error_string)."""
    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": build_user_message(website_content, linkedin_text, context_notes),
                }
            ],
        )
        raw = response.content[0].text

        # Extract JSON — Claude sometimes wraps in a code fence
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not json_match:
            return None, f"Model returned unexpected format:\n\n{raw[:600]}"

        data = json.loads(json_match.group())
        required = {"linkedin_message", "email_subject", "email_body"}
        missing = required - data.keys()
        if missing:
            return None, f"Response missing fields: {missing}\n\nRaw: {raw[:400]}"

        return data, None

    except json.JSONDecodeError as e:
        return None, f"JSON parse error: {e}\n\nRaw response:\n{raw[:600]}"
    except anthropic.AuthenticationError:
        return None, "Invalid API key. Check your ANTHROPIC_API_KEY in .env."
    except anthropic.RateLimitError:
        return None, "Rate limit hit — wait a moment then try again."
    except anthropic.BadRequestError as e:
        return None, f"Bad request: {e.message}"
    except anthropic.APIError as e:
        return None, f"Anthropic API error: {e}"
    except Exception as e:
        return None, f"Unexpected error: {e}"


# ---------------------------------------------------------------------------
# UI helpers
# ---------------------------------------------------------------------------

def clipboard_btn(text: str, label: str, key_suffix: str):
    """Inject a JS clipboard button. key_suffix keeps button IDs unique."""
    # Escape backticks and backslashes for the JS template literal
    safe = text.replace("\\", "\\\\").replace("`", "\\`").replace("$", "\\$")
    btn_id = f"cbtn_{key_suffix}"
    components.html(
        f"""
        <button id="{btn_id}"
            onclick="
                navigator.clipboard.writeText(`{safe}`)
                    .then(()=>{{
                        document.getElementById('{btn_id}').innerHTML='✅ Copied!';
                        setTimeout(()=>{{document.getElementById('{btn_id}').innerHTML='{label}';}}, 2000);
                    }})
                    .catch(()=>{{ alert('Copy failed — please select the text and copy manually.'); }});
            "
            style="
                background: #1f6feb;
                color: white;
                border: none;
                padding: 7px 18px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                letter-spacing: 0.01em;
            ">
            {label}
        </button>
        """,
        height=44,
    )


def word_badge(count: int, limit: int) -> str:
    if count > limit:
        return f"🔴 {count} words (over {limit}-word limit)"
    elif count > limit * 0.9:
        return f"🟡 {count} words (close to {limit}-word limit)"
    else:
        return f"🟢 {count} words"


def char_badge(count: int) -> str:
    """For LinkedIn connection-request note context (300 char limit)."""
    if count > 300:
        return f"⚠️ {count} chars — too long for a connection request note (300 char limit)"
    return ""


# ---------------------------------------------------------------------------
# Main app
# ---------------------------------------------------------------------------

def main():
    st.set_page_config(
        page_title="Nesti Outbound",
        page_icon="🏠",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    # ── session state ──
    if "history" not in st.session_state:
        st.session_state.history = []
    if "generated" not in st.session_state:
        st.session_state.generated = None
    if "scrape_error" not in st.session_state:
        st.session_state.scrape_error = None
    if "manual_site_text" not in st.session_state:
        st.session_state.manual_site_text = ""
    if "loaded_from_history" not in st.session_state:
        st.session_state.loaded_from_history = False

    # ── sidebar ──
    with st.sidebar:
        st.markdown(
            """
            <div style='display:flex;align-items:center;gap:10px;margin-bottom:4px'>
                <span style='font-size:28px'>🏠</span>
                <div>
                    <div style='font-size:20px;font-weight:700;line-height:1.2'>Nesti</div>
                    <div style='font-size:12px;color:#888'>Outbound Messaging</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        st.divider()

        # API key status
        api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
        if api_key:
            st.success("✅ API key loaded from .env")
        else:
            api_key = st.text_input(
                "Anthropic API Key",
                type="password",
                placeholder="sk-ant-...",
                help="Or add ANTHROPIC_API_KEY=sk-ant-... to your .env file",
            )
            if api_key:
                st.success("✅ API key entered")
            else:
                st.warning("⚠️ API key required")

        st.divider()

        # History
        if st.session_state.history:
            st.markdown("**Recent generations**")
            for i, item in enumerate(reversed(st.session_state.history[-5:])):
                with st.expander(f"🏢 {item['agency'][:28]}", expanded=False):
                    st.caption(item["timestamp"])
                    if st.button("↩ Reload this", key=f"hist_{i}", use_container_width=True):
                        st.session_state.generated = item["data"]
                        st.session_state.loaded_from_history = True
                        st.rerun()
        else:
            st.caption("No history yet — generate your first message above.")

    # ── main panel ──
    st.markdown("# Nesti Outbound Messaging")
    st.markdown(
        "Generate personalised cold LinkedIn DMs and cold emails for estate & letting agent prospects."
    )
    st.divider()

    # ── inputs ──
    col_left, col_right = st.columns([1, 1], gap="large")

    with col_left:
        website_url = st.text_input(
            "🌐 Agency website URL",
            placeholder="https://www.estateagency.co.uk",
        )

        st.markdown(
            """
            <div style='background:#1a1f2e;border:1px solid #2d3748;border-radius:8px;
                        padding:10px 14px;font-size:12px;color:#9ca3af;margin-bottom:8px'>
            💡 <strong style='color:#cbd5e1'>LinkedIn tip:</strong>
            LinkedIn blocks scraping, so paste the profile text manually.<br>
            Open the prospect's profile → press <kbd>Ctrl+A</kbd> → <kbd>Ctrl+C</kbd> → paste below.
            </div>
            """,
            unsafe_allow_html=True,
        )

        linkedin_text = st.text_area(
            "👤 LinkedIn profile text",
            placeholder="Paste the prospect's full LinkedIn profile text here…",
            height=190,
        )

    with col_right:
        context_notes = st.text_area(
            "📝 Context notes (optional)",
            placeholder=(
                "e.g. uses Moneypenny, won Best Agent 2024, expanding into commercial, "
                "3 branches in Bolton, recently merged with Smith & Co"
            ),
            height=160,
        )

        # Fallback if scraping failed
        if st.session_state.scrape_error:
            st.warning(f"⚠️ {st.session_state.scrape_error}")
            st.session_state.manual_site_text = st.text_area(
                "Paste website content manually",
                value=st.session_state.manual_site_text,
                height=160,
                placeholder="Copy relevant text from the agency's website and paste here…",
            )

    st.divider()

    # ── generate button ──
    has_any_input = bool(
        website_url.strip()
        or linkedin_text.strip()
        or context_notes.strip()
        or st.session_state.manual_site_text.strip()
    )
    has_key = bool(api_key)

    col_btn, _ = st.columns([1, 4])
    with col_btn:
        generate_clicked = st.button(
            "⚡ Generate Messages",
            disabled=not (has_any_input and has_key),
            type="primary",
            use_container_width=True,
        )

    if not has_any_input:
        st.caption("Provide at least one of: website URL, LinkedIn text, or context notes.")
    elif not has_key:
        st.caption("Add your Anthropic API key in the sidebar to proceed.")

    # ── generation logic ──
    if generate_clicked:
        with st.spinner("Scraping website and writing your messages…"):
            website_content = st.session_state.manual_site_text

            if website_url.strip():
                scraped, err = scrape_website(website_url.strip())
                if err:
                    st.session_state.scrape_error = err
                else:
                    website_content = scraped
                    st.session_state.scrape_error = None

            result, error = generate_messages(
                website_content=website_content,
                linkedin_text=linkedin_text,
                context_notes=context_notes,
                api_key=api_key,
            )

        if error:
            st.error(f"❌ {error}")
        else:
            st.session_state.generated = result
            st.session_state.loaded_from_history = False

            # Add to history
            if website_url.strip():
                label = urlparse(website_url.strip()).netloc.replace("www.", "")
            elif linkedin_text.strip():
                label = linkedin_text.strip().split("\n")[0][:35]
            else:
                label = context_notes.strip()[:35]

            st.session_state.history.append(
                {
                    "agency": label or "Unknown",
                    "timestamp": datetime.now().strftime("%H:%M  %d/%m/%y"),
                    "data": result,
                    "website_url": website_url.strip(),
                }
            )

            if st.session_state.scrape_error:
                st.warning(
                    "Scraping had issues — messages were generated from LinkedIn text "
                    "and context notes only."
                )
            st.rerun()

    # ── output section ──
    if st.session_state.generated:
        data = st.session_state.generated

        if st.session_state.loaded_from_history:
            st.info("📂 Loaded from history — inputs above are not connected to this output.")

        st.markdown("## ✉️ Generated Messages")
        tab_li, tab_email = st.tabs(["💼 LinkedIn Message", "📧 Cold Email"])

        # ── LinkedIn tab ──
        with tab_li:
            msg = data.get("linkedin_message", "")
            wc = len(msg.split())
            cc = len(msg)

            col_a, col_b = st.columns([3, 1])
            with col_a:
                st.caption(word_badge(wc, 180))
            with col_b:
                char_warn = char_badge(cc)
                if char_warn:
                    st.caption(char_warn)

            edited_li = st.text_area(
                "LinkedIn DM",
                value=msg,
                height=310,
                key="ta_linkedin",
                label_visibility="collapsed",
            )

            col_c1, col_c2, col_c3 = st.columns(3)

            with col_c1:
                clipboard_btn(edited_li, "📋 Copy LinkedIn DM", "li_main")

            with col_c2:
                if st.button("🔄 Regenerate", key="regen_li", use_container_width=True):
                    with st.spinner("Regenerating LinkedIn DM…"):
                        wc2 = st.session_state.manual_site_text
                        if website_url.strip():
                            s2, _ = scrape_website(website_url.strip())
                            if s2:
                                wc2 = s2
                        res2, err2 = generate_messages(wc2, linkedin_text, context_notes, api_key)
                    if err2:
                        st.error(err2)
                    elif res2:
                        st.session_state.generated["linkedin_message"] = res2["linkedin_message"]
                        st.rerun()

            with col_c3:
                st.caption(f"📊 {wc} words · {cc} chars")

        # ── Email tab ──
        with tab_email:
            subj = data.get("email_subject", "")
            body = data.get("email_body", "")
            wc_e = len(body.split())

            st.caption(word_badge(wc_e, 250))

            st.markdown("**Subject line**")
            edited_subj = st.text_input(
                "Subject",
                value=subj,
                key="ti_subject",
                label_visibility="collapsed",
            )

            st.markdown("**Email body**")
            edited_body = st.text_area(
                "Email Body",
                value=body,
                height=340,
                key="ta_email",
                label_visibility="collapsed",
            )

            col_d1, col_d2, col_d3, col_d4 = st.columns(4)

            with col_d1:
                clipboard_btn(edited_subj, "📋 Copy Subject", "subj")

            with col_d2:
                clipboard_btn(edited_body, "📋 Copy Body", "body")

            with col_d3:
                full_email = f"Subject: {edited_subj}\n\n{edited_body}"
                clipboard_btn(full_email, "📋 Copy Full Email", "full_email")

            with col_d4:
                if st.button("🔄 Regenerate", key="regen_email", use_container_width=True):
                    with st.spinner("Regenerating email…"):
                        wc3 = st.session_state.manual_site_text
                        if website_url.strip():
                            s3, _ = scrape_website(website_url.strip())
                            if s3:
                                wc3 = s3
                        res3, err3 = generate_messages(wc3, linkedin_text, context_notes, api_key)
                    if err3:
                        st.error(err3)
                    elif res3:
                        st.session_state.generated["email_subject"] = res3["email_subject"]
                        st.session_state.generated["email_body"] = res3["email_body"]
                        st.rerun()

        # ── export ──
        st.divider()
        if website_url.strip():
            fname_base = urlparse(website_url.strip()).netloc.replace("www.", "").replace(".", "_")
        else:
            fname_base = "prospect"
        fname_base = re.sub(r"[^\w_-]", "", fname_base) or "prospect"

        export_txt = (
            f"NESTI OUTBOUND — GENERATED MESSAGES\n"
            f"Agency: {fname_base}\n"
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
            f"{'=' * 60}\n"
            f"LINKEDIN DM\n"
            f"{'=' * 60}\n\n"
            f"{data.get('linkedin_message', '')}\n\n"
            f"{'=' * 60}\n"
            f"COLD EMAIL\n"
            f"{'=' * 60}\n\n"
            f"Subject: {data.get('email_subject', '')}\n\n"
            f"{data.get('email_body', '')}\n"
        )

        st.download_button(
            label="⬇️ Export both messages (.txt)",
            data=export_txt,
            file_name=f"nesti_outbound_{fname_base}.txt",
            mime="text/plain",
        )


if __name__ == "__main__":
    main()
