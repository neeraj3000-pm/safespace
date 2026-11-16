const STEPS = [
  { s: "Session 1", t: "Getting to know each other", d: "Share as much or as little as you like. Your expert is listening and learning what matters to you." },
  { s: "Sessions 2–3", t: "Understanding patterns", d: "Together you'll notice what keeps showing up, and try one or two small things between sessions." },
  { s: "Around session 4", t: "Many people start to feel a shift", d: "Things often begin to feel a little lighter or clearer. Not fixed, just more manageable." },
];

export function Timeline({ current = 1 }: { current?: number }) {
  const activeIdx = current >= 4 ? 2 : current >= 2 ? 1 : 0;
  return (
    <ol className="relative mt-4 space-y-6">
      <span className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-sand" aria-hidden="true" />
      {STEPS.map((x, i) => (
        <li key={x.s} className="relative flex gap-4">
          <span
            className={`relative z-10 w-8 h-8 shrink-0 rounded-full grid place-items-center font-heading font-semibold text-sm ${
              i === activeIdx ? "bg-forest text-white ring-4 ring-lime" : i < activeIdx ? "bg-moss text-white" : "bg-white border-2 border-sand text-muted"
            }`}
          >
            {i + 1}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-forest">{x.s}</p>
            <p className="font-heading font-bold text-lg leading-snug">{x.t}</p>
            <p className="text-muted text-[15px]">{x.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
