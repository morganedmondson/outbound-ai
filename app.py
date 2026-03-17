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
# Design system injection — Nesti style guide
# ---------------------------------------------------------------------------

def inject_styles():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* ── Design tokens ─────────────────────────────────────────────────── */
    :root {
        --primary:          #2764EB;
        --primary-hover:    #1e56d1;
        --primary-active:   #1a4bb8;
        --primary-contrast: #FFFFFF;
        --text:             #0E121B;
        --surface:          #FFFFFF;
        --background:       #F9FAFB;
        --destructive:      #D32F2F;
        --success:          #388E3C;
        --alert:            #F57C00;
        --border:           #E3E4E9;
        --gray-10:          #F7F7F7;
        --gray-20:          #F2F2F2;
        --gray-30:          #E3E4E9;
        --gray-40:          #C7C7C7;
        --gray-50:          #737373;
        --gray-60:          #636363;
        --gray-70:          #6A717F;
        --gray-80:          #1A1A1A;
        --font:             'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        --radius-sm:        4px;
        --radius-md:        8px;
        --radius-lg:        12px;
        --radius-xl:        16px;
        --shadow-sm:        0 1px 2px 0 rgba(0,0,0,0.05);
        --shadow-soft:      0 1px 3px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.06);
        --shadow-elevated:  0 2px 8px -2px rgba(0,0,0,0.08), 0 8px 20px -4px rgba(0,0,0,0.07);
        --shadow-md:        0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
    }

    /* ── Global reset ───────────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; }

    html, body, .stApp {
        font-family: var(--font) !important;
        background-color: var(--background) !important;
        color: var(--text) !important;
    }

    ::selection { background: var(--primary); color: var(--primary-contrast); }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--gray-50); }

    /* ── Hide Streamlit chrome ──────────────────────────────────────────── */
    #MainMenu, footer { visibility: hidden; }
    header[data-testid="stHeader"] { background: transparent !important; }
    .stAppHeader { background: var(--surface) !important; border-bottom: 1px solid var(--border) !important; }

    /* ── Main block container ───────────────────────────────────────────── */
    .main .block-container {
        padding-top: 2rem !important;
        padding-bottom: 3rem !important;
        max-width: 1200px !important;
    }

    /* ── Typography ─────────────────────────────────────────────────────── */
    h1, .stMarkdown h1 {
        font-family: var(--font) !important;
        font-size: 32px !important;
        font-weight: 600 !important;
        line-height: 1.15 !important;
        letter-spacing: -0.01em !important;
        color: var(--text) !important;
    }
    h2, .stMarkdown h2 {
        font-family: var(--font) !important;
        font-size: 24px !important;
        font-weight: 500 !important;
        line-height: 1.25 !important;
        color: var(--text) !important;
    }
    h3, .stMarkdown h3 {
        font-family: var(--font) !important;
        font-size: 18px !important;
        font-weight: 500 !important;
        line-height: 1.35 !important;
        color: var(--text) !important;
    }
    p, .stMarkdown p, label, .stMarkdown li {
        font-family: var(--font) !important;
        font-size: 14px !important;
        color: var(--text) !important;
        line-height: 1.45 !important;
    }
    .stCaption p, [data-testid="stCaptionContainer"] p {
        font-family: var(--font) !important;
        font-size: 11px !important;
        font-weight: 500 !important;
        color: var(--gray-50) !important;
        letter-spacing: 0.01em !important;
    }

    /* ── Divider ────────────────────────────────────────────────────────── */
    hr { border: none !important; border-top: 1px solid var(--border) !important; margin: 1.5rem 0 !important; }

    /* ── Sidebar ────────────────────────────────────────────────────────── */
    [data-testid="stSidebar"],
    [data-testid="stSidebar"] > div:first-child {
        background-color: var(--surface) !important;
        border-right: 1px solid rgba(227,228,233,0.6) !important;
    }
    [data-testid="stSidebar"] .stMarkdown p,
    [data-testid="stSidebar"] .stMarkdown li {
        font-size: 13px !important;
        color: var(--gray-60) !important;
    }
    [data-testid="stSidebar"] .stMarkdown strong {
        color: var(--text) !important;
        font-weight: 600 !important;
    }
    [data-testid="stSidebar"] hr {
        border-color: rgba(227,228,233,0.4) !important;
    }
    [data-testid="stSidebar"] .stTextInput label,
    [data-testid="stSidebar"] label {
        font-size: 13px !important;
        font-weight: 500 !important;
        color: var(--text) !important;
    }

    /* ── Buttons — Primary ──────────────────────────────────────────────── */
    [data-testid="stButton"] > button[kind="primary"],
    [data-testid="stBaseButton-primary"] {
        background-color: var(--primary) !important;
        color: var(--primary-contrast) !important;
        border: none !important;
        border-radius: var(--radius-lg) !important;
        font-family: var(--font) !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        padding: 8px 18px !important;
        box-shadow: var(--shadow-sm) !important;
        transition: all 150ms cubic-bezier(0,0,0.2,1) !important;
        letter-spacing: -0.01em !important;
    }
    [data-testid="stButton"] > button[kind="primary"]:hover,
    [data-testid="stBaseButton-primary"]:hover {
        background-color: var(--primary-hover) !important;
        box-shadow: var(--shadow-md) !important;
        transform: translateY(-1px) !important;
    }
    [data-testid="stButton"] > button[kind="primary"]:active,
    [data-testid="stBaseButton-primary"]:active {
        background-color: var(--primary-active) !important;
        transform: translateY(0) !important;
    }

    /* ── Buttons — Secondary ────────────────────────────────────────────── */
    [data-testid="stButton"] > button:not([kind="primary"]),
    [data-testid="stBaseButton-secondary"] {
        background-color: var(--surface) !important;
        color: var(--text) !important;
        border: 1px solid var(--border) !important;
        border-radius: var(--radius-lg) !important;
        font-family: var(--font) !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        padding: 8px 18px !important;
        box-shadow: none !important;
        transition: all 150ms cubic-bezier(0,0,0.2,1) !important;
        letter-spacing: -0.01em !important;
    }
    [data-testid="stButton"] > button:not([kind="primary"]):hover {
        background-color: var(--gray-10) !important;
        border-color: var(--gray-40) !important;
        box-shadow: var(--shadow-sm) !important;
        transform: translateY(-1px) !important;
    }
    [data-testid="stButton"] > button:not([kind="primary"]):active {
        background-color: var(--gray-20) !important;
        transform: translateY(0) !important;
    }

    /* ── Buttons — Download ─────────────────────────────────────────────── */
    [data-testid="stDownloadButton"] > button {
        background-color: var(--surface) !important;
        color: var(--text) !important;
        border: 1px solid var(--border) !important;
        border-radius: var(--radius-lg) !important;
        font-family: var(--font) !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        padding: 8px 18px !important;
        transition: all 150ms ease-out !important;
        letter-spacing: -0.01em !important;
    }
    [data-testid="stDownloadButton"] > button:hover {
        background-color: var(--gray-10) !important;
        border-color: var(--gray-40) !important;
        box-shadow: var(--shadow-sm) !important;
        transform: translateY(-1px) !important;
    }

    /* Disabled state */
    [data-testid="stButton"] > button:disabled,
    [data-testid="stBaseButton-primary"]:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
        transform: none !important;
        box-shadow: none !important;
    }

    /* ── Text Input ─────────────────────────────────────────────────────── */
    [data-testid="stTextInput"] label {
        font-family: var(--font) !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        color: var(--text) !important;
        margin-bottom: 6px !important;
    }
    [data-testid="stTextInput"] > div > div > input {
        border: 1px solid var(--border) !important;
        border-radius: var(--radius-lg) !important;
        background-color: var(--surface) !important;
        color: var(--text) !important;
        font-family: var(--font) !important;
        font-size: 14px !important;
        padding: 9px 12px !important;
        box-shadow: var(--shadow-sm) !important;
        transition: all 150ms ease-out !important;
    }
    [data-testid="stTextInput"] > div > div > input:focus {
        border-color: var(--primary) !important;
        box-shadow: 0 0 0 3px rgba(39,100,235,0.12) !important;
        outline: none !important;
    }
    [data-testid="stTextInput"] > div > div > input::placeholder {
        color: var(--gray-50) !important;
    }

    /* ── Text Area ──────────────────────────────────────────────────────── */
    [data-testid="stTextArea"] label {
        font-family: var(--font) !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        color: var(--text) !important;
        margin-bottom: 6px !important;
    }
    [data-testid="stTextArea"] > div > div > textarea {
        border: 1px solid var(--border) !important;
        border-radius: var(--radius-lg) !important;
        background-color: var(--surface) !important;
        color: var(--text) !important;
        font-family: var(--font) !important;
        font-size: 14px !important;
        line-height: 1.55 !important;
        padding: 10px 12px !important;
        box-shadow: var(--shadow-soft) !important;
        transition: all 200ms ease-out !important;
    }
    [data-testid="stTextArea"] > div > div > textarea:focus {
        border-color: rgba(39,100,235,0.4) !important;
        box-shadow: var(--shadow-elevated) !important;
        outline: none !important;
    }
    [data-testid="stTextArea"] > div > div > textarea::placeholder {
        color: var(--gray-50) !important;
    }

    /* ── Tabs ────────────────────────────────────────────────────────────── */
    .stTabs [data-baseweb="tab-list"] {
        background-color: var(--gray-10) !important;
        border-radius: var(--radius-lg) !important;
        padding: 3px !important;
        gap: 2px !important;
        border-bottom: none !important;
    }
    .stTabs [data-baseweb="tab"] {
        background-color: transparent !important;
        border-radius: var(--radius-md) !important;
        font-family: var(--font) !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        color: var(--gray-60) !important;
        padding: 7px 16px !important;
        border: none !important;
        transition: color 150ms ease-out !important;
    }
    .stTabs [data-baseweb="tab"]:hover {
        color: var(--text) !important;
        background-color: transparent !important;
    }
    .stTabs [data-baseweb="tab"][aria-selected="true"] {
        background-color: var(--surface) !important;
        color: var(--text) !important;
        box-shadow: var(--shadow-sm) !important;
        font-weight: 600 !important;
    }
    .stTabs [data-baseweb="tab-highlight"],
    .stTabs [data-baseweb="tab-border"] { display: none !important; }

    /* ── Alerts ──────────────────────────────────────────────────────────── */
    [data-testid="stAlert"] {
        border-radius: var(--radius-lg) !important;
        font-family: var(--font) !important;
        font-size: 13px !important;
        border-width: 1px !important;
        border-style: solid !important;
    }
    [data-testid="stAlert"][data-baseweb="notification"] { padding: 12px 16px !important; }
    .stSuccess  { background: rgba(56,142,60,0.05)  !important; border-color: rgba(56,142,60,0.2)  !important; color: var(--success)     !important; }
    .stWarning  { background: rgba(245,124,0,0.05)  !important; border-color: rgba(245,124,0,0.2)  !important; color: var(--alert)       !important; }
    .stError    { background: rgba(211,47,47,0.05)  !important; border-color: rgba(211,47,47,0.2)  !important; color: var(--destructive) !important; }
    .stInfo     { background: var(--gray-10)        !important; border-color: var(--border)         !important; color: var(--gray-60)     !important; }

    /* ── Expander ────────────────────────────────────────────────────────── */
    [data-testid="stExpander"] {
        border: 1px solid var(--border) !important;
        border-radius: var(--radius-lg) !important;
        background: var(--surface) !important;
        box-shadow: var(--shadow-soft) !important;
        overflow: hidden !important;
    }
    [data-testid="stExpander"] > details > summary {
        font-family: var(--font) !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        color: var(--text) !important;
        padding: 10px 14px !important;
        transition: background 150ms ease-out !important;
    }
    [data-testid="stExpander"] > details > summary:hover {
        background: var(--gray-10) !important;
    }
    [data-testid="stExpander"] > details > summary > span {
        font-size: 13px !important;
        font-weight: 500 !important;
    }

    /* ── Spinner ─────────────────────────────────────────────────────────── */
    [data-testid="stSpinner"] > div {
        border-top-color: var(--primary) !important;
    }

    /* ── Columns spacing ─────────────────────────────────────────────────── */
    [data-testid="column"] { padding: 0 6px !important; }
    [data-testid="column"]:first-child { padding-left: 0 !important; }
    [data-testid="column"]:last-child { padding-right: 0 !important; }

    /* ── Sidebar text input ──────────────────────────────────────────────── */
    [data-testid="stSidebar"] [data-testid="stTextInput"] > div > div > input {
        background: var(--gray-10) !important;
        border-color: var(--border) !important;
        border-radius: var(--radius-lg) !important;
        font-size: 13px !important;
    }
    </style>
    """, unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# Reusable HTML UI components
# ---------------------------------------------------------------------------

def clipboard_btn(text: str, label: str, key_suffix: str):
    """Secondary-style clipboard button matching Nesti design system."""
    safe = text.replace("\\", "\\\\").replace("`", "\\`").replace("$", "\\$")
    bid = f"cb_{key_suffix}"
    original_label = label
    components.html(f"""
        <button id="{bid}"
            onclick="
                navigator.clipboard.writeText(`{safe}`)
                    .then(()=>{{
                        var b = document.getElementById('{bid}');
                        b.innerHTML = '✓&nbsp;Copied!';
                        b.style.color = '#388E3C';
                        b.style.background = 'rgba(56,142,60,0.05)';
                        b.style.borderColor = 'rgba(56,142,60,0.2)';
                        setTimeout(()=>{{
                            b.innerHTML = '{original_label}';
                            b.style.color = '#0E121B';
                            b.style.background = '#FFFFFF';
                            b.style.borderColor = '#E3E4E9';
                        }}, 2000);
                    }})
                    .catch(()=>{{ alert('Copy failed — please select the text and copy manually.'); }});
            "
            onmouseover="var b=this;if(b.style.color!='rgb(56,142,60)'){{b.style.background='#F7F7F7';b.style.borderColor='#C7C7C7';b.style.transform='translateY(-1px)';b.style.boxShadow='0 1px 2px 0 rgba(0,0,0,0.05)';}}"
            onmouseout="var b=this;if(b.style.color!='rgb(56,142,60)'){{b.style.background='#FFFFFF';b.style.borderColor='#E3E4E9';b.style.transform='translateY(0)';b.style.boxShadow='none';}}"
            onmousedown="var b=this;if(b.style.color!='rgb(56,142,60)'){{b.style.background='#F2F2F2';b.style.transform='translateY(0)';}}"
            style="
                display:inline-flex;align-items:center;gap:6px;
                background:#FFFFFF;color:#0E121B;
                border:1px solid #E3E4E9;border-radius:12px;
                padding:7px 16px;cursor:pointer;
                font-size:13px;font-weight:600;
                font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                letter-spacing:-0.01em;
                transition:all 150ms cubic-bezier(0,0,0.2,1);
                box-shadow:none;outline:none;white-space:nowrap;
            ">
            {label}
        </button>
    """, height=44)


def word_badge(count: int, limit: int) -> str:
    """Nesti confidence-badge–style word count pill."""
    if count > limit:
        color, bg, border = "#D32F2F", "rgba(211,47,47,0.1)", "rgba(211,47,47,0.2)"
        label = f"Over limit — {count}/{limit} words"
    elif count > int(limit * 0.9):
        color, bg, border = "#F57C00", "rgba(245,124,0,0.1)", "rgba(245,124,0,0.2)"
        label = f"Near limit — {count}/{limit} words"
    else:
        color, bg, border = "#388E3C", "rgba(56,142,60,0.1)", "rgba(56,142,60,0.2)"
        label = f"{count}/{limit} words"
    return (
        f'<span style="display:inline-flex;align-items:center;gap:5px;'
        f'padding:3px 10px;background:{bg};border:1px solid {border};'
        f'border-radius:4px;font-size:11px;font-weight:500;color:{color};'
        f'font-family:\'Inter\',-apple-system,sans-serif;letter-spacing:0.01em;">'
        f'● {label}</span>'
    )


def char_badge(count: int) -> str:
    """Warn when LinkedIn DM exceeds 300-char connection-note limit."""
    if count > 300:
        return (
            f'<span style="display:inline-flex;align-items:center;gap:5px;'
            f'padding:3px 10px;background:rgba(211,47,47,0.1);'
            f'border:1px solid rgba(211,47,47,0.2);border-radius:4px;'
            f'font-size:11px;font-weight:500;color:#D32F2F;'
            f'font-family:\'Inter\',-apple-system,sans-serif;letter-spacing:0.01em;">'
            f'⚠ {count} chars — too long for a connection request note (300 limit)</span>'
        )
    return ""


def info_box(html_content: str):
    """Nesti-styled info alert block."""
    st.markdown(
        f'<div style="background:var(--gray-10,#F7F7F7);border:1px solid #E3E4E9;'
        f'border-radius:12px;padding:10px 14px;margin-bottom:10px;'
        f'font-size:12px;line-height:1.6;color:#636363;'
        f'font-family:\'Inter\',-apple-system,BlinkMacSystemFont,sans-serif;">'
        f'{html_content}</div>',
        unsafe_allow_html=True,
    )


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

            if not agency_name:
                title_tag = soup.find("title")
                h1_tag = soup.find("h1")
                if title_tag:
                    agency_name = re.split(r"[|\-–—]", title_tag.get_text(strip=True))[0].strip()
                elif h1_tag:
                    agency_name = h1_tag.get_text(strip=True)

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
    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": build_user_message(website_content, linkedin_text, context_notes)}],
        )
        raw = response.content[0].text

        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not json_match:
            return None, f"Model returned unexpected format:\n\n{raw[:600]}"

        data = json.loads(json_match.group())
        missing = {"linkedin_message", "email_subject", "email_body"} - data.keys()
        if missing:
            return None, f"Response missing fields: {missing}"

        return data, None

    except json.JSONDecodeError as e:
        return None, f"JSON parse error: {e}"
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
# App
# ---------------------------------------------------------------------------

def main():
    st.set_page_config(
        page_title="Nesti Outbound",
        page_icon="🏠",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    inject_styles()

    # Session state
    if "history"           not in st.session_state: st.session_state.history = []
    if "generated"         not in st.session_state: st.session_state.generated = None
    if "scrape_error"      not in st.session_state: st.session_state.scrape_error = None
    if "manual_site_text"  not in st.session_state: st.session_state.manual_site_text = ""
    if "from_history"      not in st.session_state: st.session_state.from_history = False

    # ── Sidebar ──────────────────────────────────────────────────────────
    with st.sidebar:
        # Logo / branding
        st.markdown(
            """
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0 16px;">
                <div style="width:32px;height:32px;background:#2764EB;border-radius:8px;
                            display:flex;align-items:center;justify-content:center;
                            font-size:16px;color:white;font-weight:700;flex-shrink:0;">N</div>
                <div>
                    <div style="font-size:15px;font-weight:700;color:#0E121B;
                                font-family:'Inter',sans-serif;line-height:1.2;">Nesti</div>
                    <div style="font-size:11px;color:#737373;font-family:'Inter',sans-serif;
                                letter-spacing:0.01em;font-weight:500;">Outbound Messaging</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        st.divider()

        # API key
        api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
        if api_key:
            st.markdown(
                '<div style="display:flex;align-items:center;gap:7px;padding:8px 10px;'
                'background:rgba(56,142,60,0.06);border:1px solid rgba(56,142,60,0.18);'
                'border-radius:8px;margin-bottom:4px;">'
                '<span style="color:#388E3C;font-size:13px;">✓</span>'
                '<span style="font-size:12px;color:#388E3C;font-weight:500;'
                'font-family:\'Inter\',sans-serif;">API key loaded</span></div>',
                unsafe_allow_html=True,
            )
        else:
            api_key = st.text_input(
                "Anthropic API Key",
                type="password",
                placeholder="sk-ant-...",
                help="Or add ANTHROPIC_API_KEY=sk-ant-... to your .env file",
            )
            if api_key:
                st.markdown(
                    '<div style="display:flex;align-items:center;gap:7px;padding:8px 10px;'
                    'background:rgba(56,142,60,0.06);border:1px solid rgba(56,142,60,0.18);'
                    'border-radius:8px;">'
                    '<span style="color:#388E3C;font-size:13px;">✓</span>'
                    '<span style="font-size:12px;color:#388E3C;font-weight:500;'
                    'font-family:\'Inter\',sans-serif;">API key entered</span></div>',
                    unsafe_allow_html=True,
                )
            else:
                st.markdown(
                    '<div style="display:flex;align-items:center;gap:7px;padding:8px 10px;'
                    'background:rgba(245,124,0,0.06);border:1px solid rgba(245,124,0,0.2);'
                    'border-radius:8px;">'
                    '<span style="color:#F57C00;font-size:13px;">⚠</span>'
                    '<span style="font-size:12px;color:#F57C00;font-weight:500;'
                    'font-family:\'Inter\',sans-serif;">API key required</span></div>',
                    unsafe_allow_html=True,
                )

        st.divider()

        # History
        if st.session_state.history:
            st.markdown(
                '<p style="font-size:11px;font-weight:500;color:#636363;text-transform:uppercase;'
                'letter-spacing:0.05em;font-family:\'Inter\',sans-serif;margin-bottom:6px;">'
                'Recent generations</p>',
                unsafe_allow_html=True,
            )
            for i, item in enumerate(reversed(st.session_state.history[-5:])):
                with st.expander(f"🏢 {item['agency'][:28]}", expanded=False):
                    st.caption(item["timestamp"])
                    if st.button("↩ Reload", key=f"hist_{i}", use_container_width=True):
                        st.session_state.generated = item["data"]
                        st.session_state.from_history = True
                        st.rerun()
        else:
            st.markdown(
                '<div style="text-align:center;padding:20px 0;">'
                '<div style="width:36px;height:36px;border-radius:50%;background:#F7F7F7;'
                'display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">'
                '<span style="font-size:16px;">✉️</span></div>'
                '<p style="font-size:12px;color:#636363;font-family:\'Inter\',sans-serif;margin:0;">'
                'No history yet</p>'
                '<p style="font-size:11px;color:#737373;font-family:\'Inter\',sans-serif;margin:2px 0 0;">'
                'Generate your first message above</p></div>',
                unsafe_allow_html=True,
            )

    # ── Main panel ───────────────────────────────────────────────────────
    st.markdown("# Nesti Outbound Messaging")
    st.markdown(
        '<p style="font-size:14px;color:#636363;margin-top:-4px;margin-bottom:0;">'
        'Generate personalised cold LinkedIn DMs and emails for estate &amp; letting agent prospects.</p>',
        unsafe_allow_html=True,
    )
    st.divider()

    # ── Inputs ───────────────────────────────────────────────────────────
    col_left, col_right = st.columns([1, 1], gap="large")

    with col_left:
        website_url = st.text_input(
            "🌐 Agency website URL",
            placeholder="https://www.estateagency.co.uk",
        )

        info_box(
            '💡 <strong style="color:#0E121B;">LinkedIn tip:</strong> '
            'LinkedIn blocks scraping, so paste the profile text manually. '
            'Open the prospect\'s profile → press '
            '<kbd style="background:#F2F2F2;border:1px solid #E3E4E9;border-radius:4px;'
            'padding:1px 5px;font-size:11px;font-family:monospace;">Ctrl+A</kbd> → '
            '<kbd style="background:#F2F2F2;border:1px solid #E3E4E9;border-radius:4px;'
            'padding:1px 5px;font-size:11px;font-family:monospace;">Ctrl+C</kbd> → paste below.'
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

        if st.session_state.scrape_error:
            st.warning(f"⚠️ {st.session_state.scrape_error}")
            st.session_state.manual_site_text = st.text_area(
                "Paste website content manually",
                value=st.session_state.manual_site_text,
                height=140,
                placeholder="Copy relevant text from the agency's website and paste here…",
            )

    st.divider()

    # ── Generate button ──────────────────────────────────────────────────
    has_input = bool(
        website_url.strip()
        or linkedin_text.strip()
        or context_notes.strip()
        or st.session_state.manual_site_text.strip()
    )
    has_key = bool(api_key)

    col_btn, col_hint = st.columns([1, 5])
    with col_btn:
        generate_clicked = st.button(
            "⚡ Generate Messages",
            disabled=not (has_input and has_key),
            type="primary",
            use_container_width=True,
        )
    with col_hint:
        if not has_input:
            st.caption("Provide at least one of: website URL, LinkedIn text, or context notes.")
        elif not has_key:
            st.caption("Add your Anthropic API key in the sidebar to continue.")

    # ── Generation ───────────────────────────────────────────────────────
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
            st.session_state.from_history = False

            label = (
                urlparse(website_url.strip()).netloc.replace("www.", "")
                if website_url.strip()
                else (linkedin_text.strip().split("\n")[0][:35] if linkedin_text.strip()
                      else context_notes.strip()[:35])
            )
            st.session_state.history.append({
                "agency": label or "Unknown",
                "timestamp": datetime.now().strftime("%H:%M  %d/%m/%y"),
                "data": result,
            })

            if st.session_state.scrape_error:
                st.warning("Scraping had issues — messages generated from LinkedIn text and context notes only.")

            st.rerun()

    # ── Outputs ──────────────────────────────────────────────────────────
    if st.session_state.generated:
        data = st.session_state.generated

        if st.session_state.from_history:
            st.info("📂 Loaded from history — inputs above are not connected to this output.")

        st.markdown("## Generated Messages")

        tab_li, tab_email = st.tabs(["💼 LinkedIn Message", "📧 Cold Email"])

        # ── LinkedIn tab ─────────────────────────────────────────────────
        with tab_li:
            msg = data.get("linkedin_message", "")
            wc  = len(msg.split())
            cc  = len(msg)

            # Badges row
            badge_html = word_badge(wc, 180)
            cb = char_badge(cc)
            if cb:
                badge_html += "&nbsp;&nbsp;" + cb
            st.markdown(badge_html, unsafe_allow_html=True)
            st.markdown("<div style='margin-top:6px;'></div>", unsafe_allow_html=True)

            edited_li = st.text_area(
                "LinkedIn DM",
                value=msg,
                height=310,
                key="ta_linkedin",
                label_visibility="collapsed",
            )

            col_c1, col_c2, col_c3 = st.columns([1, 1, 2])
            with col_c1:
                clipboard_btn(edited_li, "📋 Copy DM", "li")
            with col_c2:
                if st.button("🔄 Regenerate", key="regen_li", use_container_width=True):
                    with st.spinner("Regenerating…"):
                        wc_content = st.session_state.manual_site_text
                        if website_url.strip():
                            s, _ = scrape_website(website_url.strip())
                            if s: wc_content = s
                        res, err = generate_messages(wc_content, linkedin_text, context_notes, api_key)
                    if err:
                        st.error(err)
                    elif res:
                        st.session_state.generated["linkedin_message"] = res["linkedin_message"]
                        st.rerun()
            with col_c3:
                st.markdown(
                    f'<span style="font-size:11px;color:#737373;font-weight:500;'
                    f'font-family:\'Inter\',sans-serif;letter-spacing:0.01em;">'
                    f'{wc} words · {cc} chars</span>',
                    unsafe_allow_html=True,
                )

        # ── Email tab ────────────────────────────────────────────────────
        with tab_email:
            subj = data.get("email_subject", "")
            body = data.get("email_body", "")
            wc_e = len(body.split())

            st.markdown(word_badge(wc_e, 250), unsafe_allow_html=True)
            st.markdown("<div style='margin-top:6px;'></div>", unsafe_allow_html=True)

            st.markdown(
                '<p style="font-size:13px;font-weight:500;color:#0E121B;'
                'font-family:\'Inter\',sans-serif;margin-bottom:4px;">Subject line</p>',
                unsafe_allow_html=True,
            )
            edited_subj = st.text_input(
                "Subject",
                value=subj,
                key="ti_subject",
                label_visibility="collapsed",
            )

            st.markdown(
                '<p style="font-size:13px;font-weight:500;color:#0E121B;'
                'font-family:\'Inter\',sans-serif;margin-bottom:4px;margin-top:12px;">Email body</p>',
                unsafe_allow_html=True,
            )
            edited_body = st.text_area(
                "Email Body",
                value=body,
                height=340,
                key="ta_email",
                label_visibility="collapsed",
            )

            col_d1, col_d2, col_d3, col_d4 = st.columns([1, 1, 1, 1])
            with col_d1:
                clipboard_btn(edited_subj, "📋 Subject", "subj")
            with col_d2:
                clipboard_btn(edited_body, "📋 Body", "body")
            with col_d3:
                clipboard_btn(f"Subject: {edited_subj}\n\n{edited_body}", "📋 Full Email", "full")
            with col_d4:
                if st.button("🔄 Regenerate", key="regen_email", use_container_width=True):
                    with st.spinner("Regenerating…"):
                        wc_content = st.session_state.manual_site_text
                        if website_url.strip():
                            s, _ = scrape_website(website_url.strip())
                            if s: wc_content = s
                        res, err = generate_messages(wc_content, linkedin_text, context_notes, api_key)
                    if err:
                        st.error(err)
                    elif res:
                        st.session_state.generated["email_subject"] = res["email_subject"]
                        st.session_state.generated["email_body"]    = res["email_body"]
                        st.rerun()

        # ── Export ───────────────────────────────────────────────────────
        st.divider()

        fname = re.sub(
            r"[^\w_-]", "",
            urlparse(website_url.strip()).netloc.replace("www.", "").replace(".", "_")
            if website_url.strip() else "prospect"
        ) or "prospect"

        export_txt = (
            f"NESTI OUTBOUND — GENERATED MESSAGES\n"
            f"Agency: {fname}\n"
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
            f"{'=' * 60}\nLINKEDIN DM\n{'=' * 60}\n\n"
            f"{data.get('linkedin_message', '')}\n\n"
            f"{'=' * 60}\nCOLD EMAIL\n{'=' * 60}\n\n"
            f"Subject: {data.get('email_subject', '')}\n\n"
            f"{data.get('email_body', '')}\n"
        )

        st.download_button(
            label="⬇️ Export both messages (.txt)",
            data=export_txt,
            file_name=f"nesti_outbound_{fname}.txt",
            mime="text/plain",
        )


if __name__ == "__main__":
    main()
