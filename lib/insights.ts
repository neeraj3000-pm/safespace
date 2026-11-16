import "server-only";
import { store } from "./store";
import { FUNNEL, SWITCH_LABEL } from "./history";

const FUNNEL_LABEL: Record<(typeof FUNNEL)[number], string> = {
  started: "Started",
  checkin_done: "Check-in done",
  next_step_shown: "Next step shown",
  booked: "Booked",
  feedback_s1: "Session 1 feedback",
  booked_s2: "Session 2 booked",
};

export async function computeInsights() {
  const { history, checkins, feedback, events, backend } = await store.loadAll();

  // Live sessions: distinct session ids per funnel event.
  const liveSessions: Record<string, Set<string>> = {};
  for (const e of events) (liveSessions[e.name] ??= new Set()).add(e.session_id);
  const live = (n: string) => liveSessions[n]?.size ?? 0;

  const funnel = FUNNEL.map((step) => {
    const h = history.filter((r) => r.reached.includes(step)).length;
    return { step: FUNNEL_LABEL[step], synthetic: h, live: live(step), total: h + live(step) };
  });

  const felt = [
    ...history.map((r) => r.felt_heard).filter((x): x is number => x != null),
    ...feedback.map((f) => f.felt_heard),
  ];
  const avgFeltHeard = felt.reduce((a, b) => a + b, 0) / Math.max(felt.length, 1);
  const feltDist = [1, 2, 3, 4, 5].map((s) => ({ score: String(s), count: felt.filter((x) => x === s).length }));

  const switches = [
    ...history.map((r) => r.switch_reason).filter((x): x is string => !!x),
    ...feedback.map((f) => f.switch_reason).filter((x): x is string => !!x),
  ];
  const switchByReason = Object.entries(SWITCH_LABEL).map(([id, label]) => {
    const c = switches.filter((s) => s === id).length;
    return { reason: label, count: c, pct: switches.length ? Math.round((c / switches.length) * 100) : 0 };
  });
  const switchRate = switches.length / Math.max(felt.length, 1);

  // North star: same expert at session 4 among people who had session 1 (synthetic history).
  const s1 = history.filter((r) => r.reached.includes("feedback_s1"));
  const sameS4 = s1.filter((r) => r.same_expert_s4).length / Math.max(s1.length, 1);
  const s2Rate = history.filter((r) => r.reached.includes("booked_s2")).length / Math.max(s1.length, 1);

  // Weekly trend of north star.
  const byWeek = new Map<string, { n: number; s: number }>();
  for (const r of s1) {
    const d = new Date(r.created_at);
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    const k = monday.toISOString().slice(5, 10);
    const w = byWeek.get(k) ?? { n: 0, s: 0 };
    w.n++;
    if (r.same_expert_s4) w.s++;
    byWeek.set(k, w);
  }
  const northStarTrend = [...byWeek.entries()].filter(([, w]) => w.n >= 8).sort().map(([week, w]) => ({ week, pct: Math.round((w.s / w.n) * 100) }));

  // AI quality.
  const histCheckins = history.filter((r) => r.reached.includes("checkin_done") && !r.risk_layer);
  const liveCheckins = checkins.filter((c) => !c.risk_layer);
  const liveEdited = new Set([...(liveSessions["chip_added"] ?? []), ...(liveSessions["chip_removed"] ?? [])]);
  const editedPct =
    (histCheckins.filter((r) => r.edited_chips).length + liveEdited.size) / Math.max(histCheckins.length + liveCheckins.length, 1);
  const fallbackPct =
    (histCheckins.filter((r) => r.used_fallback).length + liveCheckins.filter((c) => c.used_fallback).length) /
    Math.max(histCheckins.length + liveCheckins.length, 1);

  // AI re-rank vs fallback (synthetic + live events).
  const histRerank = history.filter((r) => r.rerank);
  const liveRerankAI = events.filter((e) => e.name === "rerank_used");
  const liveRerankFb = events.filter((e) => e.name === "rerank_fallback").length;
  const rerankAI = histRerank.filter((r) => r.rerank === "ai").length + liveRerankAI.length;
  const rerankTotal = histRerank.length + liveRerankAI.length + liveRerankFb;
  const rerankAIPct = rerankAI / Math.max(rerankTotal, 1);
  const changedTop =
    (histRerank.filter((r) => r.rerank_changed_top).length + liveRerankAI.filter((e) => e.props?.changedTop === true).length) /
    Math.max(rerankAI, 1);

  // Expert brief consent (synthetic + live).
  const histBooked = history.filter((r) => r.brief_shared !== null);
  const liveShared = events.filter((e) => e.name === "brief_shared").length;
  const liveDeclined = events.filter((e) => e.name === "brief_declined").length;
  const briefSharePct =
    (histBooked.filter((r) => r.brief_shared).length + liveShared) / Math.max(histBooked.length + liveShared + liveDeclined, 1);
  const handovers = events.filter((e) => e.name === "brief_shared" && e.props?.handover === true).length;

  // Safety.
  const flaggedRules = history.filter((r) => r.risk_layer === "rules").length + checkins.filter((c) => c.risk_layer === "rules").length;
  const flaggedAI = history.filter((r) => r.risk_layer === "ai").length + checkins.filter((c) => c.risk_layer === "ai").length;

  return {
    backend,
    liveSessionCount: live("started"),
    funnel,
    avgFeltHeard,
    feltDist,
    switchByReason,
    switchRate,
    sameS4,
    s2Rate,
    northStarTrend,
    editedPct,
    rerankAIPct,
    rerankTotal,
    changedTop,
    briefSharePct,
    handovers,
    fallbackPct,
    safety: [
      { layer: "Rule list (AI never called)", count: flaggedRules },
      { layer: "AI only (rules missed it)", count: flaggedAI },
      { layer: "Both", count: 0 },
    ],
    totalCheckins: histCheckins.length + liveCheckins.length + flaggedRules + flaggedAI,
  };
}
export type Insights = Awaited<ReturnType<typeof computeInsights>>;
