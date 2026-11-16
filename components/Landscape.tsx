// Illustrated hillside scene (no stock photos): soft sky, clouds, rolling hill and a single tree.
export function Landscape({ className = "", fadeTop = true, tone = "day" }: { className?: string; fadeTop?: boolean; tone?: "day" | "dusk" }) {
  const sky = tone === "day" ? ["#E6F0EC", "#F4F4DA"] : ["#F3E9C6", "#E9EFC9"];
  return (
    <svg className={className} viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A8BE6A" />
          <stop offset="1" stopColor="#6E8F3A" />
        </linearGradient>
        <linearGradient id="hillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9D69B" />
          <stop offset="1" stopColor="#B3C47D" />
        </linearGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FEFAE0" stopOpacity="1" />
          <stop offset=".32" stopColor="#FEFAE0" stopOpacity="0" />
          <stop offset=".86" stopColor="#FEFAE0" stopOpacity="0" />
          <stop offset="1" stopColor="#FEFAE0" stopOpacity=".9" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="softer"><feGaussianBlur stdDeviation="1.2" /></filter>
      </defs>
      <rect width="1200" height="520" fill="url(#sky)" />
      {/* clouds */}
      <g fill="#FFFFFF" opacity=".92" filter="url(#soft)" className="drift">
        <g transform="translate(60 210)"><circle cx="60" cy="40" r="46" /><circle cx="120" cy="22" r="58" /><circle cx="190" cy="44" r="44" /><circle cx="250" cy="52" r="34" /><rect x="40" y="40" width="240" height="46" rx="23" /></g>
        <g transform="translate(860 150)"><circle cx="60" cy="50" r="40" /><circle cx="120" cy="30" r="56" /><circle cx="190" cy="48" r="46" /><circle cx="250" cy="60" r="34" /><rect x="30" y="50" width="250" height="44" rx="22" /></g>
        <g transform="translate(470 250)" opacity=".8"><circle cx="40" cy="30" r="28" /><circle cx="86" cy="18" r="36" /><circle cx="130" cy="32" r="26" /><rect x="20" y="28" width="130" height="28" rx="14" /></g>
      </g>
      {/* hills */}
      <path d="M0 400 C 200 360, 380 380, 560 392 S 920 360, 1200 372 V520 H0Z" fill="url(#hillFar)" />
      <path d="M0 470 C 260 450, 520 440, 760 400 S 1080 330, 1200 318 V520 H0Z" fill="url(#hill)" />
      <path d="M640 430 C 760 412, 860 398, 940 386" stroke="#C7B48A" strokeWidth="10" fill="none" opacity=".55" strokeLinecap="round" filter="url(#softer)" />
      {/* tree */}
      <g transform="translate(830 170)">
        <path d="M64 230 C 66 190, 60 160, 70 120 M68 160 C 50 140, 40 128, 30 118 M70 140 C 88 122, 100 112, 112 104" stroke="#3E3226" strokeWidth="9" fill="none" strokeLinecap="round" />
        <g fill="#31572C">
          <circle cx="70" cy="70" r="52" /><circle cx="22" cy="96" r="38" /><circle cx="120" cy="92" r="40" /><circle cx="64" cy="120" r="34" />
        </g>
        <g fill="#4F772D">
          <circle cx="44" cy="58" r="34" /><circle cx="104" cy="60" r="32" /><circle cx="76" cy="36" r="30" /><circle cx="134" cy="104" r="22" />
        </g>
        <g fill="#6E9440" opacity=".9"><circle cx="58" cy="40" r="16" /><circle cx="98" cy="44" r="14" /><circle cx="30" cy="80" r="14" /></g>
      </g>
      {fadeTop && <rect width="1200" height="520" fill="url(#fade)" />}
    </svg>
  );
}
