import { NextResponse } from "next/server";
import { z } from "zod";
import { explain } from "@/lib/ai";
import { getExperts } from "@/data/experts";
import { store } from "@/lib/store";
import { AnswersSchema, ConcernList, SessionId } from "@/lib/schemas";

const Body = z.object({
  sessionId: SessionId,
  concerns: ConcernList,
  answers: AnswersSchema,
  expertIds: z.array(z.string()).min(1).max(3),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { sessionId, concerns, answers, expertIds } = parsed.data;
  // Only structured profile fields go to the model.
  const all = getExperts();
  const experts = expertIds.map((id) => all.find((e) => e.id === id)).filter((e) => !!e);
  const res = await explain({ concerns, answers, experts });
  const templated = Object.values(res.source).filter((s) => s === "template").length;
  if (templated > 0) await store.logEvent(sessionId, "fallback", { step: "explain", reason: res.failure ?? "grounding_check", count: templated });
  return NextResponse.json(res);
}
