import { z } from "zod";
import { CONCERNS, LANGUAGES, GENDER_PREFS, LIFE_STAGES, TIMES, STYLES, READINESS } from "./taxonomy";

export const AnswersSchema = z.object({
  language: z.enum(LANGUAGES),
  gender: z.enum(GENDER_PREFS),
  lifeStage: z.enum(LIFE_STAGES),
  time: z.enum(TIMES),
  style: z.enum(STYLES),
  readiness: z.enum(READINESS),
});
export const ConcernList = z.array(z.enum(CONCERNS)).max(8);
export const SessionId = z.string().min(6).max(64);
