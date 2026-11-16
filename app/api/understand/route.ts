import { NextResponse } from "next/server";
import { z } from "zod";
import { scrubPII } from "@/lib/pii";
import { checkSafety } from "@/lib/safety";
import { understand } from "@/lib/ai";
import { store } from "@/lib/store";
import { AnswersSchema, ConcernList, SessionId } from "@/lib/schemas";
import type { Concern, Intensity } from "@/lib/taxonomy";

const Body = z.object({
  sessionId: SessionId,
  text: z.string().max(2000).default(""),
  chips: ConcernList.default([]),
  answers: AnswersSchema,
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { sessionId, chips, answers } = parsed.data;

  // 1. Remove personal details. The raw text lives only in this request and is never stored.
  const text = scrubPII(parsed.data.text);

  // 2. Safety rules FIRST. On a match, the LLM is never called.
  const safety = checkSafety(text);
  if (safety.flagged) {
    const checkinId = await store.createCheckin({
      session_id: sessionId, chips: [], answers, intensity: "high", path: "C",
      confidence: null, used_fallback: false, risk_layer: "rules",
    });
    await store.logEvent(sessionId, "checkin_done", { checkinId });
    await store.logEvent(sessionId, "safety_flag", { layer: "rules", category: safety.category });
    return NextResponse.json({ route: "help-now", layer: "rules", checkinId });
  }

  // 3. AI understanding.
  const ai = await understand({ text, chips, answers });

  if (ai.ok && ai.data.risk_flag) {
    const checkinId = await store.createCheckin({
      session_id: sessionId, chips: ai.data.concerns, answers, intensity: ai.data.intensity, path: "C",
      confidence: ai.data.confidence, used_fallback: false, risk_layer: "ai",
    });
    await store.logEvent(sessionId, "checkin_done", { checkinId });
    await store.logEvent(sessionId, "safety_flag", { layer: "ai" });
    return NextResponse.json({ route: "help-now", layer: "ai", checkinId });
  }

  // 4. Low confidence or failure → fall back to the person's own taps.
  const useFallback = !ai.ok || ai.data.confidence < 0.5;
  let concerns: Concern[];
  let intensity: Intensity;
  let summary: string | null;
  let fallbackReason: string | null = null;

  if (useFallback) {
    concerns = chips;
    // Rule-based intensity from what we have: readiness + number of concerns.
    intensity = answers.readiness === "ready" || chips.length >= 2 ? "moderate" : "low";
    summary = null;
    fallbackReason = ai.ok ? "low_confidence" : ai.reason;
  } else {
    // Merge AI concerns with tapped chips (AI first), keep it short.
    concerns = Array.from(new Set([...ai.data.concerns, ...chips])).slice(0, 4) as Concern[];
    intensity = ai.data.intensity;
    summary = ai.data.summary;
  }

  const checkinId = await store.createCheckin({
    session_id: sessionId, chips: concerns, answers, intensity, path: null,
    confidence: ai.ok ? ai.data.confidence : null, used_fallback: useFallback, risk_layer: null,
  });
  await store.logEvent(sessionId, "checkin_done", { checkinId });
  if (useFallback) await store.logEvent(sessionId, "fallback", { step: "understand", reason: fallbackReason });

  return NextResponse.json({
    route: "understood",
    checkinId,
    // Scrubbed text goes back to the browser's memory (never storage) so /api/rerank can use it.
    cleanedText: text,
    concerns,
    aiConcerns: useFallback ? [] : concerns,
    intensity,
    summary,
    usedFallback: useFallback,
    fallbackReason,
    detectedLanguage: ai.ok ? ai.data.detected_language : null,
    confidence: ai.ok ? ai.data.confidence : null,
  });
}
