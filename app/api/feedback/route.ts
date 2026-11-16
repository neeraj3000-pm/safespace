import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/store";
import { rankExperts } from "@/lib/rerankFlow";
import { safetyGate, BLOCKED } from "@/lib/guard";
import { AnswersSchema, ConcernList, SessionId } from "@/lib/schemas";
import { SWITCH_REASONS, type SwitchReason } from "@/lib/taxonomy";

const Body = z.object({
  sessionId: SessionId,
  checkinId: z.string(),
  expertId: z.string(),
  feltHeard: z.number().int().min(1).max(5),
  switchReason: z.enum(SWITCH_REASONS.map((s) => s.id) as [string, ...string[]]).optional(),
  concerns: ConcernList,
  answers: AnswersSchema,
  excludeIds: z.array(z.string()).default([]),
  text: z.string().max(2000).default(""), // scrubbed text from browser memory, if still present
  summary: z.string().max(300).nullable().default(null),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { sessionId, checkinId, expertId, feltHeard, switchReason, concerns, answers, excludeIds, text, summary } = parsed.data;

  if (!switchReason) {
    await store.saveFeedback({ checkin_id: checkinId, expert_id: expertId, felt_heard: feltHeard, switch_reason: null });
    await store.logEvent(sessionId, "feedback_s1", { checkinId, expertId, feltHeard });
    return NextResponse.json({ ok: true });
  }

  // Guilt-free switch: exclude current expert, boost the dimension behind the reason.
  await store.saveFeedback({ checkin_id: checkinId, expert_id: expertId, felt_heard: feltHeard, switch_reason: switchReason });
  await store.logEvent(sessionId, "switch_requested", { checkinId, expertId, reason: switchReason });

  // Safety first: no AI re-rank for flagged users.
  if ((await safetyGate(sessionId, checkinId, [text])).blocked) return NextResponse.json(BLOCKED, { status: 403 });

  const res = await rankExperts({
    sessionId, checkinId, text, summary, concerns, answers,
    excludeIds: Array.from(new Set([expertId, ...excludeIds])),
    switchReason: switchReason as SwitchReason,
    previousExpertId: expertId,
    count: 1,
  });
  return NextResponse.json({ ok: true, relaxed: res.relaxed, rerank: res.source, next: res.experts[0] ?? null });
}
