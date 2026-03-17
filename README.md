# Nesti Outbound Messaging Tool

Generate personalised cold LinkedIn DMs and emails for estate & letting agent prospects using Claude AI.

## Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Add your Anthropic API key

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder with your real key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run the app

```bash
streamlit run app.py
```

The app opens at `http://localhost:8501`.

---

## How to use

1. **Agency website URL** — paste the prospect's website. The app scrapes the homepage, `/about`, `/about-us`, `/team`, and `/meet-the-team` pages automatically.

2. **LinkedIn profile text** — LinkedIn blocks scraping, so paste the text manually:
   - Open the prospect's LinkedIn profile in your browser
   - Press `Ctrl+A` (select all) → `Ctrl+C` (copy)
   - Paste into the text area

3. **Context notes** — any extra facts not on the website or LinkedIn profile:
   `e.g. uses Moneypenny, won Best Agent 2024, 3 branches in Bolton`

4. Click **Generate Messages** — the app returns:
   - A personalised LinkedIn DM (under 180 words)
   - A personalised cold email with subject line (under 250 words)

5. Use the **Copy** buttons on each output, or **Regenerate** for a new variant.

6. **Export** both messages as a `.txt` file named after the agency.

---

## Notes

- If the website can't be scraped (some sites block bots), a fallback text area appears — paste content from the site manually.
- The last 5 generated messages are saved in the sidebar under **Recent generations**. Click **Reload** to restore any previous output.
- Character counter warns you if the LinkedIn DM exceeds 300 chars (relevant for connection request notes).

---

## Files

```
app.py            — full Streamlit application
requirements.txt  — Python dependencies
.env.example      — template for API key
README.md         — this file
```
