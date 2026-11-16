"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, PageShell } from "@/components/ui";
import { ExpertCard } from "@/components/ExpertCard";
import { api, loadJourney, saveJourney, track, type Journey, type ExpertCard as EC, type ResourceCard } from "@/lib/client";

const RELAX_COPY: Record<string, string> = {
  time: "your preferred time",
  gender: "your gender preference",
  topic: "an exact topic match",
};
const TYPE_ICON: Record<string, string> = { exercise: "🌿", quiz: "📝", program: "🗓️" };

export default function NextStep() {
  const router = useRouter();
  const [j, setJ] = useState<Journey | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const [openedRes, setOpenedRes] = useState<string | null>(null);

  useEffect(() => {
    const jj = loadJourney();
    if (!jj.nextStep) return router.replace("/start");
    setJ(jj);
    if (!jj.nextStep.explained && jj.nextStep.experts.length) {
      setExplaining(true);
      api<{ lines: Record<string, string>; source: Record<string, "ai" | "template"> }>("/api/explain", {
        concerns: jj.concerns ?? [], answers: jj.answers, expertIds: jj.nextStep.experts.map((e) => e.id),
      })
        .then((res) => {
          const experts = jj.nextStep!.experts.map((e) => ({ ...e, why: res.lines[e.id] ?? e.why, whySource: res.source[e.id] ?? e.whySource }));
          const updated = saveJourney({ nextStep: { ...jj.nextStep!, experts, explained: true } });
          setJ(updated);
        })
        .catch(() => {})
        .finally(() => setExplaining(false));
    }
  }, [router]);

  if (!j?.nextStep) return null;
  const ns = j.nextStep;

  async function book(e: EC, slot: string) {
    const res = await api<{ bookingRef: string }>("/api/book", { checkinId: j!.checkinId, expertId: e.id, slot, session: 1 });
    saveJourney({ booking: { expert: e, slot, ref: res.bookingRef, session: 1 } });
    router.push("/booked");
  }

  const expertsBlock = (
    <section aria-labelledby="pathA">
      <h2 id="pathA" className="sr-only">Talk to an expert</h2>
      {ns.relaxed.length > 0 && (
        <p className="mb-4 text-sm bg-sand/70 rounded-2xl px-4 py-3">
          We couldn&apos;t find three experts matching everything, so we relaxed {ns.relaxed.map((r) => RELAX_COPY[r]).join(" and ")}.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {ns.experts.map((e, i) => (
          <ExpertCard key={e.id} e={e} pending={explaining} highlight={i === 0 ? "Best match" : undefined} onBook={(s) => book(e, s)} />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Matched by rules (language, gender, topic, time, then a weighted score). The &ldquo;why&rdquo; line is written by AI from each expert&apos;s profile only.
      </p>
    </section>
  );

  const resourcesBlock = (compact = false) => (
    <section aria-labelledby="pathB">
      <h2 id="pathB" className="sr-only">Start on your own</h2>
      <ul className={`grid gap-3 ${compact ? "" : "md:grid-cols-3"}`}>
        {ns.resources.map((r: ResourceCard) => (
          <li key={r.id}>
            <Card className="p-5 h-full flex flex-col">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
                <span aria-hidden="true">{TYPE_ICON[r.type]}</span> {r.type} · {r.duration}
              </div>
              <h3 className="mt-2 text-lg font-extrabold leading-snug">{r.title}</h3>
              <p className="mt-1 text-[15px] text-muted">{r.description}</p>
              <p className="mt-3 text-sm bg-mint/60 text-teal-deep rounded-2xl px-3 py-2">{r.reason}</p>
              <div className="mt-auto pt-4">
                <Button variant="secondary" className="w-full" onClick={() => { setOpenedRes(r.id); track("resource_opened", { id: r.id }); }}>
                  {openedRes === r.id ? "Added to your plan ✓" : "Start"}
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );

  const primary = ns.path.primary;
  const firstName = (e?: EC) => e?.name.split(" ")[0];

  return (
    <PageShell narrow={false} className="pb-10">
      <div className="max-w-3xl fade-up">
        <p className="text-sm font-semibold text-teal">Your next step</p>
        {primary === "A" ? (
          <>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold">Talk to an expert who gets it</h1>
            <p className="mt-2 text-muted text-lg">
              Based on what you shared, a few conversations with the right person could really help.
              We&apos;d start with {firstName(ns.experts[0])}.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold">Start on your own, at your pace</h1>
            <p className="mt-2 text-muted text-lg">A few short tools picked for what you shared. An expert is always one tap away.</p>
          </>
        )}
      </div>

      <div className="mt-8">{primary === "A" ? expertsBlock : resourcesBlock()}</div>

      {primary === "B" && (
        <div className="mt-6 p-5 sm:p-6 rounded-[24px] bg-mint flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-teal-deep">Prefer to talk to an expert?</h2>
            <p className="text-teal-deep/80 text-[15px]">We&apos;ve already found three who fit you. No pressure, it&apos;s here when you want it.</p>
          </div>
          <Button onClick={() => { setShowSecondary(!showSecondary); track("secondary_path_opened", { path: "A" }); }} aria-expanded={showSecondary}>
            {showSecondary ? "Hide experts" : "Talk to an expert"}
          </Button>
        </div>
      )}
      {primary === "B" && showSecondary && <div className="mt-6">{expertsBlock}</div>}

      {primary === "A" && (
        <div className="mt-10">
          <button
            type="button"
            className="w-full sm:w-auto text-left flex items-center gap-2 font-heading font-bold text-teal min-h-11"
            aria-expanded={showSecondary}
            onClick={() => { setShowSecondary(!showSecondary); track("secondary_path_opened", { path: "B" }); }}
          >
            Not ready to talk yet? Start on your own instead <span aria-hidden="true">{showSecondary ? "▴" : "▾"}</span>
          </button>
          {showSecondary && <div className="mt-4">{resourcesBlock()}</div>}
        </div>
      )}

      <Card className="mt-10 p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-teal/20">
        <p className="text-[15px]"><b className="font-heading">Need help right now?</b> <span className="text-muted">Talk to someone 24x7, free and confidential.</span></p>
        <Link href="/help-now" className="font-heading font-bold text-teal underline underline-offset-4 min-h-11 inline-flex items-center">Get help now</Link>
      </Card>
    </PageShell>
  );
}
