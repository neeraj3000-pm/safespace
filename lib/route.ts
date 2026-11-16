/**
 * PATH CHOICE: deterministic rules (not AI).
 * AI tells us *what* the person is dealing with; these rules decide *where* to send them,
 * so the logic is predictable, explainable and easy to change with clinical input.
 */
import type { Intensity, Readiness } from "./taxonomy";

export type Path = "A" | "B" | "C"; // A: talk to an expert, B: start on your own, C: get help now

export function choosePath(input: { intensity: Intensity; readiness: Readiness; riskFlag: boolean }): {
  primary: Path;
  secondary: Path | null;
  rule: string;
} {
  const { intensity, readiness, riskFlag } = input;
  if (riskFlag) return { primary: "C", secondary: null, rule: "risk flag → help now (no recommendations)" };
  if (intensity === "high") return { primary: "A", secondary: "B", rule: "high intensity → expert" };
  if (readiness === "ready") return { primary: "A", secondary: "B", rule: "ready to talk → expert" };
  if (readiness === "self" && intensity === "low") return { primary: "B", secondary: "A", rule: "try on my own + low intensity → self-help" };
  if (readiness === "self") return { primary: "B", secondary: "A", rule: "try on my own (moderate) → self-help, expert offered alongside" };
  // not sure yet
  if (intensity === "moderate") return { primary: "A", secondary: "B", rule: "not sure + moderate → expert" };
  return { primary: "B", secondary: "A", rule: "not sure + low → self-help" };
}
