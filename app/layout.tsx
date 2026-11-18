import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans"; // self-hosted: no network needed at build time
import Link from "next/link";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";


const siteUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://safespace-beta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SafeSpace · AI-guided mental wellbeing (prototype)",
  description:
    "A portfolio prototype: say what's on your mind in any language, and Claude helps find your most useful next step, with safety rules always first. All data is fictional.",
  openGraph: {
    title: "SafeSpace · AI-guided mental wellbeing",
    description: "Prototype built with Next.js and the Claude API. Fictional experts and data.",
    images: [{ url: "/forest-lake.jpg", width: 2000, height: 1121 }],
  },
};
export const viewport: Viewport = { themeColor: "#FEFAE0", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col antialiased">
        <div role="note" className="bg-forest-deep text-lime text-center text-[12.5px] leading-tight px-4 py-1.5">
          Portfolio prototype · All experts, data and numbers are fictional · Not a medical service.{" "}
          <Link href="/under-the-hood" className="underline underline-offset-2 whitespace-nowrap">How it&apos;s built</Link>
        </div>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
