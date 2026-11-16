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
| Match experts (hard filters + weighted score) | Rules | `lib/match.ts` |
| "Why we matched you" line | **AI**, grounded in profile fields + code check, template fallback | `lib/ai.ts` → `/api/explain` |
| Switch after a low "felt heard" | Rules: exclude current expert, boost the reason's dimension | `lib/match.ts`, `/api/feedback` |

The raw free text is never stored: it exists only in the check-in page's memory and inside the `/api/understand` request. The database has no column for it.

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

## Deploy (Vercel)

1. Push this folder to a GitHub repo and import it in Vercel (framework: Next.js, no settings changes).
2. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`.
3. Deploy. `/insights` shows `storage: supabase` when the tables are connected.

Model: `claude-haiku-5-5` (fast, cheap). Override with `ANTHROPIC_MODEL`.
