import { LinkButton, Eyebrow } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import Image from "next/image";
import { getExperts } from "@/data/experts";
import { AIBadge, Spark } from "@/components/AIBadge";

const STEPS = [
  { icon: "✎", t: "Share what's going on", d: "Write a line or two in English, Hindi or Hinglish, or just tap a few options. No name needed." },
  { icon: "◎", t: "Check what we understood", d: "We reflect it back in plain words, with topic tags you can edit. You stay in control." },
  { icon: "➝", t: "Get your next step", d: "The right expert, a self-help tool to start with, or help right now, always with the reason why." },
];

const PIPELINE = [
  { ai: false, t: "Safety screen first", d: "A phrase list in English, Hindi and Hinglish runs before any AI. On a match, Claude is never called and you go straight to 24x7 help." },
  { ai: true, t: "Understand your words", d: "Claude maps free text, including Hinglish, to a fixed topic list, gauges intensity, flags risk conservatively and writes a one-line summary you can edit." },
  { ai: false, t: "Route & shortlist", d: "Rules choose the path, then filter experts on language, gender, topic and time, and score a shortlist of six." },
  { ai: true, t: "Re-rank & explain", d: "Claude picks the best three from that shortlist and explains each match using only the expert's profile. It can't add anyone." },
  { ai: true, t: "Brief your expert", d: "With your consent, Claude drafts a three-line handover from your topics and preferences, never your own words. You see and edit it first." },
  { ai: false, t: "Learn & switch", d: "\"Did you feel heard?\" after session one. A low score triggers a guilt-free switch, with the reason passed on so you don't start over." },
];

const STATS = [
  { n: "~1 min", t: "To your next step", d: "A short check-in, one question at a time." },
  { n: "3", t: "Experts, matched to you", d: "Language, timing and style first, with a clear reason for each." },
  { n: "Free", t: "Guilt-free switching", d: "Not the right fit? Switch anytime, with a free 10-minute intro call." },
  { n: "24x7", t: "Help when it's urgent", d: "Someone is always there, and we'll take you straight to them." },
];

const FAQ = [
  { q: "Is this anonymous?", a: "Yes. There's no login and no name. We use a random ID on your device. What you write is used to understand you and then discarded. We keep only topic tags and your quick answers." },
  { q: "How does SafeSpace use AI?", a: "It uses Claude, through the Claude API. Claude reads what you write, in your own words, and suggests topics and a one-line summary that you can edit. It then ranks a shortlist of eligible experts and explains each match, and (only if you agree) drafts a short note for your expert. Safety screening and eligibility are handled by fixed rules, never by AI." },
  { q: "Is this a real service?", a: "No. SafeSpace is a portfolio prototype. Every expert, booking and number is fictional, and no real sessions take place. The crisis numbers shown (Tele-MANAS 14416 and 112) are real Indian helplines." },
  { q: "What if I'm in crisis?", a: "If anything you share suggests you might be in danger, we skip recommendations and take you straight to 24x7 help: an on-call expert, Tele-MANAS (14416) or emergency services (112)." },
  { q: "What does my expert see?", a: "Only if you agree: a three-line summary built from your topics and preferences, never your own words. You see it, and can edit it, before anything is shared." },
  { q: "What if my first expert isn't right?", a: "That's normal. After your first session, we'll ask whether you felt heard. If not, switching is free and your new expert gets a handover, so you don't start over." },
];

export default function Landing() {
  const ex = getExperts();
  const match = ex[0];
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-14 text-center fade-up">
        <p className="inline-flex items-center gap-2 text-sm text-forest-deep/85 bg-white/70 border border-line rounded-full pl-1.5 pr-3 py-1">
          <AIBadge label="Claude API" /> AI-guided wellbeing support, with safety rules first
        </p>
        <h1 className="mt-4 mx-auto max-w-3xl text-[36px] leading-[1.08] sm:text-[60px] sm:leading-[1.04] font-semibold text-forest-deep">
          Not sure where to start? Let&apos;s find your next step.
        </h1>
        <p className="mt-5 mx-auto max-w-xl text-[17px] sm:text-lg text-muted">
          Tell us what&apos;s on your mind, in your own words and any language. We&apos;ll suggest the most useful next step and explain why.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
          <LinkButton href="/start" className="sm:px-8">Get started</LinkButton>
          <LinkButton href="/#how" variant="secondary">How it works</LinkButton>
        </div>
        <p className="mt-3 text-sm text-muted">Anonymous. Takes about a minute.</p>
      </section>

      <section className="mx-auto max-w-6xl w-full px-4 sm:px-6 mt-8 sm:mt-10">
        <div className="relative rounded-[16px] overflow-hidden h-[260px] sm:h-[500px]">
          <Image
            src="/forest-lake.jpg"
            alt="Misty pine forest reflected in a still lake"
            fill
            priority
            sizes="(min-width: 1152px) 1104px, 100vw"
            className="object-cover object-[50%_40%]"
          />
          {/* soft cream fade at the top, like the reference hero */}
          <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/10 via-35% to-transparent" aria-hidden="true" />
          <div className="hidden md:block absolute left-8 bottom-10 w-72 bg-white/95 backdrop-blur rounded-[12px] p-4 shadow-soft fade-up">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted">Here&apos;s what we understood</p>
              <AIBadge />
            </div>
            <p className="mt-1 text-[15px] font-semibold leading-snug">It sounds like work pressure is affecting your sleep.</p>
            <div className="mt-2 flex gap-1.5">
              <span className="text-xs bg-lime rounded-md px-2 py-1">work stress</span>
              <span className="text-xs bg-lime rounded-md px-2 py-1">sleep</span>
            </div>
          </div>
          <div className="hidden md:block absolute right-8 top-8 w-72 bg-white/95 backdrop-blur rounded-[12px] p-4 shadow-soft fade-up" style={{ animationDelay: ".15s" }}>
            <div className="flex items-center gap-3">
              <Avatar a={match.avatar} name={match.name} size={44} />
              <div>
                <p className="font-semibold leading-tight">{match.name}</p>
                <p className="text-xs text-muted">{match.credential}</p>
              </div>
            </div>
            <p className="mt-3 text-sm bg-lime/70 rounded-md px-3 py-2 text-forest-deep">
              <b>Why we matched you:</b> works with work stress and sleep, practical style.
            </p>
            <p className="mt-2 text-[11.5px] text-muted flex items-center gap-1.5"><AIBadge /> ranked from a rules shortlist</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-6xl w-full px-4 sm:px-6 mt-16 sm:mt-24 grid md:grid-cols-[1fr_2fr] gap-6">
        <Eyebrow>About SafeSpace</Eyebrow>
        <p className="text-[22px] sm:text-[30px] leading-snug font-medium tracking-[-0.02em] text-forest-deep">
          Most people don&apos;t know whether they need a counsellor, a self-help tool or help right now.
          SafeSpace listens to how <span className="text-moss">you</span> put it and suggests one clear next step, with the right expert for you.
        </p>
      </section>

      {/* Built on Claude */}
      <section id="ai" className="mx-auto max-w-6xl w-full px-4 sm:px-6 mt-16 sm:mt-24 scroll-mt-4">
        <div className="grid md:grid-cols-2 gap-6 md:items-end">
          <div>
            <Eyebrow>Built on the Claude API</Eyebrow>
            <h2 className="mt-3 text-[30px] sm:text-[40px] leading-tight font-semibold">AI where it helps. Rules where it must be predictable.</h2>
          </div>
          <p className="text-muted text-[16px] leading-relaxed">
            Claude understands messy, multilingual free text and explains its suggestions in plain words. Deterministic rules own safety,
            eligibility and routing, and every Claude output is schema-validated, grounded and has a fallback.
          </p>
        </div>
        <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PIPELINE.map((p, i) => (
            <li key={p.t} className={`rounded-[12px] p-5 border ${p.ai ? "bg-forest-deep text-cream border-forest-deep" : "bg-white border-line"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${p.ai ? "text-cream/60" : "text-muted"}`}>Step {i + 1}</span>
                {p.ai ? <AIBadge onDark /> : <AIBadge source="fallback" label="Rules" />}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{p.t}</h3>
              <p className={`mt-1.5 text-[14.5px] leading-relaxed ${p.ai ? "text-cream/80" : "text-muted"}`}>{p.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between rounded-[12px] bg-lime px-5 py-4">
          <p className="text-[15px] text-forest-deep flex items-start gap-2">
            <span className="mt-1"><Spark size={13} /></span>
            Structured outputs + zod validation · 8-second timeout with rules fallback · grounding checks on every reason · raw text never stored
          </p>
          <LinkButton href="/under-the-hood" className="shrink-0">See how it&apos;s built</LinkButton>
        </div>
      </section>

      {/* How it works: lime band */}
      <section id="how" className="mt-16 sm:mt-24 bg-lime scroll-mt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-3 text-[30px] sm:text-[40px] leading-tight font-semibold max-w-lg">Support shaped around how you&apos;re feeling</h2>
            </div>
            <LinkButton href="/start" className="self-start sm:self-auto">Start your check-in</LinkButton>
          </div>
          <ol className="mt-10 grid sm:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="bg-white rounded-[12px] p-6 border border-forest-deep/5">
                <span className="w-10 h-10 rounded-md bg-forest text-lime grid place-items-center text-lg" aria-hidden="true">{s.icon}</span>
                <p className="mt-6 text-xs text-muted">Step {i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-[15px] text-muted leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why: stats */}
      <section className="mx-auto max-w-6xl w-full px-4 sm:px-6 mt-16 sm:mt-24">
        <div className="grid md:grid-cols-2 gap-6 md:items-end">
          <div>
            <Eyebrow>Why SafeSpace</Eyebrow>
            <h2 className="mt-3 text-[30px] sm:text-[40px] leading-tight font-semibold">Real change happens when you feel understood</h2>
          </div>
          <p className="text-muted text-[16px] leading-relaxed">
            Stigma makes the first step hard, and change takes a few sessions. Most people start to feel a shift around session four. We focus on getting you to the right person, and helping you stay long enough for it to work.
          </p>
        </div>
        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <li key={s.t} className="bg-white rounded-[12px] border border-line p-6">
              <p className="text-sm text-muted">{s.t}</p>
              <p className="mt-6 text-[40px] font-semibold tracking-[-0.03em] text-forest-deep">{s.n}</p>
              <p className="mt-2 text-sm text-muted">{s.d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Privacy */}
      <section id="privacy" className="mx-auto max-w-6xl w-full px-4 sm:px-6 mt-16 sm:mt-24 scroll-mt-4">
        <div className="rounded-[16px] bg-forest-deep text-cream p-6 sm:p-10 grid md:grid-cols-[1fr_1.4fr] gap-8 md:items-center">
          <div>
            <Eyebrow light>Your privacy</Eyebrow>
            <h2 className="mt-3 text-[28px] sm:text-[34px] leading-tight font-semibold">Anonymous by design. Your words aren&apos;t stored.</h2>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 text-[15px]">
            {[
              ["No login, no name", "A random ID on your device is all we use."],
              ["Words in, tags out", "We keep topic tags and quick answers, never what you wrote."],
              ["You approve what's shared", "Your expert only sees a summary you've seen and agreed to."],
              ["Safety first", "If you might be at risk, we take you straight to 24x7 help."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-[12px] bg-white/[.06] border border-white/10 p-4">
                <p className="font-semibold text-lime">{t}</p>
                <p className="mt-1 text-cream/80">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl w-full px-4 sm:px-6 mt-16 sm:mt-24 scroll-mt-4">
        <div className="text-center">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-3 text-[30px] sm:text-[40px] leading-tight font-semibold">Everything you need to know before you start</h2>
        </div>
        <div className="mt-8 grid gap-2">
          {FAQ.map((f, i) => (
            <details key={f.q} open={i === 0} className="group rounded-[10px] border border-line bg-white open:bg-forest-deep open:text-cream open:border-forest-deep">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-5 min-h-14 font-medium">
                {f.q}
                <span className="text-xl transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="px-5 pb-5 text-[15px] leading-relaxed text-cream/85">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl w-full px-4 sm:px-6 mt-16 sm:mt-24">
        <div className="rounded-[16px] bg-forest-deep overflow-hidden grid md:grid-cols-2">
          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <h2 className="text-[30px] sm:text-[40px] leading-tight font-semibold text-cream">Take the first step toward real change</h2>
            <p className="mt-3 text-cream/75 max-w-md">Change takes a few sessions, and that&apos;s normal. Finding the right fit is part of the process.</p>
            <LinkButton href="/start" variant="secondary" className="mt-7 self-start border-lime">Find my next step</LinkButton>
          </div>
          <div className="relative min-h-[220px] md:min-h-[340px] m-3 md:m-4 rounded-[12px] overflow-hidden">
            <Image
              src="/forest-lake-sm.jpg"
              alt=""
              fill
              sizes="(min-width: 768px) 540px, 100vw"
              className="object-cover object-[50%_50%]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
