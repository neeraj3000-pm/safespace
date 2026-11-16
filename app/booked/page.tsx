"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, PageShell, StickyCTA } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { Timeline } from "@/components/Timeline";
import { loadJourney, track, type Journey } from "@/lib/client";

export default function Booked() {
  const router = useRouter();
  const [j, setJ] = useState<Journey | null>(null);
  useEffect(() => {
    const jj = loadJourney();
    if (!jj.booking) return router.replace("/start");
    setJ(jj);
  }, [router]);
  if (!j?.booking) return null;
  const { expert: e, slot, ref, session, intro } = j.booking;
  const first = e.name.split(" ")[0];

  return (
    <PageShell className="pb-40 sm:pb-10">
      <div className="text-center fade-up">
        <div className="mx-auto w-16 h-16 rounded-full bg-mint grid place-items-center" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 30 30"><path d="M8 15.5l4.5 4.5L22 10" stroke="#1F7A78" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h1 className="mt-4 text-3xl font-extrabold">
          {intro ? "Your free intro call is booked" : session > 1 ? `Session ${session} is booked` : "You're booked in"}
        </h1>
        <p className="mt-1 text-muted">Booking ref {ref} · this is a mock booking</p>
      </div>

      <Card className="mt-6 p-5 flex items-center gap-4">
        <Avatar a={e.avatar} name={e.name} size={64} />
        <div>
          <p className="font-heading font-extrabold text-lg">{e.name}</p>
          <p className="text-sm text-muted">{e.credential}</p>
          <p className="mt-1 font-semibold">{slot} · {intro ? "10 min, free" : "50 min"}</p>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="text-xl font-extrabold">What to expect</h2>
        <Timeline current={session} />
        <p className="mt-6 rounded-2xl bg-mint text-teal-deep font-heading font-bold px-4 py-3">
          Change takes a few sessions, and that&apos;s normal.
        </p>
        <p className="mt-3 text-sm text-muted">
          If {first} doesn&apos;t feel like the right fit, you can switch anytime. It&apos;s free and no one will be offended.
        </p>
      </Card>

      <StickyCTA>
        {session === 1 ? (
          <Button
            variant="secondary"
            className="w-full sm:w-auto border-dashed"
            onClick={() => { track("fast_forward"); router.push("/feedback"); }}
          >
            ⏩ Fast-forward: I&apos;ve had my first session <span className="text-xs font-normal text-muted">(demo)</span>
          </Button>
        ) : (
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => router.push("/insights")}>
            See how the team tracks this (Insights)
          </Button>
        )}
      </StickyCTA>
    </PageShell>
  );
}
