export function BriefView(p: {
  expertName: string; lines: string[]; slot: string | null; intro: boolean; switchLabel?: string; edited?: boolean; createdAt: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 sm:px-6 pt-4 sm:pt-8">
      <span className="text-xs font-bold uppercase tracking-wide bg-ink text-white rounded-full px-2.5 py-1">Expert view (demo)</span>
      <div className="mt-4 rounded-[14px] bg-white border border-line/70 shadow-soft overflow-hidden">
        <div className="bg-sand/60 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted">YourDOST Expert Console · for {p.expertName}</p>
            <h1 className="font-heading font-semibold text-xl">Before your {p.intro ? "intro call" : "first session"}</h1>
          </div>
          {p.slot && <p className="text-sm font-semibold">{p.slot}</p>}
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-lime text-forest-deep font-bold px-2.5 py-1">Client: anonymous</span>
            {p.switchLabel && <span className="rounded-full bg-accent/15 text-accent-ink font-bold px-2.5 py-1">Handover from another expert</span>}
          </div>
          <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-muted">Shared summary</h2>
          <ol className="mt-2 space-y-3">
            {p.lines.map((l, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-forest text-white text-xs font-bold grid place-items-center">{i + 1}</span>
                <p className="text-[16px] leading-relaxed">{l}</p>
              </li>
            ))}
          </ol>
          {p.switchLabel && (
            <p className="mt-5 text-[15px] rounded-xl bg-cream border border-line px-4 py-3">
              <b>Why they switched:</b> {p.switchLabel}. The previous expert isn&apos;t told this. Please don&apos;t ask them to repeat their story.
            </p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-line text-xs text-muted space-y-1">
          <p>Shared by the client with consent{p.edited ? " and reviewed / edited by them" : " after they reviewed it"}. Built from topic tags, an AI summary and preferences only. Never their own words, never personal details.</p>
          <p>Not a clinical assessment. Use it as a starting point and check it with them in the session.</p>
        </div>
      </div>
    </div>
  );
}
