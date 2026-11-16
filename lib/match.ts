/**
 * MATCHING: deterministic rules (not AI).
 * Hard filters first, then a transparent weighted score. AI only *explains* the result.
 */
import type { Concern, Expert, QuickAnswers, SwitchReason, LifeStage } from "./taxonomy";

export const WEIGHTS = {
  concernOverlap: 40,
  lifeStage: 20,
  style: 15,
  feltHeard: 15,
  newExpertBoost: 10,
} as const;

export type MatchInput = {
  concerns: Concern[];
  answers: QuickAnswers;
  excludeIds?: string[];
  switchReason?: SwitchReason;
  previousExpert?: Expert;
};

export type ScoredExpert = {
  expert: Expert;
  score: number;
  overlap: Concern[];
  breakdown: Record<string, number>;
};

export type MatchResult = { matches: ScoredExpert[]; relaxed: ("time" | "gender" | "topic")[] };

export function matchExperts(experts: Expert[], input: MatchInput): MatchResult {
  const { answers, excludeIds = [], switchReason, previousExpert } = input;
  const concerns: Concern[] = input.concerns.filter((c) => c !== "other");
  const maxBookings = Math.max(...experts.map((e) => e.bookings_count));

  const filters = {
    language: (e: Expert) => e.languages.includes(answers.language),
    gender: (e: Expert) => answers.gender === "no preference" || e.gender === answers.gender,
    topic: (e: Expert) => concerns.length === 0 || e.specialisations.some((s) => concerns.includes(s)),
    time: (e: Expert) => e.slots.some((s) => s.time === answers.time),
  };

  // Fallback order when fewer than 3 pass: relax time, then gender, then (last resort) topic.
  // A "timing" switch relaxes time up front. Language is never relaxed.
  const relaxOrder: ("time" | "gender" | "topic")[] = ["time", "gender", "topic"];
  const relaxed: ("time" | "gender" | "topic")[] = switchReason === "timing" ? ["time"] : [];

  const pool = experts.filter((e) => !excludeIds.includes(e.id));
  const passing = () =>
    pool.filter(
      (e) =>
        filters.language(e) &&
        (relaxed.includes("gender") || filters.gender(e)) &&
        (relaxed.includes("topic") || filters.topic(e)) &&
        (relaxed.includes("time") || filters.time(e)),
    );

  let candidates = passing();
  for (const r of relaxOrder) {
    if (candidates.length >= 3) break;
    if (!relaxed.includes(r)) relaxed.push(r);
    candidates = passing();
  }

  // Style preference; on a "style" switch, flip to the other style from the last expert.
  const wantedStyle =
    switchReason === "style" && previousExpert
      ? previousExpert.style === "listener" ? "practical" : "listener"
      : answers.style;

  const scored = candidates.map((e) => {
    const overlap = e.specialisations.filter((s) => concerns.includes(s));
    const b: Record<string, number> = {
      concernOverlap: concerns.length ? (WEIGHTS.concernOverlap * overlap.length) / Math.min(concerns.length, 3) : WEIGHTS.concernOverlap / 2,
      lifeStage: e.life_stages.includes(answers.lifeStage as LifeStage) ? WEIGHTS.lifeStage : 0,
      style: e.style === wantedStyle ? WEIGHTS.style : 0,
      feltHeard: (WEIGHTS.feltHeard * (e.avg_felt_heard - 3.2)) / 1.6,
      newExpertBoost: WEIGHTS.newExpertBoost * (1 - e.bookings_count / maxBookings),
    };
    b.concernOverlap = Math.min(b.concernOverlap, WEIGHTS.concernOverlap);

    // Switch boosts: lean into the dimension behind the reason.
    if (switchReason === "connect") b.switchBoost = b.feltHeard; // doubles felt-heard weight
    if (switchReason === "style") b.switchBoost = b.style; // doubles style weight
    // Language: favour experts comfortable in more than one shared language (e.g. Hindi + regional).
    if (switchReason === "language") b.switchBoost = Math.min(e.languages.length - 1, 3) * 5;
    if (switchReason === "timing") b.switchBoost = Math.min(e.slots.length, 4) * 3;

    const score = Object.values(b).reduce((a, v) => a + v, 0);
    return { expert: e, score: Math.round(score * 10) / 10, overlap, breakdown: b };
  });

  scored.sort((a, b) => b.score - a.score);
  return { matches: scored.slice(0, 3), relaxed: relaxed.filter((r) => switchReason !== "timing" || r !== "time") };
}

export function recommendResources<T extends { concerns: Concern[] }>(resources: T[], concerns: Concern[], n = 3): T[] {
  const ranked = resources
    .map((r) => ({ r, s: r.concerns.filter((c) => concerns.includes(c)).length - r.concerns.indexOf(concerns[0]) * 0.01 }))
    .sort((a, b) => b.s - a.s);
  const out = ranked.filter((x) => x.s > 0).slice(0, n).map((x) => x.r);
  // Always return at least 2: pad with general check-ins.
  for (const r of resources) {
    if (out.length >= 2) break;
    if (!out.includes(r) && r.concerns.includes("other")) out.push(r);
  }
  return out;
}
