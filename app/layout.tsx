import type { Metadata, Viewport } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", weight: ["600", "700", "800"] });
const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans" });

export const metadata: Metadata = {
  title: "Next Step · a YourDOST prototype",
  description: "Tell us what's on your mind. We'll help you find the most useful next step.",
};
export const viewport: Viewport = { themeColor: "#FBF7F1", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${nunitoSans.variable}`}>
      <body className="min-h-dvh flex flex-col antialiased">
        <div role="note" className="bg-teal-deep text-white text-center text-[12.5px] leading-tight px-4 py-1.5">
          Prototype for a YourDOST assignment. All data is fictional.
        </div>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
