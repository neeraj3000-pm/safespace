"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, PageShell, StickyCTA } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { SWITCH_REASONS } from "@/lib/taxonomy";
import { api, loadJourney, saveJourney, SafetyBlock, track, type Journey } from "@/lib/client";

type Draft = { lines: string[]; source: "ai" | "template" };

export default function Book() {
  const router = useRouter();
  const [j, setJ] = useState<Journey | null>(null);
  const [slot, setSlot] = useState<string>("");
  const [share, setShare] = useState(true); // consent: on by default, clearly worded, easy to turn off
  const [draft, setDraft] = useState<Draft | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [busy, setBusy] = useState(false);
  const requested = useRef(false);

  useEffect(() => {
    const jj = loadJourney();
    if (!jj.pendingBooking) return router.replace("/start");
    setJ(jj);
    setSlot(jj.pendingBooking.expert.slots[0]?.label ?? "");
  }, [router]);

  const pb = j?.pendingBooking;

  // Draft the brief only while consent is on. Inputs: chips + AI summary + preferences. Never the raw text.
  const loadBrief = useCallback(async () => {
    if (!j || !pb) return;
    setLoadingBrief(true);
    try {
      const res = await api<Draft>("/api/brief", {
        checkinId: j.checkinId, concerns: j.concerns ?? [], summary: j.summary ?? null,
        intensity: j.intensity, answers: j.answers, switchReason: pb.switchReason,
      });
      setDraft(res);
      setLines(res.lines);
    } catch (err) {
      if (err instanceof SafetyBlock) return router.push("/help-now?from=check-in");
      setShare(false);
    } finally {
      setLoadingBrief(false);
    }
  }, [j, pb, router]);

  useEffect(() => {
    if (share && j && !requested.current) {
      requested.current = true;
      loadBrief();
    }
  }, [share, j, loadBrief]);

  if (!j || !pb) return null;
  const e = pb.expert;
  const first = e.name.split(" ")[0];
  const edited = !!draft && lines.join("\n") !== draft.lines.join("\n");

  async function confirm() {
    setBusy(true);
    try {
      let briefId: string | undefined;
      if (share && lines.some((l) => l.trim())) {
        const saved = await api<{ id: string; lines: string[] }>("/api/brief/save", {
          checkinId: j!.checkinId, expertId: e.id, lines: lines.filter((l) => l.trim()), source: draft?.source ?? "template",
          edited, switchReason: pb!.switchReason ?? null, slot, intro: !!pb!.intro,
        });
        briefId = saved.id;
        if (edited) track("brief_edited");
        const briefs = { ...(j!.briefs ?? {}), [saved.id]: { id: saved.id, lines: saved.lines, expertName: e.name, slot, intro: !!pb!.intro, switchReason: pb!.switchReason, createdAt: new Date().toISOString() } };
        saveJourney({ briefs });
      } else {
        track("brief_declined", { handover: !!pb!.switchReason });
      }
      const res = await api<{ bookingRef: string }>("/api/book", { checkinId: j!.checkinId, expertId: e.id, slot, session: 1, intro: !!pb!.intro });
      saveJourney({
        booking: { expert: e, slot, ref: res.bookingRef, session: 1, intro: pb!.intro, briefId, handover: !!pb!.switchReason },
        pendingBooking: undefined,
      });
      router.push("/booked");
    } catch (err) {
      if (err instanceof SafetyBlock) return router.push("/help-now?from=check-in");
      setBusy(false);
      alert("Something went wrong. Please try again.");
    }
  }

  const switchLabel = SWITCH_REASONS.find((r) => r.id === pb.switchReason)?.label;

  return (
    <PageShell className="pb-44 sm:pb-10">
      <p className="text-sm font-semibold text-forest">{pb.intro ? "Book a free 10-minute intro call" : "Book your session"}</p>
      <Card className="mt-3 p-5 flex items-center gap-4 fade-up">
        <Avatar a={e.avatar} name={e.name} size={64} />
        <div>
          <h1 className="font-heading font-semibold text-xl">{e.name}</h1>
          <p className="text-sm text-muted">{e.credential} · {e.languages.join(", ")}</p>
        </div>
      </Card>

      {pb.switchReason && (
        <p className="mt-4 rounded-xl bg-lime text-forest-deep px-4 py-3 font-semibold">
          Your new expert will know what you&apos;ve shared, so you won&apos;t start over.
        </p>
      )}

      <section className="mt-6" aria-labelledby="slot-h">
        <h2 id="slot-h" className="font-heading font-bold text-lg">Pick a time</h2>
        <div role="radiogroup" aria-labelledby="slot-h" className="mt-3 grid sm:grid-cols-2 gap-2">
          {e.slots.map((s) => (
            <button
              key={s.label}
              type="button"
              role="radio"
              aria-checked={slot === s.label}
              onClick={() => setSlot(s.label)}
              className={`text-left min-h-12 px-4 rounded-xl border font-semibold ${slot === s.label ? "bg-lime border-forest" : "bg-white border-line hover:border-moss"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{pb.intro ? "10-minute call, free." : "50-minute video or audio session."} You can reschedule anytime.</p>
      </section>

      <Card className="mt-6 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <label htmlFor="share" className="cursor-pointer">
            <span className="block font-heading font-bold text-[17px]">Share a short summary with your expert so you don&apos;t have to repeat yourself.</span>
            <span className="block text-sm text-muted mt-1">
              Only {first} sees it. It&apos;s built from your topics and preferences, never your own words or any personal details. You can turn this off.
            </span>
          </label>
          <button
            id="share"
            type="button"
            role="switch"
            aria-checked={share}
            onClick={() => setShare(!share)}
            className={`relative shrink-0 w-14 h-8 rounded-full transition-colors ${share ? "bg-forest" : "bg-line"}`}
          >
            <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${share ? "translate-x-6" : ""}`} />
            <span className="sr-only">{share ? "On" : "Off"}</span>
          </button>
        </div>

        {share && (
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">Exactly what {first} will see{switchLabel ? " (handover)" : ""}:</p>
              {draft && (
                <button type="button" className="text-sm font-semibold text-forest min-h-11 px-2" onClick={() => setEditing(!editing)} aria-expanded={editing}>
                  {editing ? "Done" : "Edit"}
                </button>
              )}
            </div>
            {loadingBrief || !draft ? (
              <div className="mt-2 space-y-2 animate-pulse" role="status"><span className="sr-only">Writing your summary…</span>
                {[0, 1, 2].map((i) => <div key={i} className="h-5 rounded bg-sand/70" />)}
              </div>
            ) : editing ? (
              <div className="mt-2 grid gap-2">
                {lines.map((l, i) => (
                  <label key={i} className="block">
                    <span className="sr-only">Line {i + 1}</span>
                    <textarea
                      value={l}
                      maxLength={180}
                      rows={2}
                      onChange={(ev) => setLines(lines.map((x, k) => (k === i ? ev.target.value : x)))}
                      className="w-full rounded-xl border border-line bg-cream p-3 text-[15px] focus:outline-none focus:border-moss focus:ring-4 focus:ring-lime resize-none"
                    />
                  </label>
                ))}
                <p className="text-xs text-muted">Please don&apos;t add names or contact details. We remove them anyway.</p>
              </div>
            ) : (
              <ol className="mt-2 rounded-xl bg-cream border border-line p-4 space-y-2 text-[15px] list-decimal list-inside">
                {lines.map((l, i) => <li key={i}>{l}</li>)}
              </ol>
            )}
            {draft && <p className="mt-2 text-xs text-muted">{draft.source === "ai" ? "Drafted by AI from your topics and preferences." : "Drafted from your topics and preferences."}{edited ? " Edited by you." : ""}</p>}
          </div>
        )}
      </Card>

      <StickyCTA>
        <Button onClick={confirm} disabled={busy || !slot || (share && loadingBrief)} className="w-full sm:w-auto">
          {busy ? "Booking…" : pb.intro ? "Confirm free intro call" : "Confirm booking"}
        </Button>
      </StickyCTA>
    </PageShell>
  );
}
