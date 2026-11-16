import type { Resource } from "@/lib/taxonomy";

// 15 generic self-help resources (synthetic).
export const RESOURCES: Resource[] = [
  { id: "r01", type: "exercise", title: "5-minute box breathing", duration: "5 min", concerns: ["anxiety", "exam/academic stress", "work stress", "anger"], description: "A simple 4-4-4-4 breathing pattern to settle a racing mind." },
  { id: "r02", type: "program", title: "Wind-down routine for better sleep", duration: "7 nights", concerns: ["sleep", "anxiety", "work stress"], description: "A gentle evening routine, one small change each night." },
  { id: "r03", type: "quiz", title: "Short mood check-in (5 questions)", duration: "2 min", concerns: ["low mood", "loneliness", "other", "grief"], description: "A quick, private snapshot of how you've been feeling lately." },
  { id: "r04", type: "program", title: "Managing exam stress: a 7-day plan", duration: "7 days", concerns: ["exam/academic stress", "anxiety", "sleep"], description: "Daily 10-minute steps for focus, rest and calmer nights before exams." },
  { id: "r05", type: "exercise", title: "Setting boundaries at work", duration: "15 min", concerns: ["work stress", "burnout"], description: "A guided worksheet to name one boundary and practise saying it." },
  { id: "r06", type: "exercise", title: "The worry window", duration: "10 min", concerns: ["anxiety", "sleep", "exam/academic stress"], description: "Park your worries for a set time so they don't follow you to bed." },
  { id: "r07", type: "quiz", title: "Burnout self-check", duration: "3 min", concerns: ["burnout", "work stress"], description: "Spot the early signs of burnout and what usually helps." },
  { id: "r08", type: "program", title: "Small steps for low days", duration: "14 days", concerns: ["low mood", "loneliness", "self-esteem"], description: "Tiny, doable actions for days when everything feels heavy." },
  { id: "r09", type: "exercise", title: "Kind self-talk practice", duration: "10 min", concerns: ["self-esteem", "low mood", "exam/academic stress"], description: "Notice your inner critic and try a kinder, more accurate voice." },
  { id: "r10", type: "exercise", title: "Talking it through: a conversation planner", duration: "15 min", concerns: ["relationships", "family"], description: "Plan a hard conversation: what you feel, what you need, what you'll say." },
  { id: "r11", type: "program", title: "Staying connected: a 7-day plan", duration: "7 days", concerns: ["loneliness", "life transitions", "low mood"], description: "Small daily nudges to reconnect with people, at your own pace." },
  { id: "r12", type: "exercise", title: "Cool-down plan for anger", duration: "10 min", concerns: ["anger", "relationships", "work stress"], description: "Build your personal pause-and-reset routine for heated moments." },
  { id: "r13", type: "program", title: "Calmer parenting in 10 minutes a day", duration: "10 days", concerns: ["parenting", "family", "anger"], description: "Short daily ideas for calmer mornings and bedtimes at home." },
  { id: "r14", type: "exercise", title: "Remembering, gently", duration: "15 min", concerns: ["grief", "low mood"], description: "A guided reflection to hold a memory with care." },
  { id: "r15", type: "quiz", title: "Stress check-in (6 questions)", duration: "3 min", concerns: ["work stress", "anxiety", "sleep", "life transitions", "other"], description: "See where stress is showing up for you: body, sleep, mood or focus." },
];
