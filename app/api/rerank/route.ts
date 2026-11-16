import { NextResponse } from "next/server";
import { z } from "zod";
import { rankExperts } from "@/lib/rerankFlow";
import { safetyGate, BLOCKED } from "@/lib/guard";
import { store } from "@/lib/store";
import { AnswersSchema, ConcernList, SessionId } from "@/lib/schemas";

const Body = z.object({
  sessionId: SessionId,
  checkinId: z.string(),
  text: z.string().max(2000).default(""), // PII-scrubbed text, held only in browser memory; never stored
  summary: z.string().max(300).nullable().default(null),
  concerns: ConcernList,
  answers: AnswersSchema,
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const b = parsed.data;

  // Safety first: no re-rank for flagged users.
  if ((await safetyGate(b.sessionId, b.checkinId, [b.text])).blocked) return NextResponse.json(BLOCKED, { status: 403 });

  const res = await rankExperts(b);
  await store.updateMatchExperts(b.checkinId, res.experts.map((e) => e.id));
  return NextResponse.json(res);
}
