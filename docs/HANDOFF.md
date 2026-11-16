# SafeSpace: handoff for the YourDOST Task 3 write-up

Paste this into the Claude chat where the submission doc is being written. It summarises what was built, the key product decisions and the numbers, so the 2-page document and the video script can be written from it.

**Live link:** `<paste your Vercel URL>` · **Code:** github.com/neeraj3000-pm/safespace
**Due:** before Wed 18 Nov, 8 am IST. Deliverables: live link, a doc of up to 2 pages, and a short walkthrough video.

---

## What it is

**SafeSpace** (a YourDOST prototype) answers: *"How might we use AI to help users identify the most relevant next step in their mental wellbeing journey?"*

The user says what's on their mind in their own words, in English, Hindi or Hinglish. SafeSpace recommends one clear next step and explains why:
- **A. Talk to an expert:** 3 matched experts, each with a "why we matched you" line.
- **B. Start on your own:** 2–3 self-help tools.
- **C. Get help now:** 24x7 YourDOST expert, Tele-MANAS 14416, emergency 112. No recommendations are shown on this path.

It extends Task 2 ("Smart Therapist Matching": 60-second intake, top 3 with why-matched, "Did you feel heard?" after session 1, guilt-free switching, north star = same expert at session 4).

**User problem:** people who reach out often don't know whether they need a counsellor, a self-help tool or urgent help. When they pick a counsellor, it's close to random. A poor first match plus stigma leads to quiet dropout before therapy has time to work.

## The journey (one complete flow, all working)

1. **Landing:** "Not sure where to start? Let's find your next step." Anonymous, about a minute.
2. **Consent:** what's collected, no name, the free text isn't stored, not for emergencies.
3. **Check-in (3 steps):** free text (optional, with tap-to-insert example chips), quick taps (language, expert gender, life stage, time, listening vs practical style), and "How do you feel about talking to someone?"
4. **Here's what we understood:** a one-line summary plus editable topic chips. *This is the AI error-handling moment.*
5. **Your next step:** a primary path plus a secondary option.
6. **Booking screen:** slot picker plus the **consent toggle** (on by default): "Share a short summary with your expert so you don't have to repeat yourself." The user sees the exact 3-line brief and can edit it. There's also an **Expert view (demo)** page.
7. **Booked:** a "What to expect" timeline: session 1 getting to know each other, sessions 2–3 understanding patterns, around session 4 many feel a shift. "Change takes a few sessions, and that's normal."
8. **After session 1:** "Did you feel heard?" (1–5).
   - 4–5: book session 2 with the same expert.
   - 1–3: a guilt-free switch. Pick a reason, get the next best match plus a free 10-minute intro call, and a **handover brief** with the switch reason: "Your new expert will know what you've shared, so you won't start over."
9. **/insights (internal):** funnel, felt-heard, switch reasons, north star, AI quality, safety.

Demo personas on `/start`: **Riya** (student, English, exam panic at night), **Arjun** (engineer, Hinglish, work pressure and sleep), **Crisis case** (goes straight to help-now).

## Why AI, and where (the key product decision)

**Rules own what must be predictable; AI owns understanding and explaining.**

| Step | Rules or AI |
|---|---|
| Strip names, phones, emails | Rules (regex) |
| **Safety check, run first** (EN / Hindi / Hinglish phrase list) | **Rules.** On a match, the AI is never called. |
| Understand free text: topics (fixed taxonomy), intensity, risk, summary, confidence | **AI** (Claude Haiku 5.5, structured JSON validated with zod) |
| Choose path A/B/C | Rules |
| Expert shortlist: hard filters (language, gender, topic, time) + weighted score → top 6 | Rules |
| Pick + order the best 3, with a reason each | **AI re-rank.** It can only reorder within the rule shortlist; IDs are validated. |
| 3-line expert brief (consented, editable) | **AI**, from tags + summary + preferences only, never the raw text |
| Second safety layer | AI flags risk conservatively ("when unsure, flag") |

Why AI is right here:
- People describe problems in messy free text, often Hinglish ("kaam ka pressure hai, neend nahi aa rahi"). A dropdown can't capture that.
- AI can explain each match in plain, human words, which builds trust.
- AI can summarise for the expert, so people don't have to repeat their story.

## How AI errors, sensitive data and human hand-off are handled

- **AI errors:** editable chips (every edit is logged). Confidence below 0.5, an 8s timeout, invalid output (one retry) or an API failure all fall back to rules; the journey always completes. The re-rank is validated: IDs must come from the shortlist, no duplicates, exactly 3. Reasons are grounded: code rejects any mention of topics or languages not in the profile, wrong years, or clinical words, and swaps in a template. No diagnosis or clinical labels anywhere.
- **Sensitive data:** anonymous (random ID, no login). The raw free text is never stored: no database column, not in browser storage. A scrubbed copy is held only in browser memory for the re-rank. The brief is shared only with consent, shown first, editable, PII-stripped, and safety-checked again. On a switch, the previous expert is never told why.
- **Human hand-off:**
  - Crisis goes straight to a 24x7 YourDOST expert, Tele-MANAS and 112.
  - A server-side safety gate blocks the re-rank and the brief for any flagged check-in.
  - In production, every flag is reviewed by a 24x7 expert.
  - The expert brief and the switch handover are hand-offs between people too.

## How success is measured (`/insights`, synthetic plus live)

- **North star: same expert at session 4.** About 47% of people who had session 1. It captures match quality and retention past the point where change usually starts.
- Session 2 booked: about 67% after session 1. Average "felt heard": about 4.0/5. Switch rate: about 19%. The top switch reasons are "didn't connect" and "style didn't suit me".
- Funnel: started → check-in done → next step shown → booked → session-1 feedback → session 2 booked.
- AI quality:
  - about 28% of check-ins have chips edited
  - about 5% fall back to rules for understanding
  - **AI re-rank vs fallback:** about 88% / 12%
  - the AI changes the rules' #1 pick about 35% of the time
  - about 77% of bookings share a brief
- Safety: flags by layer (rule list vs AI only). "Both" is 0 by design, because rules short-circuit the AI.
- Next experiment: A/B test "felt heard" and session-4 retention for AI-ranked vs rule-ranked matches.

## Assumptions and trade-offs

1. Rules for safety, eligibility and routing; AI for understanding, ranking within rules, and explaining.
2. Two safety layers, rules first. False positives are accepted; misses are the costly error.
3. Session 4 as the north star (from Task 2).
4. Anonymous session instead of login, to lower stigma and friction.
5. The expert brief is on by default, because "repeating my story" drives early dropout. It's clearly worded, easy to turn off, and shown before sharing.
6. The scrubbed free text lives in browser memory only: a privacy vs match-quality trade-off.
7. Placeholders: intro videos, the 10-minute intro call, the 24x7 "talk now" button, and bookings are all mocked.
8. All data is synthetic: 24 experts, 15 resources, about 420 past sessions.
9. The prototype has no database (in-memory storage on Vercel); live demo stats are partial. Production would use a database, with a clinical team owning the risk list and taxonomy.
10. Model: Claude Haiku 5.5 at low effort. Speed and cost matter more than depth for one-line outputs.
11. Matching relaxations: if fewer than 3 experts fit, relax time, then gender, then topic. Language is never relaxed, and the user is told what was relaxed.

## Walkthrough video (about 3 min)

Full script: `docs/WALKTHROUGH.md` in the repo. Outline:
1. **Setup (15s):** the problem and the rules-vs-AI idea.
2. **Riya (75s):** check-in → understood → 3 matches with AI reasons → booking screen with the brief (edit a line) → Expert view → timeline → fast-forward → "felt heard" = 2 → reason "style" → opposite-style match + free intro call + handover brief.
3. **Arjun (40s):** Hinglish → edit a chip (add "sleep") → Hindi-speaking practical experts.
4. **Crisis (20s):** lands on Get help now; the AI is never called.
5. **Insights (30s):** north star, funnel, switch reasons, AI re-rank vs fallback, safety by layer.
