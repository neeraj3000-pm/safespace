// Marks every point where Claude acts, and says honestly when the rules fallback was used instead.
export function AIBadge({
  source = "ai", label, className = "", onDark = false,
}: { source?: "ai" | "fallback"; label?: string; className?: string; onDark?: boolean }) {
  const ai = source === "ai";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11.5px] font-semibold tracking-normal ${
        ai ? (onDark ? "bg-lime text-forest-deep" : "bg-forest-deep text-lime") : "bg-sand text-forest-deep"
      } ${className}`}
    >
      {ai ? <Spark /> : <span aria-hidden="true">⚙</span>}
      {label ?? (ai ? "Claude" : "Rules fallback")}
    </span>
  );
}

export function Spark({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 0l1.4 4.6L12 6 7.4 7.4 6 12 4.6 7.4 0 6l4.6-1.4z" fill="currentColor" />
    </svg>
  );
}
