import Link from "next/link";
import { Eyebrow, LinkButton } from "@/components/ui";
import { AIBadge } from "@/components/AIBadge";
import { PORTFOLIO_URL, REPO_URL } from "@/components/Footer";
import { AI_MODEL_LABEL } from "@/lib/aiModel";

export const metadata = {
  title: "Under the hood · SafeSpace",
  description: "How SafeSpace uses the Claude API, where it deliberately doesn't, and the guardrails around every model call.",
};

const SPLIT: { step: string; owner: "Rules" | "Claude"; why: string }[] = [
  { step: "Remove names, phone numbers and emails", owner: "Rules", why: "Regex, before text goes anywhere, including Claude." },
  { step: "Safety screen (English, Hindi, Hinglish)", owner: "Rules", why: "Runs first. On a match, Claude is never called and the user goes straight to 24x7 help." },
  { step: "Understand free text → topics, intensity, risk, summary", owner: "Claude", why: "Messy, multilingual text is exactly what rules can't parse. Output is constrained to a fixed taxonomy." },
  { step: "Second safety layer", owner: "Claude", why: "Flags risk conservatively (\"when unsure, flag\") to catch what the phrase list misses." },
  { step: "Choose the path: expert, self-help or help now", owner: "Rules", why: "Routing must be predictable, auditable and owned by clinicians." },
  { step: "Hard filters + weighted score → shortlist of 6", owner: "Rules", why: "Eligibility (language, gender, topic, time) is never left to a model." },
  { step: "Pick the best 3 and explain each match", owner: "Claude", why: "Reads nuance the tags miss; can only reorder the shortlist, never add anyone." },
  { step: "3-line expert brief (with consent)", owner: "Claude", why: "Built from tags, the summary and preferences only, never the person's own words." },
];

const PRACTICES = [
  { t: "Structured outputs, validated twice", d: "Every call uses messages.parse with a zod schema sent as the output format, then a stricter local zod check. Topics are enum-constrained to the taxonomy; expert IDs to the shortlist." },
  { t: "Fast model, bounded latency", d: `${AI_MODEL_LABEL} at low effort, an 8-second timeout, and one retry only when the output fails validation. Speed matters more than depth for one-line outputs.` },
  { t: "Graceful degradation", d: "Timeout, API error, low confidence (< 0.5) or invalid output all fall back to rules or templates. The journey always completes, and the UI says honestly which one you got." },
  { t: "Grounding checks in code", d: "Match reasons are rejected if they name a topic or language that isn't in that expert's profile, get their years of experience wrong, or use clinical language." },
  { t: "Prompt-injection hygiene", d: "User text is wrapped in tags and the prompt treats it as content to analyse, never as instructions. Briefs never see the raw text at all." },
  { t: "Privacy by design", d: "No login, a random ID, and no database column for free text. A scrubbed copy lives only in browser memory for the re-rank. Edited briefs are re-scrubbed and re-checked for risk." },
];

const NEXT = [
  "An eval set of real-world Hinglish and code-mixed check-ins to measure topic accuracy and risk recall before any prompt change ships.",
  "An A/B test of Claude-ranked vs rule-ranked matches on \"felt heard\" and session-4 retention, the product's north star.",
  "A clinician-owned risk list and taxonomy, with every safety flag reviewed by a human on the 24x7 team.",
  "Summaries in the user's language (Hindi, Tamil, Bengali…), and a persistent database with expert-side accounts.",
];

const STACK = ["Next.js 15 (App Router)", "TypeScript", "Tailwind CSS v4", "Claude API · Anthropic TypeScript SDK", "zod", "Recharts", "Playwright (e2e)", "Vercel"];

const SNIPPET = `// lib/ai.ts: AI re-rank of the rules shortlist (excerpt)
const Wire = z.object({
  ranking: z.array(z.object({
    expert_id: z.enum(shortlistIds),   // can only pick from the 6 the rules allowed
    reason: z.string(),
  })),
  confidence: z.number(),
});
// Stricter local check: exactly 3 picks, no duplicates
const Strict = Wire.extend({
  ranking: Wire.shape.ranking.length(3).refine(noDuplicateIds),
});

const res = await client.messages.parse({
  model: "claude-haiku-5-5",
  max_tokens: 3000,
  system: RERANK_SYSTEM,          // grounding rules: profile fields only
  output_config: { effort: "low", format: zodOutputFormat(Wire) },
  messages: [{ role: "user", content: prompt }],
});

if (!Strict.safeParse(res.parsed_output).success) retryOnce();
if (confidence < 0.5) return ruleTop3WithTemplates();   // graceful fallback
// each reason must pass isGrounded(reason, expert), else a template is used`;

export default function UnderTheHood() {
  return (
    <div className="pb-4">
      {/* Intro */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-8 sm:pt-14">
        <Eyebrow>Case study · under the hood</Eyebrow>
        <h1 className="mt-4 text-[34px] leading-[1.08] sm:text-[52px] sm:leading-[1.05] font-semibold">
          How SafeSpace uses the Claude API, and where it deliberately doesn&apos;t
        </h1>
        <p className="mt-5 text-lg text-muted max-w-2xl">
          SafeSpace helps someone who&apos;s struggling find the single most useful next step: the right expert, a self-help tool, or help right now.
          It&apos;s a working prototype I designed and built end to end to explore one question: <i>how much should AI decide in a sensitive product, and how do you make it safe?</i>
        </p>
        <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[
            ["Role", "Product, design & build"],
            ["AI", "Claude API (3 features)"],
            ["Stack", "Next.js · TypeScript"],
            ["Status", "Prototype · fictional data"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-[12px] bg-white border border-line p-4">
              <dt className="text-muted">{k}</dt>
              <dd className="mt-1 font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <LinkButton href="/start">Try the live demo</LinkButton>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md font-medium min-h-12 px-6 text-[15px] bg-lime text-forest-deep border border-forest-deep/70 hover:bg-[#F2F99A]">
            View the code on GitHub ↗
          </a>
          <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md font-medium min-h-12 px-6 text-[15px] text-forest hover:bg-lime/70">
            More of my work ↗
          </a>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-16 sm:mt-20">
        <Eyebrow>The problem</Eyebrow>
        <h2 className="mt-3 text-[28px] sm:text-[36px] leading-tight font-semibold">People don&apos;t know what kind of help they need</h2>
        <ul className="mt-6 grid sm:grid-cols-3 gap-3">
          {[
            ["Wrong door", "Counsellor, self-help tool or something urgent? Most people can't tell, so they pick at random or don't start at all."],
            ["Lookalike profiles", "Choosing an expert from near-identical profiles feels like a lottery. A poor first match is the most common reason people quietly drop out."],
            ["Stigma + slow change", "Real change usually takes a few sessions. Without the right fit early, people leave before it has time to work."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-[12px] bg-white border border-line p-5">
              <h3 className="font-semibold text-lg">{t}</h3>
              <p className="mt-2 text-[15px] text-muted leading-relaxed">{d}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[16px] leading-relaxed">
          <b>Why AI fits:</b> people describe what they&apos;re going through in messy free text, often mixing languages: <i>&ldquo;kaam ka pressure hai, neend nahi aa rahi&rdquo;</i>
          {" "}(pressure at work, can&apos;t sleep). A dropdown can&apos;t capture that; a language model can. And it can explain each suggestion in plain words, which builds trust.
        </p>
      </section>

      {/* Rules vs Claude */}
      <section className="mt-16 sm:mt-20 bg-lime">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 sm:py-16">
          <Eyebrow>The core decision</Eyebrow>
          <h2 className="mt-3 text-[28px] sm:text-[36px] leading-tight font-semibold">Rules decide what must be predictable. Claude handles what rules can&apos;t.</h2>
          <ol className="mt-8 grid gap-2">
            {SPLIT.map((s, i) => (
              <li key={s.step} className="grid sm:grid-cols-[32px_1fr_auto] gap-x-4 gap-y-1 items-start bg-white rounded-[10px] border border-forest-deep/5 p-4">
                <span className="hidden sm:grid w-7 h-7 rounded-md bg-cream text-xs font-semibold place-items-center">{i + 1}</span>
                <div>
                  <p className="font-semibold">{s.step}</p>
                  <p className="text-[14.5px] text-muted mt-0.5">{s.why}</p>
                </div>
                <div className="sm:justify-self-end mt-1 sm:mt-0">
                  {s.owner === "Claude" ? <AIBadge /> : <AIBadge source="fallback" label="Rules" />}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Flow diagram */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-16 sm:mt-20">
        <Eyebrow>Request flow</Eyebrow>
        <h2 className="mt-3 text-[28px] sm:text-[36px] leading-tight font-semibold">One check-in, end to end</h2>
        <Flow />
      </section>

      {/* Practices */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-16 sm:mt-20">
        <Eyebrow>Claude API, done carefully</Eyebrow>
        <h2 className="mt-3 text-[28px] sm:text-[36px] leading-tight font-semibold">Every model call is validated, bounded and has a way out</h2>
        <ul className="mt-8 grid sm:grid-cols-2 gap-3">
          {PRACTICES.map((p) => (
            <li key={p.t} className="rounded-[12px] bg-white border border-line p-5">
              <h3 className="font-semibold text-lg">{p.t}</h3>
              <p className="mt-2 text-[15px] text-muted leading-relaxed">{p.d}</p>
            </li>
          ))}
        </ul>
        <figure className="mt-6 rounded-[12px] bg-forest-deep text-cream overflow-hidden">
          <figcaption className="px-5 py-3 border-b border-white/10 text-xs text-cream/60 flex items-center justify-between">
            <span>Simplified excerpt · lib/ai.ts</span>
            <AIBadge onDark label="Anthropic TS SDK" />
          </figcaption>
          <pre className="p-5 overflow-x-auto text-[12.5px] leading-relaxed"><code>{SNIPPET}</code></pre>
        </figure>
      </section>

      {/* Safety */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-16 sm:mt-20">
        <div className="rounded-[16px] bg-forest-deep text-cream p-6 sm:p-10">
          <Eyebrow light>Safety design</Eyebrow>
          <h2 className="mt-3 text-[28px] sm:text-[34px] leading-tight font-semibold">Two layers, rules first, and a gate on every later call</h2>
          <ul className="mt-6 grid sm:grid-cols-3 gap-3 text-[15px]">
            {[
              ["Layer 1: phrase list", "English, Devanagari and Hinglish phrases with whole-word matching. A match skips Claude entirely. False positives are accepted; misses are the costly error."],
              ["Layer 2: Claude", "The understanding prompt flags risk conservatively. Either layer sends the user to a calm help screen with a 24x7 expert, Tele-MANAS and 112."],
              ["Server-side gate", "Re-ranking and briefs are refused for any flagged check-in, and text a user adds later (like an edited brief) is re-screened."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-[12px] bg-white/[.06] border border-white/10 p-4">
                <p className="font-semibold text-lime">{t}</p>
                <p className="mt-1 text-cream/80 leading-relaxed">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Measuring */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-16 sm:mt-20 grid md:grid-cols-[1.1fr_1fr] gap-8 md:items-start">
        <div>
          <Eyebrow>Measuring it</Eyebrow>
          <h2 className="mt-3 text-[28px] sm:text-[36px] leading-tight font-semibold">North star: same expert at session 4</h2>
          <p className="mt-4 text-muted leading-relaxed">
            It captures both match quality and staying long enough for change to start. Supporting metrics track the funnel, &ldquo;felt heard&rdquo; scores,
            switch reasons, and AI quality: how often people edit Claude&apos;s topics, how often each feature falls back to rules, and how often Claude changes the rules&apos; top pick.
          </p>
          <LinkButton href="/insights" className="mt-6">Open the metrics dashboard</LinkButton>
          <p className="mt-2 text-xs text-muted">Seeded with ~420 synthetic sessions, plus live demo traffic.</p>
        </div>
        <div className="rounded-[12px] bg-white border border-line p-5">
          <h3 className="font-semibold text-lg">What I&apos;d do next</h3>
          <ul className="mt-3 space-y-3 text-[15px] text-muted leading-relaxed list-disc pl-5">
            {NEXT.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </div>
      </section>

      {/* Stack */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 mt-16 sm:mt-20">
        <Eyebrow>Built with</Eyebrow>
        <ul className="mt-4 flex flex-wrap gap-2">
          {STACK.map((s) => (
            <li key={s} className={`rounded-md px-3 py-1.5 text-sm border ${s.startsWith("Claude") ? "bg-forest-deep text-lime border-forest-deep" : "bg-white border-line"}`}>{s}</li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted rounded-[12px] bg-sand/60 p-4">
          <b className="text-forest-deep">Honest note:</b> SafeSpace is a portfolio prototype. Experts, bookings, intro videos and metrics are fictional,
          and storage is in-memory. It is not a medical service. The crisis numbers it shows are real Indian helplines.
          {" "}<Link href="/help-now" className="text-forest underline underline-offset-4">Get help now</Link>
        </p>
      </section>
    </div>
  );
}

function Flow() {
  const box = "rounded-[10px] border px-3 py-2.5 text-[14px] leading-snug";
  const rules = `${box} bg-white border-line`;
  const claude = `${box} bg-forest-deep text-cream border-forest-deep`;
  const user = `${box} bg-lime border-forest-deep/20`;
  const Arrow = () => <div className="flex justify-center text-muted text-lg leading-none py-1" aria-hidden="true">↓</div>;
  return (
    <div className="mt-8 grid md:grid-cols-[1fr_200px] gap-6 items-start" role="img" aria-label="Flow: user check-in, PII scrub, safety rules (on a match, go to help now), Claude understanding, user edits topics, rules route and shortlist six, Claude re-ranks three with reasons, user books with consent, Claude drafts a brief, expert view.">
      <div className="max-w-md">
        <div className={user}>Check-in: free text (any language) + quick taps</div><Arrow />
        <div className={rules}><b>Rules</b> · remove names, phones, emails</div><Arrow />
        <div className={rules}><b>Rules</b> · safety phrase list <span className="text-muted">→ match? straight to Help now, no AI</span></div><Arrow />
        <div className={claude}><b className="text-lime">Claude</b> · topics, intensity, risk, summary, confidence <span className="text-cream/60">→ risk? Help now</span></div><Arrow />
        <div className={user}>User reviews and edits the topic chips</div><Arrow />
        <div className={rules}><b>Rules</b> · choose path, filter + score experts → shortlist of 6</div><Arrow />
        <div className={claude}><b className="text-lime">Claude</b> · best 3, in order, with grounded reasons</div><Arrow />
        <div className={user}>User books, sees and edits the brief (consent on by default)</div><Arrow />
        <div className={claude}><b className="text-lime">Claude</b> · 3-line brief from tags + preferences → expert view</div>
      </div>
      <aside className="rounded-[12px] bg-white border border-line p-4 text-[14px] text-muted space-y-2">
        <p className="font-semibold text-forest-deep">Legend</p>
        <p className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-white border border-line" /> Deterministic rules</p>
        <p className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-forest-deep" /> Claude API call</p>
        <p className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-lime border border-forest-deep/20" /> The person, in control</p>
        <p className="pt-2 border-t border-line">Any Claude step can fail: each one falls back to rules or a template, and the UI labels it.</p>
      </aside>
    </div>
  );
}
