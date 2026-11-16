"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, PageShell, StickyCTA } from "@/components/ui";
import { Thinking } from "@/components/Thinking";
import { CONCERNS, type Concern } from "@/lib/taxonomy";
import { api, loadJourney, saveJourney, track, type Journey } from "@/lib/client";

export default function Understood() {
  const router = useRouter();
  const [j, setJ] = useState<Journey | null>(null);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [edits, setEdits] = useState<{ added: Concern[]; removed: Concern[] }>({ added: [], removed: [] });
  const [picker, setPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const jj = loadJourney();
    if (!jj.checkinId) return router.replace("/start");
    setJ(jj);
    setConcerns(jj.concerns ?? []);
    setEdits(jj.edits ?? { added: [], removed: [] });
  }, [router]);

  if (!j) return null;
  if (loading) return <Thinking label="Finding your next step…" />;

  function remove(c: Concern) {
    setConcerns((cs) => cs.filter((x) => x !== c));
    setEdits((e) => ({ added: e.added.filter((x) => x !== c), removed: e.added.includes(c) ? e.removed : [...e.removed, c] }));
    track("chip_removed", { chip: c, wasAI: !!j?.aiConcerns?.includes(c) });
  }
  function add(c: Concern) {
    setConcerns((cs) => [...cs, c]);
    setEdits((e) => ({ removed: e.removed.filter((x) => x !== c), added: e.removed.includes(c) ? e.added : [...e.added, c] }));
    track("chip_added", { chip: c });
    setPicker(false);
  }

  async function next() {
    setLoading(true);
    saveJourney({ concerns, edits });
    try {
      const res = await api<NonNullable<Journey["nextStep"]>>("/api/next-step", {
        checkinId: j!.checkinId, concerns, intensity: j!.intensity ?? "moderate", answers: j!.answers, edits,
      });
      saveJourney({ nextStep: res });
      router.push("/next-step");
    } catch {
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  }

  const fallback = j.usedFallback || !j.summary;
  const available = CONCERNS.filter((c) => !concerns.includes(c));

  return (
    <PageShell className="pb-40 sm:pb-10">
      <p className="text-sm font-semibold text-forest">Here&apos;s what we understood</p>
      <Card className="mt-3 p-6 sm:p-8 fade-up">
        {fallback ? (
          <>
            <h1 className="text-2xl font-semibold">We couldn&apos;t fully understand. Please pick what fits.</h1>
            <p className="mt-2 text-muted">We&apos;ve started with what you tapped. Add or remove anything below.</p>
          </>
        ) : (
          <h1 className="text-2xl sm:text-[28px] leading-snug font-semibold">{j.summary}</h1>
        )}

        <div className="mt-6">
          <p className="text-sm font-semibold text-muted mb-2">Topics</p>
          <ul className="flex flex-wrap gap-2" aria-label="Topics we picked up">
            {concerns.map((c) => (
              <li key={c}>
                <span className="inline-flex items-center gap-1 pl-4 pr-1 min-h-11 rounded-full bg-lime text-forest-deep font-semibold">
                  {c}
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    aria-label={`Remove ${c}`}
                    className="w-9 h-9 rounded-full grid place-items-center hover:bg-white/70 text-lg"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setPicker(!picker)}
                aria-expanded={picker}
                className="min-h-11 px-4 rounded-full border border-dashed border-forest/50 text-forest font-semibold hover:bg-lime/40"
              >
                + Add a topic
              </button>
            </li>
          </ul>
          {picker && (
            <div className="mt-3 p-3 rounded-xl bg-cream border border-line flex flex-wrap gap-2">
              {available.map((c) => (
                <button key={c} type="button" onClick={() => add(c)} className="min-h-10 px-3 rounded-full bg-white border border-line text-sm font-semibold hover:border-forest">
                  {c}
                </button>
              ))}
            </div>
          )}
          {concerns.length === 0 && <p className="mt-3 text-sm text-muted">No topics yet. That&apos;s okay, add one or continue and we&apos;ll suggest general support.</p>}
        </div>

        <p className="mt-6 text-[15px] text-muted bg-sand/60 rounded-xl px-4 py-3">
          Did we get this right? Edit anything that&apos;s off.
        </p>
      </Card>
      <p className="mt-4 text-xs text-muted text-center">
        {fallback ? "Understanding fell back to your own choices." : "Topics suggested by AI from what you wrote. You're in control of what we use."}
      </p>
      <StickyCTA>
        <Button onClick={next} className="w-full sm:w-auto">Looks right, show my next step</Button>
      </StickyCTA>
    </PageShell>
  );
}
