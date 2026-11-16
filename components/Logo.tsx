export function Logo({ size = 26, light = false }: { size?: number; light?: boolean }) {
  const c = light ? "#F9FFB2" : "#31572C";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      {/* two leaves forming a sheltering heart */}
      <path d="M16 28c-1-6-9-7-11-14-1.5-5 3-9 7-7 2.2 1.1 3.4 3.4 4 6z" fill={c} />
      <path d="M16 28c1-6 9-7 11-14 1.5-5-3-9-7-7-2.2 1.1-3.4 3.4-4 6z" fill={c} opacity=".78" />
      <circle cx="16" cy="6" r="2.4" fill={c} />
    </svg>
  );
}
