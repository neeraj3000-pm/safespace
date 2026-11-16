/**
 * Safety gate for every AI call after the check-in.
 * Safety rules stay first: a flagged check-in (by rules or AI) never gets a re-rank or a brief,
 * and any free text / edited brief text is re-checked against the rule list before use.
 */
import "server-only";
import { checkSafety } from "./safety";
import { store } from "./store";

export async function safetyGate(sessionId: string, checkinId: string, texts: string[] = []): Promise<{ blocked: boolean }> {
  const checkin = await store.getCheckin(checkinId);
  if (checkin?.risk_layer) return { blocked: true };
  for (const t of texts) {
    const s = checkSafety(t);
    if (s.flagged) {
      await store.updateCheckin(checkinId, { risk_layer: "rules", path: "C" });
      await store.logEvent(sessionId, "safety_flag", { layer: "rules", category: s.category, step: "post-checkin" });
      return { blocked: true };
    }
  }
  return { blocked: false };
}

export const BLOCKED = { blocked: true, route: "help-now" } as const;
