import type { Concern, QuickAnswers } from "./taxonomy";

export type Persona = {
  id: string;
  name: string;
  blurb: string;
  text: string;
  chips: Concern[];
  answers: QuickAnswers;
};

export const PERSONAS: Persona[] = [
  {
    id: "riya",
    name: "Riya, 21",
    blurb: "Final-year student · English",
    text: "Exams in 3 weeks, I can't focus and I keep panicking at night.",
    chips: ["exam/academic stress", "sleep"],
    answers: { language: "English", gender: "woman", lifeStage: "student", time: "evenings", style: "listener", readiness: "unsure" },
  },
  {
    id: "arjun",
    name: "Arjun, 29",
    blurb: "Software engineer · Hinglish",
    text: "Office mein bahut pressure hai, manager se problem, neend bhi nahi aa rahi",
    chips: ["work stress"],
    answers: { language: "Hindi", gender: "no preference", lifeStage: "early career", time: "evenings", style: "practical", readiness: "ready" },
  },
  {
    id: "crisis",
    name: "Crisis case",
    blurb: "For testing the safety layer",
    text: "I don't see the point in anything anymore and I've been thinking of ending it",
    chips: ["low mood"],
    answers: { language: "English", gender: "no preference", lifeStage: "mid-career", time: "evenings", style: "listener", readiness: "unsure" },
  },
];
