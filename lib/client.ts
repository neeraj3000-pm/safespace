"use client";
// Client-side journey state. Lives in sessionStorage (cleared when the tab closes).
// The free text is NEVER put here. A PII-scrubbed copy is kept only in a JS variable (memoryText)
// so the AI re-rank can use it. It survives in-app navigation, vanishes on reload, and is never persisted.
import type { Concern, Expert, Intensity, QuickAnswers, Resource } from "./taxonomy";
import { DEFAULT_ANSWERS } from "./taxonomy";

export type ExpertCard = Expert & { why: string; whySource: "ai" | "template"; score?: number; overlap?: Concern[] };
export type ResourceCard = Resource & { reason: string };

let _memText = "";
export const memoryText = {
  get: () => _memText,
  set: (t: string) => { _memText = t; },
};

export type Brief = { id: string; lines: string[]; expertName: string; slot: string; intro: boolean; switchReason?: string; createdAt: string };

export type Journey = {
  answers: QuickAnswers;
  tappedChips: Concern[];
  checkinId?: string;
  concerns?: Concern[];
  aiConcerns?: Concern[];
  summary?: string | null;
  intensity?: Intensity;
  usedFallback?: boolean;
  edits?: { added: Concern[]; removed: Concern[] };
  nextStep?: {
    path: { primary: "A" | "B" | "C"; secondary: "A" | "B" | "C" | null; rule: string };
    relaxed: string[];
    experts: ExpertCard[];
    resources: ResourceCard[];
    reranked?: boolean;
    rerankSource?: "ai" | "fallback";
  };
  booking?: { expert: ExpertCard; slot: string; ref: string; session: number; intro?: boolean; briefId?: string; handover?: boolean };
  pendingBooking?: { expert: ExpertCard; intro?: boolean; switchReason?: string };
  briefs?: Record<string, Brief>; // local copy so the demo expert view works even without a database
  excludeIds?: string[];
  switchedFrom?: string;
  persona?: string;
};

const KEY = "ns_journey";

export function getSessionId(): string {
  try {
    let id = localStorage.getItem("ns_sid");
    if (!id) {
      id = "anon_" + crypto.randomUUID().slice(0, 18);
      localStorage.setItem("ns_sid", id);
    }
    return id;
  } catch {
    return "anon_" + Math.random().toString(36).slice(2, 14);
  }
}

export function newSession() {
  try {
    localStorage.removeItem("ns_sid");
    sessionStorage.removeItem(KEY);
  } catch {}
  return getSessionId();
}

export function loadJourney(): Journey {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { answers: { ...DEFAULT_ANSWERS }, tappedChips: [] };
}

export function saveJourney(patch: Partial<Journey>): Journey {
  const next = { ...loadJourney(), ...patch };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export class SafetyBlock extends Error {}

export async function api<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId: getSessionId(), ...body }),
  });
  if (res.status === 403) throw new SafetyBlock("safety"); // safety gate: caller routes to /help-now
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function track(name: string, props: Record<string, string | number | boolean | null> = {}) {
  api("/api/event", { name, props }).catch(() => {});
}
