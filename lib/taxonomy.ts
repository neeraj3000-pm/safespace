// Fixed concern taxonomy. The AI must pick from this list only.
export const CONCERNS = [
  "work stress",
  "burnout",
  "exam/academic stress",
  "anxiety",
  "low mood",
  "sleep",
  "relationships",
  "family",
  "loneliness",
  "grief",
  "self-esteem",
  "anger",
  "life transitions",
  "parenting",
  "other",
] as const;
export type Concern = (typeof CONCERNS)[number];

export const LANGUAGES = ["English", "Hindi", "Kannada", "Tamil", "Telugu", "Bengali"] as const;
export type Language = (typeof LANGUAGES)[number];

export const GENDER_PREFS = ["no preference", "woman", "man"] as const;
export type GenderPref = (typeof GENDER_PREFS)[number];

export const LIFE_STAGES = ["student", "early career", "mid-career", "parent", "senior"] as const;
export type LifeStage = (typeof LIFE_STAGES)[number];

export const TIMES = ["mornings", "evenings", "weekends"] as const;
export type TimePref = (typeof TIMES)[number];

export const STYLES = ["listener", "practical"] as const;
export type Style = (typeof STYLES)[number];

export const READINESS = ["ready", "unsure", "self"] as const;
export type Readiness = (typeof READINESS)[number];

export const READINESS_LABEL: Record<Readiness, string> = {
  ready: "Ready to talk",
  unsure: "Not sure yet",
  self: "I'd rather try on my own first",
};

export type Intensity = "low" | "moderate" | "high";

// Example chips on the check-in screen -> text inserted + concern they imply.
export const EXAMPLE_CHIPS: { label: string; text: string; concern: Concern }[] = [
  { label: "Work stress", text: "Work has been really stressful.", concern: "work stress" },
  { label: "Can't sleep", text: "I can't sleep properly.", concern: "sleep" },
  { label: "Relationship", text: "Things are hard in my relationship.", concern: "relationships" },
  { label: "Exams", text: "I'm worried about my exams.", concern: "exam/academic stress" },
  { label: "Feeling low", text: "I've been feeling low.", concern: "low mood" },
];

export const SWITCH_REASONS = [
  { id: "connect", label: "We didn't connect" },
  { id: "style", label: "Their style didn't suit me" },
  { id: "language", label: "Language" },
  { id: "timing", label: "Timing" },
  { id: "other", label: "Something else" },
] as const;
export type SwitchReason = (typeof SWITCH_REASONS)[number]["id"];

/** Third-person phrasing for briefs and the expert view. */
export const SWITCH_THIRD: Record<SwitchReason, string> = {
  connect: "they didn't feel a connection",
  style: "the previous style didn't suit them",
  language: "language got in the way",
  timing: "the timings didn't work",
  other: "it wasn't quite the right fit",
};

export type QuickAnswers = {
  language: Language;
  gender: GenderPref;
  lifeStage: LifeStage;
  time: TimePref;
  style: Style;
  readiness: Readiness;
};

export const DEFAULT_ANSWERS: QuickAnswers = {
  language: "English",
  gender: "no preference",
  lifeStage: "early career",
  time: "evenings",
  style: "listener",
  readiness: "unsure",
};

export type Expert = {
  id: string;
  name: string;
  gender: "woman" | "man";
  languages: Language[];
  specialisations: Concern[];
  life_stages: LifeStage[];
  style: Style;
  years_experience: number;
  credential: string;
  avg_felt_heard: number;
  bookings_count: number;
  slots: { day: string; time: TimePref; label: string }[];
  bio: string;
  avatar: { bg: string; skin: string; hair: string; hairStyle: number };
};

export type Resource = {
  id: string;
  type: "exercise" | "quiz" | "program";
  title: string;
  duration: string;
  concerns: Concern[];
  description: string;
};
