# SafeSpace: walkthrough script and build notes

## Personas to click (on `/start`, tick the box, then open "Try a demo persona")

- **Riya, 21:** student, English. Exam stress and night-time panic. Use her for the full journey and the switch.
- **Arjun, 29:** software engineer, Hinglish, Hindi-speaking expert. Use him to edit a chip.
- **Crisis case:** goes straight to Get help now. The AI is never called.

---

## 3-minute walkthrough script

**0:00–0:15 · Setup**
"YourDOST users often don't know whether they need a counsellor, a self-help tool or urgent help. When they do pick a counsellor, it's close to random. SafeSpace uses AI to understand people in their own words and recommend one clear next step, and it keeps rules in charge of safety and matching."

**0:15–1:30 · Riya, end to end (with a switch)**
1. Landing → *Get started*. "Anonymous, about a minute, and the free text isn't stored."
2. Consent → persona *Riya*. Her words are pre-filled: "Exams in 3 weeks, I can't focus and I keep panicking at night."
3. Quick taps (language, gender, life stage, time, style) → "Not sure yet" → *Find my next step*.
4. **Here's what we understood:** one plain sentence plus topic chips. "This is where we catch AI errors: the person can fix anything."
5. **Your next step:** three expert cards. "Rules shortlist six experts who pass every hard filter. AI reads what Riya actually said and picks and orders the best three. Each *Why we matched you* reason comes only from the expert's profile, and code rejects anything that isn't in it." Point at the Verified badge and the intro-video placeholder. The self-help path is one tap below.
6. *Book session* → **booking screen**: "Share a short summary with your expert so you don't have to repeat yourself" is on by default. "She sees exactly what will be shared, and it's built from her topics and preferences, never her own words." Tap *Edit* and tweak a line → *Confirm* → **See what Kavya sees** (Expert view, demo) → back → **What to expect** timeline: "Change takes a few sessions, and that's normal." That line is about dropout.
7. *Fast-forward: I've had my first session* → "Did you feel heard?" → **2**.
8. Reason: *Their style didn't suit me* → "Switching is normal…" → the next best match has the **opposite style** (rules, then AI re-rank with the switch reason) → "Your new expert will know what you've shared, so you won't start over." → *Book a free intro call* → the handover brief includes the switch reason → open the expert view: it's tagged **Handover from another expert**. "Guilt-free switching without repeating your story protects the north star."

**1:30–2:10 · Arjun in Hinglish (editing a chip)**
1. Persona *Arjun*: "Office mein bahut pressure hai, manager se problem, neend bhi nahi aa rahi."
2. On *Here's what we understood*, show the summary. Tap **+ Add a topic → sleep** (or remove one). "Every add or remove is logged. It's our AI-quality signal."
3. *Show my next step* → he's "ready to talk", so it goes straight to experts who speak **Hindi** with a practical style.

**2:10–2:30 · Crisis**
1. Persona *Crisis case* → submit → lands on **Get help now**: calm deep teal, a 24x7 YourDOST expert, Tele-MANAS 14416, 112.
2. "The rule list runs before the AI. On a match we never call the model and never show recommendations. The AI is a second safety net and flags conservatively."

**2:30–3:00 · Insights** (`/insights`)
- North star: **same expert at session 4** (~47%), with session 2 booked (~67%) and average "felt heard".
- Funnel from started → session 2 booked.
- Why people switch: "connect" and "style" dominate, so better matching on style is the next bet.
- AI quality: % of check-ins where people edited chips, the fallback rate, **AI re-rank vs rule fallback %**, how often the AI changed the #1 pick, and the % of bookings that shared a brief.
- Safety: flags by layer. "Both" is 0 by design, because rules short-circuit the AI.

---

## Assumptions and trade-offs (for the 2-page doc)

1. **Rules for safety and matching, AI for understanding and explaining.** Safety and hard filters must be predictable, auditable and owned by clinicians. The AI handles what rules can't: messy Hinglish free text, and a warm, human "why".
2. **Two safety layers, rules first.** A deterministic phrase list (English, Hindi, Hinglish) short-circuits the AI. The AI also flags risk conservatively ("when unsure, flag"). We accept false positives; a miss is the costly error.
3. **AI errors are visible and fixable.** The "Here's what we understood" chips are editable. Confidence below 0.5, an 8s timeout, an invalid output (one retry) or an API failure all fall back to the person's own taps, and the journey still completes. Edit and fallback rates are tracked.
4. **Grounded reasons.** The re-rank sees only structured profile fields and the bio. Code rejects any reason that mentions topics or languages missing from the profile, wrong years, or clinical words, and swaps in a template.
5. **North star = same expert at session 4.** It combines match quality ("felt heard") and retention past the point where many people start to feel a shift. Switching is guilt-free so that a bad first match doesn't become dropout.
6. **Anonymous session instead of login.** This lowers stigma and friction for a first step. We use a random ID in localStorage. We store only tags, quick answers, the path shown and events; the free text is never stored. Names, phones and emails are stripped before the AI sees the text.
7. **Placeholders:** intro videos, the free 10-minute intro call, the 24x7 "talk now" button and bookings are mocked.
8. **In production:** a human (a 24x7 YourDOST expert) reviews every flagged case. A clinical team owns the risk list and taxonomy. Match weights get tuned against "felt heard" and session-4 retention.
9. **Synthetic data:** 24 experts, 15 resources and ~420 past sessions (seeded, deterministic). Live demo sessions are added on top in `/insights`.
10. **Model:** Claude Haiku 5.5 (fast and cheap), at low effort, with JSON output validated by zod. Latency matters more than depth for a one-line summary.
11. **Matching relaxations:** if fewer than 3 experts pass, relax time, then gender, then the topic match. Language is never relaxed. The person is told what was relaxed.
12. **AI re-rank on top of rules, not instead of them.** Rules guarantee eligibility (language, gender, topic, time) and produce a shortlist of 6. AI can only reorder within it, so a bad AI output can never surface an ineligible expert. It's validated with zod (IDs from the shortlist, no duplicates, exactly 3), and it falls back to the rule top 3 on timeout, error or confidence < 0.5. Next step: A/B test "felt heard" and session-4 retention for AI-ranked vs rule-ranked matches.
13. **Expert brief with consent.** On by default, because it removes the "repeat your story" friction that drives early dropout. It's clearly worded, easy to switch off, and the person sees and can edit exactly what's shared. It's built from tags, the AI summary and preferences only (never the raw text). PII is stripped and the safety rules are re-run on any edits. On a switch, the new expert gets a handover with the reason; the previous expert is never told.
14. **Safety stays first.** The rule list runs before any AI. A server-side gate blocks the re-rank and the brief for any flagged check-in, including text flagged later in an edit.
15. **The scrubbed free text lives in browser memory only** (a JS variable, not storage), so the re-rank can use nuance like "panicking at night". After a reload, the re-rank works from tags and the summary only. This is a trade-off between privacy and match quality.
