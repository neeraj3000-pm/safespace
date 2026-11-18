import Link from "next/link";
import { Logo } from "./Logo";

export const REPO_URL = "https://github.com/neeraj3000-pm/safespace";
export const PORTFOLIO_URL = "https://neeraj-portfolio-pm.vercel.app/";

export function Footer() {
  return (
    <footer className="mt-16 bg-forest-deep text-cream">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-28 sm:pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-8 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2" aria-label="SafeSpace home">
            <Logo light />
            <span className="font-heading font-semibold text-xl tracking-[-0.03em]">SafeSpace</span>
          </Link>
          <p className="text-sm text-cream/80">
            Going through something hard right now?{" "}
            <Link href="/help-now" className="font-semibold text-lime underline underline-offset-4">Get help now</Link>
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 py-8 text-sm">
          <div>
            <p className="text-cream/60 mb-3">Product</p>
            <ul className="space-y-2">
              <li><Link href="/#how" className="hover:text-lime">How it works</Link></li>
              <li><Link href="/start" className="hover:text-lime">Start a check-in</Link></li>
              <li><Link href="/#faq" className="hover:text-lime">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-cream/60 mb-3">Under the hood</p>
            <ul className="space-y-2">
              <li><Link href="/under-the-hood" className="hover:text-lime">How the AI works</Link></li>
              <li><Link href="/insights" className="hover:text-lime">Metrics dashboard</Link></li>
              <li><a href={REPO_URL} className="hover:text-lime" target="_blank" rel="noreferrer">Source on GitHub ↗</a></li>
              <li><a href={PORTFOLIO_URL} className="hover:text-lime" target="_blank" rel="noreferrer">Neeraj&apos;s portfolio ↗</a></li>
            </ul>
          </div>
          <div>
            <p className="text-cream/60 mb-3">Real help, 24x7 (India)</p>
            <ul className="space-y-2">
              <li><a href="tel:14416" className="hover:text-lime">Tele-MANAS 14416</a></li>
              <li><a href="tel:112" className="hover:text-lime">Emergency 112</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-white/10 text-xs text-cream/60 text-center space-y-1">
          <p>
            SafeSpace is a portfolio prototype designed and built by{" "}
            <a href={PORTFOLIO_URL} target="_blank" rel="noreferrer" className="text-lime underline underline-offset-2">Neeraj</a>{" "}
            with Next.js and the Claude API.
          </p>
          <p>All experts, data and metrics are fictional. It is not a medical service and doesn&apos;t provide therapy or diagnosis.</p>
        </div>
      </div>
    </footer>
  );
}
