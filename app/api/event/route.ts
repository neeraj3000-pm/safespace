import { NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/store";
import { SessionId } from "@/lib/schemas";

const ALLOWED = [
  "started", "consent_given", "persona_used", "chip_added", "chip_removed", "help_now_viewed",
  "resource_opened", "intro_video_clicked", "fast_forward", "booked_s2", "secondary_path_opened",
] as const;

const Body = z.object({
  sessionId: SessionId,
  name: z.enum(ALLOWED),
  props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await store.logEvent(parsed.data.sessionId, parsed.data.name, parsed.data.props);
  return NextResponse.json({ ok: true });
}
