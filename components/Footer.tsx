import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-cream">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 pb-28 sm:pb-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm text-muted">
        <div>
          <p>
            Going through something hard right now?{" "}
            <Link href="/help-now" className="font-semibold text-teal underline underline-offset-4">Get help now</Link>
          </p>
          <p className="mt-1">Tele-MANAS 14416 · free, 24x7 · Emergency 112</p>
        </div>
        <div className="flex gap-4">
          <Link href="/insights" className="hover:text-ink">Internal insights</Link>
          <span>Next Step · YourDOST prototype</span>
        </div>
      </div>
    </footer>
  );
}
