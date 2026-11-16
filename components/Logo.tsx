export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#DDF1EE" />
      <path d="M8 21c3-1 4-4 7-4s4 2 9-1" stroke="#1F7A78" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="22.5" cy="11" r="3" fill="#E8836B" />
    </svg>
  );
}
