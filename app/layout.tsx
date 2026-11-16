import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "SafeSpace · a YourDOST prototype",
  description: "A safe space to say what's on your mind. We'll help you find the most useful next step.",
};
export const viewport: Viewport = { themeColor: "#FEFAE0", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-dvh flex flex-col antialiased">
        <div role="note" className="bg-forest-deep text-lime text-center text-[12.5px] leading-tight px-4 py-1.5">
          Prototype for a YourDOST assignment. All data is fictional.
        </div>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
