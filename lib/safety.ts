/**
 * SAFETY LAYER 1: deterministic rules. Runs BEFORE any AI call.
 *
 * Product decision: safety routing is never left to the LLM alone.
 * If any phrase below matches, we skip the AI entirely and go to /help-now.
 * The list is deliberately broad (false positives are acceptable, misses are not).
 * In production a clinical team would own and review this list.
 */

type RiskCategory = "self-harm" | "suicide" | "harm to others" | "abuse";

const RISK_PHRASES: Record<RiskCategory, string[]> = {
  suicide: [
    // English
    "kill myself", "killing myself", "end my life", "ending my life", "ending it", "end it all",
    "suicide", "suicidal", "want to die", "wanna die", "better off dead", "no reason to live",
    "don't want to live", "dont want to live", "don't want to be alive", "not worth living",
    "take my own life", "don't see the point in living", "wish i was dead", "wish i were dead",
    // Hindi (Devanagari)
    "आत्महत्या", "मरना चाहता", "मरना चाहती", "जीना नहीं चाहता", "जीना नहीं चाहती", "खुदकुशी", "जान दे",
    // Hinglish
    "marna chahta", "marna chahti", "mar jaana chahta", "mar jana chahta", "mar jaana chahti", "mar jana chahti",
    "jeena nahi chahta", "jeena nahi chahti", "jina nahi chahta", "jina nahi chahti", "khudkushi",
    "aatmahatya", "atmahatya", "jaan de dunga", "jaan de dungi", "zindagi khatam", "sab khatam kar",
  ],
  "self-harm": [
    "hurt myself", "hurting myself", "harm myself", "harming myself", "self harm", "self-harm",
    "cut myself", "cutting myself", "overdose",
    "khud ko nuksan", "khud ko hurt", "apne aap ko nuksan", "खुद को नुकसान", "खुद को चोट",
  ],
  "harm to others": [
    "kill him", "kill her", "kill them", "kill someone", "hurt someone", "hurt them badly",
    "usko maar dunga", "usko maar dungi", "maar daalunga", "maar dalunga", "jaan se maar",
    "जान से मार",
  ],
  abuse: [
    "abusing me", "abuses me", "hits me", "beats me", "beating me", "sexually abused", "molested",
    "raped", "domestic violence", "marta hai", "maarta hai", "peet-ta hai", "pitai karta",
    "मारता है", "पीटता है",
  ],
};

export type SafetyResult = { flagged: boolean; category?: RiskCategory; phrase?: string };

function normalise(text: string) {
  return text.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Whole-word match that also works for Devanagari (letters + combining marks).
// Avoids false hits such as "spending it" matching "ending it".
const COMPILED = (Object.entries(RISK_PHRASES) as [RiskCategory, string[]][]).flatMap(([category, phrases]) =>
  phrases.map((phrase) => ({
    category,
    phrase,
    re: new RegExp(`(?<![\\p{L}\\p{M}])${escape(normalise(phrase))}(?![\\p{L}\\p{M}])`, "u"),
  })),
);

export function checkSafety(text: string): SafetyResult {
  const t = normalise(text);
  for (const { category, phrase, re } of COMPILED) {
    if (re.test(t)) return { flagged: true, category, phrase };
  }
  return { flagged: false };
}
