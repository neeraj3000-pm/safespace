"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-auto w-[min(92vw,460px)] rounded-[24px] p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-sm shadow-soft"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 -mt-2 -mr-2 rounded-full hover:bg-cream text-xl">×</button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </dialog>
  );
}
