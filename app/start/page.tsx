"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, PageShell, StickyCTA } from "@/components/ui";
import { PERSONAS } from "@/lib/personas";
import { newSession, saveJourney, track } from "@/lib/client";

export default function Start() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [open, setOpen] = useState(false);

  function begin(personaId?: string) {
    newSession();
    const p = PERSONAS.find((x) => x.id === personaId);
    saveJourney({ persona: p?.id, answers: p ? p.answers : undefined, tappedChips: p ? p.chips : [] });
    track("started", { persona: p?.id ?? null });
    track("consent_given");
    if (p) track("persona_used", { persona: p.id });
    router.push(p ? `/check-in?persona=${p.id}` : "/check-in");
  }

  return (
    <PageShell className="pb-40 sm:pb-10">
      <div className="fade-up">
        <h1 className="text-3xl font-extrabold">Before we begin</h1>
        <p className="mt-2 text-muted">A quick, honest note on how this works.</p>

        <Card className="mt-6 p-6">
          <ul className="space-y-4">
            {[
              ["What we ask", "What's been on your mind (optional), plus a few quick taps: language, timings and the kind of support you prefer."],
              ["No name needed", "You stay anonymous. We use a random ID on this device only."],
              ["Your words aren't stored", "What you write is used to understand you, then discarded. We keep only topic tags and your quick answers."],
              ["Not for emergencies", null],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-1 w-5 h-5 shrink-0 rounded-full bg-mint text-teal grid place-items-center text-xs" aria-hidden="true">✓</span>
                <div>
                  <p className="font-heading font-bold">{t}</p>
                  <p className="text-muted text-[15px]">
                    {d ?? (
                      <>
                        If you&apos;re in danger or thinking of harming yourself, please{" "}
                        <Link href="/help-now" className="text-teal font-semibold underline underline-offset-4">get help now</Link>.
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <label className="mt-6 flex items-start gap-3 bg-cream rounded-2xl p-4 cursor-pointer min-h-11">
            <input type="checkbox" className="mt-1 w-5 h-5 accent-[#1F7A78]" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span className="text-[15px]">I understand, and I&apos;m happy to continue.</span>
          </label>
        </Card>

        <div className="mt-6 rounded-[20px] border border-dashed border-teal/40 bg-white/60">
          <button
            type="button"
            className="w-full flex items-center justify-between px-5 min-h-12 font-heading font-bold text-teal"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span>Try a demo persona</span>
            <span aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
          </button>
          {open && (
            <div className="px-5 pb-5 grid gap-2">
              <p className="text-sm text-muted">For reviewers: pre-fills the check-in so you can walk through a journey quickly.</p>
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={!agreed}
                  onClick={() => begin(p.id)}
                  className="text-left rounded-2xl border border-line bg-white px-4 py-3 hover:border-teal disabled:opacity-50"
                >
                  <span className="font-heading font-bold">{p.name}</span>{" "}
                  <span className="text-sm text-muted">· {p.blurb}</span>
                  <span className="block text-sm text-ink/80 mt-0.5 italic">“{p.text}”</span>
                </button>
              ))}
              {!agreed && <p className="text-xs text-muted">Tick the box above first.</p>}
            </div>
          )}
        </div>
      </div>
      <StickyCTA>
        <Button disabled={!agreed} onClick={() => begin()} className="w-full sm:w-auto">Continue</Button>
      </StickyCTA>
    </PageShell>
  );
}
