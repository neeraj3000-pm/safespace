import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/store";
import { matchExperts } from "@/lib/match";
import { explain } from "@/lib/ai";
import { getExperts } from "@/data/experts";
import { AnswersSchema, ConcernList, SessionId } from "@/lib/schemas";
import { SWITCH_REASONS } from "@/lib/taxonomy";

const Body = z.object({
  sessionId: SessionId,
  checkinId: z.string(),
  expertId: z.string(),
  feltHeard: z.number().int().min(1).max(5),
  switchReason: z.enum(SWITCH_REASONS.map((s) => s.id) as [string, ...string[]]).optional(),
  concerns: ConcernList,
  answers: AnswersSchema,
  excludeIds: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { sessionId, checkinId, expertId, feltHeard, switchReason, concerns, answers, excludeIds } = parsed.data;

  if (!switchReason) {
    await store.saveFeedback({ checkin_id: checkinId, expert_id: expertId, felt_heard: feltHeard, switch_reason: null });
    await store.logEvent(sessionId, "feedback_s1", { checkinId, expertId, feltHeard });
    return NextResponse.json({ ok: true });
  }

  // Guilt-free switch: exclude current expert, boost the dimension behind the reason.
  await store.saveFeedback({ checkin_id: checkinId, expert_id: expertId, felt_heard: feltHeard, switch_reason: switchReason });
  await store.logEvent(sessionId, "switch_requested", { checkinId, expertId, reason: switchReason });

  const experts = getExperts();
  const previous = experts.find((e) => e.id === expertId);
  const { matches, relaxed } = matchExperts(experts, {
    concerns, answers,
    excludeIds: Array.from(new Set([expertId, ...excludeIds])),
    switchReason: switchReason as never,
    previousExpert: previous,
  });
  const next = matches[0];
  if (!next) return NextResponse.json({ ok: true, next: null });
  const ex = await explain({ concerns, answers, experts: [next.expert] });
  return NextResponse.json({
    ok: true,
    relaxed,
    next: { ...next.expert, overlap: next.overlap, why: ex.lines[next.expert.id], whySource: ex.source[next.expert.id] },
  });
}
