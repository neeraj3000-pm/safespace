/**
 * Rules shortlist (top 6) → AI re-rank (best 3 + reasons) → rule fallback.
 * Shared by /api/rerank and the switch flow in /api/feedback.
 */
import "server-only";
import { rerank, templateLine } from "./ai";
import { matchExperts, type MatchInput } from "./match";
import { getExperts } from "@/data/experts";
import { scrubPII } from "./pii";
import { store } from "./store";
import type { Concern, Expert, QuickAnswers, SwitchReason } from "./taxonomy";

export type RankedExpert = Expert & { why: string; whySource: "ai" | "template"; overlap: Concern[]; score: number };

export async function rankExperts(opts: {
  sessionId: string;
  checkinId: string;
  text: string;
  summary: string | null;
  concerns: Concern[];
  answers: QuickAnswers;
  excludeIds?: string[];
  switchReason?: SwitchReason;
  previousExpertId?: string;
  count?: number;
}): Promise<{ experts: RankedExpert[]; relaxed: string[]; source: "ai" | "fallback"; fallbackReason?: string }> {
  const all = getExperts();
  const previous = all.find((e) => e.id === opts.previousExpertId);
  const input: MatchInput = {
    concerns: opts.concerns,
    answers: opts.answers,
    excludeIds: opts.excludeIds,
    switchReason: opts.switchReason,
    previousExpert: previous,
    limit: 6,
  };
  const { matches, relaxed } = matchExperts(all, input);
  const count = opts.count ?? 3;

  const ai = await rerank({
    text: scrubPII(opts.text),
    summary: opts.summary ? scrubPII(opts.summary) : null,
    concerns: opts.concerns,
    answers: opts.answers,
    candidates: matches.map((m) => ({ ...m.expert, ruleScore: m.score })),
    switchReason: opts.switchReason,
    previousStyle: previous?.style,
  });

  const byId = new Map(matches.map((m) => [m.expert.id, m]));
  let experts: RankedExpert[];
  if (ai.ok) {
    experts = ai.items.slice(0, count).map((it) => {
      const m = byId.get(it.id)!;
      return { ...m.expert, overlap: m.overlap, score: m.score, why: it.reason, whySource: it.reasonSource };
    });
    await store.logEvent(opts.sessionId, "rerank_used", {
      checkinId: opts.checkinId,
      changedTop: ai.changedTop,
      confidence: ai.confidence,
      templatedReasons: ai.items.filter((i) => i.reasonSource === "template").length,
      switch: !!opts.switchReason,
    });
  } else {
    experts = matches.slice(0, count).map((m) => ({
      ...m.expert, overlap: m.overlap, score: m.score,
      why: templateLine(m.expert, opts.concerns, opts.answers.language), whySource: "template" as const,
    }));
    await store.logEvent(opts.sessionId, "rerank_fallback", { checkinId: opts.checkinId, reason: ai.reason, switch: !!opts.switchReason });
  }
  return { experts, relaxed, source: ai.ok ? "ai" : "fallback", fallbackReason: ai.ok ? undefined : ai.reason };
}
