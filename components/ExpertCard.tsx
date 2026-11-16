"use client";
import { useState } from "react";
import { Avatar } from "./Avatar";
import { Button, Card } from "./ui";
import { Modal } from "./Modal";
import { track, type ExpertCard as EC } from "@/lib/client";

export function ExpertCard({
  e, onBook, highlight, bookLabel = "Book session", pending,
}: { e: EC; onBook: () => void; highlight?: string; bookLabel?: string; pending?: boolean }) {
  const [video, setVideo] = useState(false);

  return (
    <Card className="p-5 flex flex-col h-full fade-up">
      {highlight && <p className="self-start text-xs font-bold uppercase tracking-wide bg-accent/15 text-accent-ink rounded-full px-2.5 py-1 mb-3">{highlight}</p>}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => { setVideo(true); track("intro_video_clicked", { expertId: e.id }); }}
          className="relative shrink-0 rounded-[14px]"
          aria-label={`Play intro video from ${e.name}`}
        >
          <Avatar a={e.avatar} name={e.name} size={80} />
          <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-soft grid place-items-center" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 1.5v9l7.5-4.5z" fill="#31572C" /></svg>
          </span>
        </button>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight">{e.name}</h3>
          <p className="text-sm text-muted">{e.credential} · {e.years_experience} yrs</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-forest bg-lime rounded-full px-2 py-0.5">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="6" fill="#31572C" /><path d="M3.3 6.2l1.8 1.7 3.6-3.7" stroke="#fff" strokeWidth="1.5" fill="none" /></svg>
            Verified
          </p>
        </div>
      </div>

      <div className={`mt-4 rounded-xl px-4 py-3 text-[15px] ${e.whySource === "ai" ? "bg-lime/70 text-forest-deep" : "bg-sand/70 text-ink"}`}>
        <p className="text-xs font-bold uppercase tracking-wide opacity-80">Why we matched you</p>
        <p className={`mt-0.5 ${pending ? "animate-pulse" : ""}`}>{e.why}</p>
      </div>

      <dl className="mt-4 grid gap-2 text-sm">
        <div><dt className="sr-only">Languages</dt><dd><span className="text-muted">Speaks </span>{e.languages.join(", ")}</dd></div>
        <div>
          <dt className="sr-only">Specialisations</dt>
          <dd className="flex flex-wrap gap-1.5">
            {e.specialisations.map((s) => (
              <span key={s} className={`text-xs rounded-full px-2 py-1 ${e.overlap?.includes(s) ? "bg-forest text-white" : "bg-cream border border-line"}`}>{s}</span>
            ))}
          </dd>
        </div>
        <div><dt className="sr-only">Style</dt><dd><span className="text-muted">Style: </span>{e.style === "listener" ? "Mostly listens" : "Practical steps"}</dd></div>
      </dl>

      <div className="mt-4">
        <p className="text-xs text-muted font-semibold">Next available</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {e.slots.slice(0, 3).map((s) => (
            <span key={s.label} className="text-xs bg-white border border-line rounded-full px-2.5 py-1">{s.label}</span>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-5">
        <Button onClick={onBook} className="w-full">{bookLabel}</Button>
      </div>

      <Modal open={video} onClose={() => setVideo(false)} title={`Meet ${e.name.split(" ")[0]}`}>
        <div className="aspect-video rounded-xl bg-lime grid place-items-center">
          <Avatar a={e.avatar} name={e.name} size={96} />
        </div>
        <p className="mt-4 font-heading font-bold">Intro videos coming soon</p>
        <p className="text-muted text-sm mt-1">A short hello from each expert, so you can get a feel for them before booking.</p>
        <p className="text-sm mt-3">{e.bio}</p>
      </Modal>

    </Card>
  );
}
