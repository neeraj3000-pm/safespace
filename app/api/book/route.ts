import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/store";
import { SessionId } from "@/lib/schemas";

const Body = z.object({
  sessionId: SessionId,
  checkinId: z.string(),
  expertId: z.string(),
  slot: z.string().max(80),
  session: z.number().int().min(1).max(10).default(1),
  intro: z.boolean().default(false),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { sessionId, checkinId, expertId, slot, session, intro } = parsed.data;
  if (session === 1 && !intro) await store.chooseExpert(checkinId, expertId);
  const name = intro ? "intro_call_booked" : session === 1 ? "booked" : `booked_s${session}`;
  await store.logEvent(sessionId, name, { checkinId, expertId, slot });
  return NextResponse.json({ ok: true, bookingRef: "NS-" + Math.random().toString(36).slice(2, 8).toUpperCase() });
}
