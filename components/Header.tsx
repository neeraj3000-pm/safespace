import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 rounded-xl" aria-label="Next Step home">
          <Logo />
          <span className="font-heading font-extrabold text-lg text-ink">Next Step</span>
          <span className="hidden sm:inline text-xs text-muted border border-line rounded-full px-2 py-0.5 ml-1">by YourDOST · prototype</span>
        </Link>
        <Link href="/help-now" className="text-sm font-semibold text-teal hover:text-teal-deep px-3 py-2 rounded-full min-h-11 inline-flex items-center">
          Get help now
        </Link>
      </div>
    </header>
  );
}
