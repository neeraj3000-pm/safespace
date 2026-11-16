import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium min-h-12 px-6 text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const variants = {
  primary: "bg-forest text-white hover:bg-forest-deep",
  secondary: "bg-lime text-forest-deep border border-forest-deep/70 hover:bg-[#F2F99A]",
  ghost: "text-forest hover:bg-lime/70",
  accent: "bg-moss text-white hover:bg-forest",
};
type V = keyof typeof variants;

export function Button({ variant = "primary", className = "", ...p }: ComponentProps<"button"> & { variant?: V }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...p} />;
}
export function LinkButton({ variant = "primary", className = "", ...p }: ComponentProps<typeof Link> & { variant?: V }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...p} />;
}

export function Card({ className = "", children, ...p }: ComponentProps<"div">) {
  return (
    <div className={`bg-white rounded-[14px] border border-line/70 shadow-soft ${className}`} {...p}>
      {children}
    </div>
  );
}

export function Chip({
  selected, onClick, children, className = "", ...p
}: { selected?: boolean; onClick?: () => void; children: ReactNode; className?: string } & Omit<ComponentProps<"button">, "onClick">) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-11 px-4 rounded-md border text-[15px] font-medium transition-colors ${
        selected ? "bg-forest text-white border-forest" : "bg-white text-ink border-line hover:border-moss"
      } ${className}`}
      {...p}
    >
      {children}
    </button>
  );
}

export function Progress({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full" aria-label={`Step ${step} of ${total}`}>
      <div className="flex justify-between text-xs text-muted mb-2">
        <span>Step {step} of {total}</span>
      </div>
      <div className="h-2 rounded-full bg-sand overflow-hidden" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
        <div className="h-full bg-forest rounded-full transition-all duration-500" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}

/** Sticky bottom CTA on mobile, inline on desktop. */
export function StickyCTA({ children }: { children: ReactNode }) {
  return (
    <div className="fixed sm:static bottom-0 inset-x-0 z-20 bg-cream/95 sm:bg-transparent backdrop-blur sm:backdrop-blur-none border-t border-line sm:border-0 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:p-0 sm:mt-8">
      <div className="mx-auto max-w-[640px] flex flex-col sm:flex-row gap-2 sm:justify-end">{children}</div>
    </div>
  );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`inline-flex items-center gap-2 text-sm font-medium ${light ? "text-lime" : "text-forest-deep"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${light ? "bg-lime" : "bg-forest"}`} aria-hidden="true" />
      {children}
    </p>
  );
}

export function Blob({ className = "", color = "#F9FFB2" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <path fill={color} d="M45.3,-58.6C57.4,-47.2,64.6,-31.4,68.1,-14.6C71.6,2.2,71.3,20,63.4,33.4C55.5,46.8,40,55.8,23.6,61.9C7.2,68,-10.1,71.2,-26.4,66.4C-42.7,61.6,-58,48.8,-66.1,32.5C-74.2,16.2,-75.1,-3.6,-68.6,-19.9C-62.1,-36.2,-48.2,-49,-33.3,-59.6C-18.4,-70.2,-2.5,-78.6,12.3,-76.9C27.1,-75.2,33.2,-70,45.3,-58.6Z" transform="translate(100 100)" />
    </svg>
  );
}

export function PageShell({ children, narrow = true, className = "" }: { children: ReactNode; narrow?: boolean; className?: string }) {
  return <div className={`mx-auto w-full ${narrow ? "max-w-[640px]" : "max-w-6xl"} px-4 sm:px-6 pt-4 sm:pt-8 ${className}`}>{children}</div>;
}
