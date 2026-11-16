import { NextResponse } from "next/server";
import { z } from "zod";
import { cleanBriefLine } from "@/lib/ai";
import { safetyGate, BLOCKED } from "@/lib/guard";
import { store } from "@/lib/store";
import { SessionId } from "@/lib/schemas";

// Saves the brief exactly as the person approved it (after their edits). Called only when consent is on.
const Body = z.object({
  sessionId: SessionId,
  checkinId: z.string(),
  expertId: z.string(),
  lines: z.array(z.string().max(300)).min(1).max(3),
  source: z.enum(["ai", "template"]),
  edited: z.boolean(),
  switchReason: z.string().max(20).nullable().default(null),
  slot: z.string().max(80).nullable().default(null),
  intro: z.boolean().default(false),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const b = parsed.data;
  // Edited text is re-checked: safety rules first, then personal details stripped.
  if ((await safetyGate(b.sessionId, b.checkinId, b.lines)).blocked) return NextResponse.json(BLOCKED, { status: 403 });
  const lines = b.lines.map(cleanBriefLine).filter(Boolean);
  const id = await store.saveBrief({
    checkin_id: b.checkinId, expert_id: b.expertId, lines, source: b.source, edited: b.edited,
    switch_reason: b.switchReason, slot: b.slot, intro: b.intro,
  });
  await store.logEvent(b.sessionId, "brief_shared", { checkinId: b.checkinId, edited: b.edited, source: b.source, handover: !!b.switchReason });
  return NextResponse.json({ id, lines });
}
