"use client";
// Client-side journey state. Lives in sessionStorage (cleared when the tab closes).
// The raw free text is NEVER put here: it only exists in the check-in page's memory.
import type { Concern, Expert, Intensity, QuickAnswers, Resource } from "./taxonomy";
import { DEFAULT_ANSWERS } from "./taxonomy";

export type ExpertCard = Expert & { why: string; whySource: "ai" | "template"; score?: number; overlap?: Concern[] };
export type ResourceCard = Resource & { reason: string };

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
    explained?: boolean;
  };
  booking?: { expert: ExpertCard; slot: string; ref: string; session: number; intro?: boolean };
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

export async function api<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId: getSessionId(), ...body }),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function track(name: string, props: Record<string, string | number | boolean | null> = {}) {
  api("/api/event", { name, props }).catch(() => {});
}
