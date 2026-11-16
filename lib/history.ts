// Deterministic synthetic history (~400 past sessions) so /insights looks alive.
import { SWITCH_REASONS } from "./taxonomy";

export type HistoryRow = {
  id: string;
  created_at: string;
  reached: string[];
  path: "A" | "B" | "C" | null;
  felt_heard: number | null;
  switch_reason: string | null;
  same_expert_s4: boolean | null;
  edited_chips: boolean;
  used_fallback: boolean;
  risk_layer: "rules" | "ai" | null;
};

export const FUNNEL = ["started", "checkin_done", "next_step_shown", "booked", "feedback_s1", "booked_s2"] as const;

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function generateHistory(n = 420): HistoryRow[] {
  const r = rng(42);
  const rows: HistoryRow[] = [];
  const start = new Date("2026-10-01T00:00:00Z").getTime();
  for (let i = 0; i < n; i++) {
    const reached: string[] = ["started"];
    const created = new Date(start + r() * 45 * 86400000).toISOString();
    let path: HistoryRow["path"] = null;
    let felt: number | null = null;
    let sw: string | null = null;
    let s4: boolean | null = null;
    let risk: HistoryRow["risk_layer"] = null;
    const edited = r() < 0.27;
    const fallback = r() < 0.06;

    if (r() < 0.86) {
      reached.push("checkin_done");
      const rr = r();
      if (rr < 0.035) { risk = "rules"; path = "C"; }
      else if (rr < 0.05) { risk = "ai"; path = "C"; }
      if (!risk) {
        reached.push("next_step_shown");
        path = r() < 0.68 ? "A" : "B";
        // self-help users sometimes book later from the secondary option
        const bookP = path === "A" ? 0.62 : 0.18;
        if (r() < bookP) {
          reached.push("booked");
          if (r() < 0.82) {
            reached.push("feedback_s1");
            const x = r();
            felt = x < 0.05 ? 1 : x < 0.12 ? 2 : x < 0.25 ? 3 : x < 0.6 ? 4 : 5;
            if (felt <= 3 && r() < 0.7) {
              const y = r();
              sw = y < 0.38 ? "connect" : y < 0.64 ? "style" : y < 0.76 ? "language" : y < 0.92 ? "timing" : "other";
            }
            if (r() < (felt >= 4 ? 0.76 : 0.42)) {
              reached.push("booked_s2");
              s4 = !sw && r() < (felt >= 4 ? 0.88 : 0.4);
            } else s4 = false;
          }
        }
      }
    }
    rows.push({ id: `h${i}`, created_at: created, reached, path, felt_heard: felt, switch_reason: sw, same_expert_s4: s4, edited_chips: edited, used_fallback: fallback, risk_layer: risk });
  }
  return rows;
}

export const SWITCH_LABEL: Record<string, string> = Object.fromEntries(SWITCH_REASONS.map((s) => [s.id, s.label]));
