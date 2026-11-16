// Illustrated avatar (no stock photos of real people).
import type { Expert } from "@/lib/taxonomy";

export function Avatar({ a, size = 72, name }: { a: Expert["avatar"]; size?: number; name: string }) {
  const s = a.hairStyle;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" role="img" aria-label={`Illustration of ${name}`}>
      <rect width="80" height="80" rx="24" fill={a.bg} />
      {/* long hair behind */}
      {s === 0 && <path d="M18 44c0-18 8-28 22-28s22 10 22 28v22H18z" fill={a.hair} />}
      {s === 1 && <path d="M20 40c0-15 8-24 20-24s20 9 20 24v14H20z" fill={a.hair} />}
      {/* shoulders */}
      <path d="M14 80c2-14 12-20 26-20s24 6 26 20z" fill="#31572C" opacity=".85" />
      <rect x="35" y="50" width="10" height="12" rx="4" fill={a.skin} />
      {/* face */}
      <ellipse cx="40" cy="38" rx="13" ry="15" fill={a.skin} />
      {/* hair on top */}
      {s === 0 && <path d="M27 34c2-10 8-14 14-14s12 5 13 13c-6-1-12-4-15-9-3 5-7 8-12 10z" fill={a.hair} />}
      {s === 1 && <><path d="M27 33c1-9 7-14 13-14s12 5 13 13c-8 0-15-3-19-7-2 4-4 6-7 8z" fill={a.hair} /><circle cx="40" cy="17" r="6" fill={a.hair} /></>}
      {s === 2 && <path d="M26 38c-2-14 5-21 14-21s16 7 14 21c-2-6-4-9-6-10-5 2-12 2-17 0-2 1-4 4-5 10z" fill={a.hair} />}
      {s === 3 && <path d="M27 32c1-8 6-12 13-12s12 4 13 12c-4-3-9-4-13-4s-9 1-13 4z" fill={a.hair} />}
      {s === 4 && <><path d="M27 33c0-9 6-13 13-13s13 4 13 13c-3-4-8-5-13-5s-10 1-13 5z" fill={a.hair} /><path d="M30 46c3 5 6 7 10 7s7-2 10-7c0 6-4 10-10 10s-10-4-10-10z" fill={a.hair} opacity=".9" /></>}
      {s === 5 && <path d="M27 34c0-10 6-15 13-15s13 5 13 15l-3-5c-3-2-7-3-10-3s-7 1-10 3z" fill={a.hair} />}
      {/* features */}
      <circle cx="35" cy="39" r="1.6" fill="#132A13" />
      <circle cx="45" cy="39" r="1.6" fill="#132A13" />
      <path d="M36 45c2 2 6 2 8 0" stroke="#132A13" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
