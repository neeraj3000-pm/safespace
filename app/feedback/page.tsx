"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, PageShell } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { ExpertCard } from "@/components/ExpertCard";
import { SWITCH_REASONS, type SwitchReason } from "@/lib/taxonomy";
import { api, loadJourney, saveJourney, type Journey, type ExpertCard as EC } from "@/lib/client";

const FACES = [
  { v: 1, f: "😞", l: "Not at all" },
  { v: 2, f: "🙁", l: "Not really" },
  { v: 3, f: "😐", l: "Somewhat" },
  { v: 4, f: "🙂", l: "Mostly" },
  { v: 5, f: "😊", l: "Completely" },
];

export default function Feedback() {
  const router = useRouter();
  const [j, setJ] = useState<Journey | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [reason, setReason] = useState<SwitchReason | null>(null);
  const [next, setNext] = useState<EC | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"ask" | "high" | "low" | "switch">("ask");

  useEffect(() => {
    const jj = loadJourney();
    if (!jj.booking) return router.replace("/start");
    setJ(jj);
  }, [router]);
  if (!j?.booking) return null;
  const e = j.booking.expert;
  const first = e.name.split(" ")[0];

  async function submitScore() {
    if (score == null) return;
    if (score >= 4) {
      setBusy(true);
      await api("/api/feedback", { checkinId: j!.checkinId, expertId: e.id, feltHeard: score, concerns: j!.concerns ?? [], answers: j!.answers });
      setBusy(false);
      setPhase("high");
    } else setPhase("low");
  }

  async function bookSession2() {
    setBusy(true);
    const slot = e.slots[1]?.label ?? e.slots[0].label;
    const res = await api<{ bookingRef: string }>("/api/book", { checkinId: j!.checkinId, expertId: e.id, slot, session: 2 });
    saveJourney({ booking: { expert: e, slot, ref: res.bookingRef, session: 2 } });
    router.push("/booked");
  }

  async function findSwitch() {
    if (!reason) return;
    setBusy(true);
    const res = await api<{ next: EC | null }>("/api/feedback", {
      checkinId: j!.checkinId, expertId: e.id, feltHeard: score, switchReason: reason,
      concerns: j!.concerns ?? [], answers: j!.answers, excludeIds: j!.excludeIds ?? [],
    });
    setBusy(false);
    setNext(res.next);
    saveJourney({ excludeIds: [...(j!.excludeIds ?? []), e.id], switchedFrom: e.id });
    setPhase("switch");
  }

  async function stay() {
    setBusy(true);
    await api("/api/feedback", { checkinId: j!.checkinId, expertId: e.id, feltHeard: score, concerns: j!.concerns ?? [], answers: j!.answers });
    setBusy(false);
    setPhase("high");
  }

  async function bookNew(ex: EC, slot: string, intro: boolean) {
    const res = await api<{ bookingRef: string }>("/api/book", { checkinId: j!.checkinId, expertId: ex.id, slot, session: 1, intro });
    saveJourney({ booking: { expert: ex, slot, ref: res.bookingRef, session: 1, intro } });
    router.push("/booked");
  }

  return (
    <PageShell className="pb-12">
      <p className="text-sm font-semibold text-teal">After your first session</p>

      {phase === "ask" && (
        <Card className="mt-3 p-6 sm:p-8 fade-up">
          <div className="flex items-center gap-3">
            <Avatar a={e.avatar} name={e.name} size={48} />
            <p className="text-muted">Your session with <b className="text-ink">{e.name}</b></p>
          </div>
          <h1 id="heard" className="mt-5 text-3xl font-extrabold">Did you feel heard?</h1>
          <p className="mt-1 text-muted">Only you and the YourDOST care team see this. {first} won&apos;t be told your score.</p>
          <div role="radiogroup" aria-labelledby="heard" className="mt-6 grid grid-cols-5 gap-2">
            {FACES.map((x) => (
              <button
                key={x.v}
                type="button"
                role="radio"
                aria-checked={score === x.v}
                aria-label={`${x.v}: ${x.l}`}
                onClick={() => setScore(x.v)}
                className={`flex flex-col items-center gap-1 rounded-2xl border py-3 min-h-20 transition ${score === x.v ? "bg-mint border-teal scale-105" : "bg-white border-line hover:border-teal-2"}`}
              >
                <span className="text-3xl" aria-hidden="true">{x.f}</span>
                <span className="text-[11px] sm:text-xs text-muted leading-tight text-center">{x.l}</span>
              </button>
            ))}
          </div>
          <Button className="mt-6 w-full sm:w-auto" disabled={score == null || busy} onClick={submitScore}>Continue</Button>
        </Card>
      )}

      {phase === "high" && (
        <Card className="mt-3 p-6 sm:p-8 fade-up">
          <h1 className="text-3xl font-extrabold">Great. Want to book session 2 with {first}?</h1>
          <p className="mt-2 text-muted">Keeping the same expert for a few sessions is when things usually start to shift.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button onClick={bookSession2} disabled={busy}>Book session 2 · {e.slots[1]?.label ?? e.slots[0].label}</Button>
            <Button variant="ghost" onClick={() => router.push("/")}>Maybe later</Button>
          </div>
        </Card>
      )}

      {phase === "low" && (
        <Card className="mt-3 p-6 sm:p-8 fade-up">
          <h1 className="text-3xl font-extrabold">Thanks for telling us.</h1>
          <p className="mt-2 text-lg">Switching is normal. Finding the right fit is part of the process.</p>
          <p className="mt-4 font-heading font-bold" id="why">What didn&apos;t feel right?</p>
          <div role="radiogroup" aria-labelledby="why" className="mt-3 grid sm:grid-cols-2 gap-2">
            {SWITCH_REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={reason === r.id}
                onClick={() => setReason(r.id)}
                className={`text-left min-h-12 px-4 rounded-2xl border font-semibold ${reason === r.id ? "bg-mint border-teal" : "bg-white border-line hover:border-teal-2"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button disabled={!reason || busy} onClick={findSwitch}>{busy ? "Finding someone…" : "Find me a better fit"}</Button>
            <Button variant="ghost" disabled={busy} onClick={stay}>I&apos;ll give {first} another go</Button>
          </div>
          <p className="mt-4 text-xs text-muted">{first} won&apos;t be told why you switched. We use it only to improve matching.</p>
        </Card>
      )}

      {phase === "switch" && (
        <div className="mt-3 fade-up">
          <h1 className="text-3xl font-extrabold">Here&apos;s who we&apos;d suggest next</h1>
          <p className="mt-2 text-muted">
            We took &ldquo;{SWITCH_REASONS.find((r) => r.id === reason)?.label.toLowerCase()}&rdquo; into account
            {reason === "style" && ` and looked for someone with a ${e.style === "listener" ? "more practical" : "more listening"} style`}.
          </p>
          {next ? (
            <div className="mt-6 grid md:grid-cols-[1fr_1fr] gap-5 items-start">
              <ExpertCard e={next} highlight="Your next best match" bookLabel="Book a full session" onBook={(s) => bookNew(next, s, false)} />
              <div className="p-6 rounded-[24px] bg-mint">
                <p className="text-xs font-bold uppercase tracking-wide text-teal">On us</p>
                <h2 className="mt-1 text-2xl font-extrabold text-teal-deep">Try a free 10-minute intro call first</h2>
                <p className="mt-2 text-teal-deep/80">A quick hello with {next.name.split(" ")[0]} to see if it clicks, before committing to a full session.</p>
                <Button className="mt-5 w-full" onClick={() => bookNew(next, next.slots[0].label, true)}>
                  Book free intro call · {next.slots[0].label}
                </Button>
              </div>
            </div>
          ) : (
            <Card className="mt-6 p-6">We couldn&apos;t find another match right now. A YourDOST care team member will reach out to help.</Card>
          )}
        </div>
      )}
    </PageShell>
  );
}
