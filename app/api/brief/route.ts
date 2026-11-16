import { NextResponse } from "next/server";
import { z } from "zod";
import { brief } from "@/lib/ai";
import { safetyGate, BLOCKED } from "@/lib/guard";
import { store } from "@/lib/store";
import { AnswersSchema, ConcernList, SessionId } from "@/lib/schemas";
import { SWITCH_REASONS, type SwitchReason } from "@/lib/taxonomy";

// Generates a draft brief to SHOW the person. Nothing is shared until they confirm (see /api/brief/save).
// Input is tags + AI summary + preferences only. The raw text is never sent here.
const Body = z.object({
  sessionId: SessionId,
  checkinId: z.string(),
  concerns: ConcernList,
  summary: z.string().max(300).nullable().default(null),
  intensity: z.enum(["low", "moderate", "high"]).optional(),
  answers: AnswersSchema,
  switchReason: z.enum(SWITCH_REASONS.map((s) => s.id) as [SwitchReason, ...SwitchReason[]]).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const b = parsed.data;
  if ((await safetyGate(b.sessionId, b.checkinId)).blocked) return NextResponse.json(BLOCKED, { status: 403 });

  const res = await brief(b);
  if (res.source === "template") await store.logEvent(b.sessionId, "fallback", { step: "brief", reason: res.failure ?? "unknown" });
  return NextResponse.json(res);
}
