"use client";
import { useEffect, useState } from "react";
import { BriefView } from "./BriefView";
import { loadJourney, track, type Brief } from "@/lib/client";
import { SWITCH_THIRD, type SwitchReason } from "@/lib/taxonomy";

export function LocalBrief({ id }: { id: string }) {
  const [b, setB] = useState<Brief | null | undefined>(undefined);
  useEffect(() => {
    setB(loadJourney().briefs?.[id] ?? null);
    track("brief_viewed_as_expert");
  }, [id]);
  if (b === undefined) return null;
  if (!b) return <div className="mx-auto max-w-[640px] px-4 pt-10 text-muted">This brief isn&apos;t available. It may have expired.</div>;
  return (
    <BriefView
      expertName={b.expertName}
      lines={b.lines}
      slot={b.slot}
      intro={b.intro}
      switchLabel={b.switchReason ? SWITCH_THIRD[b.switchReason as SwitchReason] : undefined}
      createdAt={b.createdAt}
    />
  );
}
