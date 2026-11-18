import Link from "next/link";
import { Logo } from "./Logo";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/under-the-hood", label: "Under the hood" },
  { href: "/insights", label: "Metrics" },
  { href: "/help-now", label: "Get help now" },
];

export function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 sm:h-20 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link href="/" className="flex items-center gap-2 rounded-md justify-self-start" aria-label="SafeSpace home">
          <Logo />
          <span className="font-heading font-semibold text-[19px] sm:text-[21px] tracking-[-0.03em] text-forest-deep">SafeSpace</span>
        </Link>
        <nav aria-label="Main" className="hidden md:flex items-center gap-7 text-[14.5px] text-forest-deep/85">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-forest-deep py-2">{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <Link href="/help-now" className="md:hidden whitespace-nowrap text-sm font-medium text-forest px-2 min-h-11 inline-flex items-center">
            Help now
          </Link>
          <Link href="/start" className="whitespace-nowrap inline-flex items-center rounded-md bg-forest text-white text-sm font-medium px-4 min-h-11 hover:bg-forest-deep">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
