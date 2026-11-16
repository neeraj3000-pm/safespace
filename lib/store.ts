/**
 * Persistence. Writes to Supabase when the tables exist; otherwise falls back to an
 * in-memory store so the demo never breaks. Only tags, quick answers, paths and events
 * are stored, never the raw free text.
 */
import "server-only";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabase";
import { generateHistory, type HistoryRow } from "./history";

export type CheckinRow = {
  id: string;
  session_id: string;
  chips: string[];
  answers: Record<string, unknown>;
  intensity: string | null;
  path: string | null;
  confidence: number | null;
  used_fallback: boolean;
  risk_layer: "rules" | "ai" | null;
  created_at: string;
};
export type MatchRow = { checkin_id: string; expert_ids: string[]; chosen_expert_id: string | null };
export type FeedbackRow = { checkin_id: string; expert_id: string; felt_heard: number; switch_reason: string | null; created_at?: string };
export type EventRow = { session_id: string; name: string; props: Record<string, unknown>; created_at?: string };

const g = globalThis as unknown as {
  __mem?: { checkins: CheckinRow[]; matches: MatchRow[]; feedback: FeedbackRow[]; events: EventRow[] };
  __dbOk?: boolean;
};
const mem = (g.__mem ??= { checkins: [], matches: [], feedback: [], events: [] });

function db() {
  if (g.__dbOk === false) return null;
  return supabaseAdmin();
}
function markDbDown(err: unknown) {
  console.warn("[store] Supabase unavailable, using in-memory store:", (err as { message?: string })?.message ?? err);
  g.__dbOk = false;
}

async function insert<T extends object>(table: string, row: T, memList: T[]) {
  const c = db();
  if (c) {
    const { error } = await c.from(table).insert(row);
    if (!error) return;
    markDbDown(error);
  }
  memList.push(row);
}

export const store = {
  backend(): "supabase" | "memory" {
    return db() ? "supabase" : "memory";
  },

  async createCheckin(row: Omit<CheckinRow, "id" | "created_at">): Promise<string> {
    const full: CheckinRow = { ...row, id: randomUUID(), created_at: new Date().toISOString() };
    await insert("checkins", full, mem.checkins);
    return full.id;
  },

  async updateCheckin(id: string, patch: Partial<CheckinRow>) {
    const c = db();
    if (c) {
      const { error } = await c.from("checkins").update(patch).eq("id", id);
      if (!error) return;
      markDbDown(error);
    }
    const r = mem.checkins.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
  },

  async saveMatch(row: MatchRow) {
    await insert("matches", row, mem.matches);
  },

  async chooseExpert(checkinId: string, expertId: string) {
    const c = db();
    if (c) {
      const { error } = await c.from("matches").update({ chosen_expert_id: expertId }).eq("checkin_id", checkinId);
      if (!error) return;
      markDbDown(error);
    }
    mem.matches.filter((m) => m.checkin_id === checkinId).forEach((m) => (m.chosen_expert_id = expertId));
  },

  async saveFeedback(row: FeedbackRow) {
    await insert("feedback", { ...row, created_at: new Date().toISOString() }, mem.feedback);
  },

  async logEvent(sessionId: string, name: string, props: Record<string, unknown> = {}) {
    await insert("events", { session_id: sessionId, name, props, created_at: new Date().toISOString() }, mem.events);
  },

  /** Everything /insights needs. */
  async loadAll(): Promise<{ history: HistoryRow[]; checkins: CheckinRow[]; feedback: FeedbackRow[]; events: EventRow[]; backend: string }> {
    const c = db();
    if (c) {
      const [h, ch, fb, ev] = await Promise.all([
        c.from("history_sessions").select("*").limit(5000),
        c.from("checkins").select("*").limit(5000),
        c.from("feedback").select("*").limit(5000),
        c.from("events").select("session_id,name,props,created_at").limit(10000),
      ]);
      if (!ch.error && !fb.error && !ev.error) {
        return {
          history: !h.error && h.data?.length ? (h.data as HistoryRow[]) : generateHistory(),
          checkins: ch.data as CheckinRow[],
          feedback: fb.data as FeedbackRow[],
          events: ev.data as EventRow[],
          backend: "supabase",
        };
      }
      markDbDown(ch.error || fb.error || ev.error);
    }
    return { history: generateHistory(), checkins: mem.checkins, feedback: mem.feedback, events: mem.events, backend: "memory" };
  },
};
