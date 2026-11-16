import { NextResponse } from "next/server";
import { z } from "zod";
import { choosePath } from "@/lib/route";
import { matchExperts, recommendResources } from "@/lib/match";
import { getExperts } from "@/data/experts";
import { RESOURCES } from "@/data/resources";
import { templateLine } from "@/lib/ai";
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
  const { matches, relaxed } = matchExperts(experts, { concerns, answers });
  const resources = recommendResources(RESOURCES, concerns, 3);

  await store.updateCheckin(checkinId, { chips: concerns, path: path.primary });
  await store.saveMatch({ checkin_id: checkinId, expert_ids: matches.map((m) => m.expert.id), chosen_expert_id: null });
  await store.logEvent(sessionId, "next_step_shown", {
    checkinId, path: path.primary, rule: path.rule, relaxed,
    chipsEdited: edits.added.length + edits.removed.length > 0,
  });

  return NextResponse.json({
    path,
    relaxed,
    experts: matches.map((m) => ({
      ...m.expert,
      score: m.score,
      overlap: m.overlap,
      why: templateLine(m.expert, concerns, answers.language), // replaced by /api/explain
      whySource: "template",
    })),
    resources: resources.map((r) => ({
      ...r,
      reason: `Picked because you mentioned ${r.concerns.find((c) => concerns.includes(c)) ?? "wanting to feel better"}.`,
    })),
  });
}
