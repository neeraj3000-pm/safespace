import { NextResponse } from "next/server";
import { z } from "zod";
import { choosePath } from "@/lib/route";
import { matchExperts, recommendResources } from "@/lib/match";
import { getExperts } from "@/data/experts";
import { RESOURCES } from "@/data/resources";
import { store } from "@/lib/store";
import { AnswersSchema, ConcernList, SessionId } from "@/lib/schemas";

const Body = z.object({
  sessionId: SessionId,
  checkinId: z.string(),
  concerns: ConcernList,
  intensity: z.enum(["low", "moderate", "high"]),
  answers: AnswersSchema,
  edits: z.object({ added: ConcernList, removed: ConcernList }).default({ added: [], removed: [] }),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { sessionId, checkinId, concerns, intensity, answers, edits } = parsed.data;

  const path = choosePath({ intensity, readiness: answers.readiness, riskFlag: false });
  const experts = getExperts();
  // Rule shortlist only; the final 3 + reasons come from /api/rerank (AI, with rule fallback).
  const { matches, relaxed } = matchExperts(experts, { concerns, answers, limit: 6 });
  const resources = recommendResources(RESOURCES, concerns, 3);

  await store.updateCheckin(checkinId, { chips: concerns, path: path.primary });
  await store.saveMatch({ checkin_id: checkinId, expert_ids: matches.slice(0, 3).map((m) => m.expert.id), chosen_expert_id: null });
  await store.logEvent(sessionId, "next_step_shown", {
    checkinId, path: path.primary, rule: path.rule, relaxed,
    chipsEdited: edits.added.length + edits.removed.length > 0,
  });

  return NextResponse.json({
    path,
    relaxed,
    experts: [], // filled by /api/rerank
    shortlistSize: matches.length,
    resources: resources.map((r) => ({
      ...r,
      reason: `Picked because you mentioned ${r.concerns.find((c) => concerns.includes(c)) ?? "wanting to feel better"}.`,
    })),
  });
}
