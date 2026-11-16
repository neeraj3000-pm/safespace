# Next Step: a YourDOST prototype

Tell us what's on your mind, in your own words and any language. Next Step works out the most useful next step (talk to the right expert, start with a self-help tool, or get help right now) and explains why.

**All data is fictional.** Built for the YourDOST Senior PM take-home (Task 3).

## How it's built (rules vs AI)

| Step | Who decides | File |
|---|---|---|
| Strip names, phones, emails | Regex | `lib/pii.ts` |
| **Safety check (runs first; skips AI on match)** | Rules: EN / Hindi / Hinglish phrase list | `lib/safety.ts` |
| Understand free text → topics, intensity, risk, summary | **AI** (Claude, structured JSON + zod) | `lib/ai.ts` → `/api/understand` |
| Low confidence (<0.5), timeout (8s) or API error | Rules fallback to the person's own taps | `app/api/understand/route.ts` |
| Choose path A / B / C | Rules | `lib/route.ts` |
| Shortlist experts (hard filters + weighted score → top 6) | Rules | `lib/match.ts` |
| Pick + order the best 3, with a "why we matched you" reason each | **AI re-rank** (IDs must come from the 6, no duplicates; reasons grounded in profile fields + code check). Falls back to the rule top 3 + template reasons on failure, timeout or confidence < 0.5 | `lib/ai.ts` `rerank()` → `/api/rerank` (`lib/rerankFlow.ts`) |
| Switch after a low "felt heard" | Rules shortlist (exclude current expert, boost the reason's dimension) → AI re-rank with the switch reason | `lib/rerankFlow.ts`, `/api/feedback` |
| 3-line expert brief (consent toggle, on by default; the person sees and can edit it) | **AI** from chips + AI summary + preferences only (never the raw text); template fallback; PII stripped and safety-checked again on save | `lib/ai.ts` `brief()` → `/api/brief`, `/api/brief/save`, `/expert/brief/[id]` |
| Safety gate on every post-check-in AI call | Rules: flagged check-ins never get a re-rank or brief | `lib/guard.ts` |

The raw free text is never stored. A PII-scrubbed copy lives only in a browser JS variable (for the re-rank), so it is lost on reload and never written to storage or the database. Briefs are built without it.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

With no `ANTHROPIC_API_KEY` the app runs in **rules-only fallback mode**. With no Supabase tables it uses an **in-memory store**. Both are fine for a demo.

## Supabase

1. In the Supabase dashboard → SQL editor, paste and run `supabase/schema.sql`.
2. `npm run seed` (24 experts, 15 resources, ~420 synthetic past sessions for `/insights`).

## Deploy

Step-by-step for GitHub, Supabase and Vercel: see [`docs/DEPLOY.md`](docs/DEPLOY.md).

Model: `claude-haiku-5-5` (fast, cheap). Override with `ANTHROPIC_MODEL`.
