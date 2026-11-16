"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@/lib/client";
import { Modal } from "@/components/Modal";

// Path C. Calm, deep forest (no alarming red). Never shows recommendations or matching.
export default function HelpNow() {
  const fromCheckin = useSearchParams().get("from") === "check-in";
  const [calling, setCalling] = useState(false);
  useEffect(() => track("help_now_viewed", { fromCheckin }), [fromCheckin]);

  return (
    <div className="flex-1 bg-forest-deep text-white -mb-16">
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-14 h-14 rounded-full bg-white/10 grid place-items-center breathe" aria-hidden="true">
          <div className="w-6 h-6 rounded-full bg-lime" />
        </div>
        <h1 className="mt-6 text-3xl sm:text-4xl font-semibold leading-tight">
          {fromCheckin ? "Thank you for sharing that with us." : "Help is here, right now."}
        </h1>
        <p className="mt-3 text-lg text-white/85">
          {fromCheckin
            ? "It sounds like things are really heavy right now. You deserve support straight away, from a real person."
            : "If things feel like too much, you can talk to someone right now. It's free and confidential."}
        </p>

        <div className="mt-8 grid gap-3">
          <button
            type="button"
            onClick={() => setCalling(true)}
            className="w-full text-left rounded-[14px] bg-white text-forest-deep p-5 min-h-16 hover:bg-lime transition-colors"
          >
            <span className="block font-heading font-semibold text-xl">Talk to a YourDOST expert now</span>
            <span className="block text-sm opacity-80">Available 24x7 · usually connects in under 2 minutes</span>
          </button>

          <a href="tel:14416" className="block rounded-[14px] bg-white/10 border border-white/20 p-5 hover:bg-white/15">
            <span className="block font-heading font-semibold text-xl">Tele-MANAS: 14416</span>
            <span className="block text-sm text-white/80">or 1-800-891-4416 · free, 24x7, many Indian languages</span>
          </a>

          <a href="tel:112" className="block rounded-[14px] bg-white/10 border border-white/20 p-5 hover:bg-white/15">
            <span className="block font-heading font-semibold text-xl">Emergency: 112</span>
            <span className="block text-sm text-white/80">If you or someone else is in immediate danger</span>
          </a>
        </div>

        <p className="mt-10 font-heading font-bold text-2xl text-lime">You don&apos;t have to go through this alone.</p>
        <p className="mt-2 text-white/75">
          If you can, tell someone you trust how you&apos;re feeling, and stay with them for now.
        </p>
      </div>

      <Modal open={calling} onClose={() => setCalling(false)} title="Connecting you…">
        <p className="text-muted">This is a prototype, so no call is placed.</p>
        <p className="mt-2">In the real product, a YourDOST expert would join a call or chat within minutes. Flagged check-ins are also reviewed by the 24x7 care team.</p>
        <p className="mt-4 font-semibold">For real help now, call Tele-MANAS on <a className="text-forest underline" href="tel:14416">14416</a>.</p>
      </Modal>
    </div>
  );
}
