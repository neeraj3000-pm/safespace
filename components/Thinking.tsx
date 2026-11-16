export function Thinking({ label }: { label: string }) {
  return (
    <div className="flex-1 grid place-items-center px-6 py-24" role="status" aria-live="polite">
      <div className="flex flex-col items-center text-center">
        <div className="relative w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-lime breathe" />
          <div className="absolute inset-5 rounded-full bg-moss/30 breathe" style={{ animationDelay: ".4s" }} />
          <div className="absolute inset-10 rounded-full bg-forest" />
        </div>
        <p className="mt-8 font-heading font-bold text-xl">{label}</p>
        <p className="mt-1 text-muted text-sm">Take a slow breath while we look.</p>
      </div>
    </div>
  );
}
