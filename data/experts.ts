import type { Expert, Language, Concern, LifeStage, Style, TimePref } from "@/lib/taxonomy";

// 24 fictional experts. All names, credentials and stats are synthetic.
type Raw = [
  id: string,
  name: string,
  gender: "woman" | "man",
  languages: Language[],
  specialisations: Concern[],
  life_stages: LifeStage[],
  style: Style,
  years: number,
  credential: string,
  feltHeard: number,
  bookings: number,
  slotPattern: [dayOffset: number, time: TimePref][],
  bio: string,
];

const RAW: Raw[] = [
  ["e01", "Ananya Iyer", "woman", ["English", "Hindi", "Tamil"], ["anxiety", "work stress", "burnout", "sleep"], ["early career", "mid-career"], "practical", 9, "M.Phil Clinical Psychology", 4.7, 412, [[1, "evenings"], [2, "mornings"], [5, "weekends"]], "Helps working professionals untangle stress and build routines that actually stick. Calm, structured, and big on small wins."],
  ["e02", "Kavya Menon", "woman", ["English", "Hindi"], ["exam/academic stress", "anxiety", "self-esteem", "sleep"], ["student", "early career"], "listener", 5, "MA Counselling Psychology", 4.6, 198, [[1, "evenings"], [3, "evenings"], [6, "weekends"]], "Works mostly with students and young adults. Gentle, patient, and good at slowing racing thoughts down."],
  ["e03", "Rohan Malhotra", "man", ["English", "Hindi"], ["work stress", "burnout", "anger", "relationships"], ["early career", "mid-career"], "practical", 11, "M.Phil Clinical Psychology", 4.4, 530, [[2, "evenings"], [4, "evenings"], [5, "weekends"]], "Former corporate trainer turned therapist. Direct, practical, and comfortable talking about difficult managers."],
  ["e04", "Meera Krishnan", "woman", ["English", "Tamil"], ["low mood", "grief", "loneliness", "life transitions"], ["mid-career", "senior", "parent"], "listener", 14, "PhD Clinical Psychology", 4.8, 610, [[1, "mornings"], [3, "mornings"], [6, "weekends"]], "Creates space to feel things without rushing to fix them. Experienced with loss, change and long, heavy seasons."],
  ["e05", "Ishaan Verma", "man", ["English", "Hindi"], ["exam/academic stress", "anxiety", "self-esteem", "life transitions"], ["student"], "practical", 3, "MA Counselling Psychology", 4.1, 46, [[1, "evenings"], [2, "evenings"], [4, "evenings"]], "Newer to practice and close in age to many of his clients. Uses practical tools for focus, planning and exam nerves."],
  ["e06", "Priya Nair", "woman", ["English", "Hindi"], ["relationships", "family", "self-esteem", "anxiety"], ["early career", "mid-career", "parent"], "listener", 8, "MSc Counselling Psychology", 4.5, 344, [[2, "evenings"], [3, "mornings"], [5, "weekends"]], "Works with relationship and family dynamics. Warm and curious, she helps you notice patterns without judgement."],
  ["e07", "Sneha Reddy", "woman", ["English", "Telugu", "Hindi"], ["work stress", "anxiety", "sleep", "low mood"], ["early career", "mid-career"], "practical", 6, "M.Phil Clinical Psychology", 4.3, 221, [[1, "mornings"], [2, "evenings"], [6, "weekends"]], "Blends evidence-based techniques with everyday language. Loves a good plan and a realistic first step."],
  ["e08", "Arnab Chatterjee", "man", ["English", "Bengali", "Hindi"], ["low mood", "loneliness", "grief", "life transitions"], ["mid-career", "senior"], "listener", 13, "MA Clinical Psychology", 4.6, 389, [[3, "evenings"], [4, "mornings"], [6, "weekends"]], "Steady and unhurried. Many clients come to him during big life changes such as moves, retirement and loss."],
  ["e09", "Divya Rao", "woman", ["English", "Kannada", "Hindi"], ["parenting", "family", "work stress", "burnout"], ["parent", "mid-career"], "practical", 10, "MSc Clinical Psychology", 4.5, 402, [[1, "mornings"], [4, "mornings"], [5, "weekends"]], "Mother of two and a parenting specialist. Practical about juggling work, kids and your own needs."],
  ["e10", "Farhan Qureshi", "man", ["English", "Hindi"], ["anger", "relationships", "work stress", "self-esteem"], ["early career", "mid-career"], "practical", 7, "MA Counselling Psychology", 3.9, 260, [[2, "evenings"], [3, "evenings"], [6, "weekends"]], "Helps people understand what sits underneath anger and frustration, then practise responding differently."],
  ["e11", "Lakshmi Subramanian", "woman", ["English", "Tamil", "Telugu"], ["anxiety", "sleep", "low mood", "self-esteem"], ["early career", "mid-career", "senior"], "listener", 12, "PhD Counselling Psychology", 4.7, 455, [[1, "evenings"], [3, "mornings"], [5, "weekends"]], "Soft-spoken and grounding. Combines talk therapy with simple body-based techniques for anxious minds."],
  ["e12", "Neha Kapoor", "woman", ["English", "Hindi"], ["burnout", "work stress", "life transitions", "self-esteem"], ["mid-career", "early career"], "practical", 9, "M.Phil Clinical Psychology", 4.4, 377, [[1, "evenings"], [2, "evenings"], [4, "evenings"]], "Specialises in burnout recovery for people who are used to pushing through. Firm about rest and boundaries."],
  ["e13", "Siddharth Joshi", "man", ["English", "Hindi"], ["exam/academic stress", "sleep", "anxiety", "loneliness"], ["student", "early career"], "listener", 4, "MA Counselling Psychology", 4.2, 88, [[2, "mornings"], [3, "evenings"], [6, "weekends"]], "Works with college students and hostel life. A good listener for those who don't know where to begin."],
  ["e14", "Pooja Sharma", "woman", ["English", "Hindi"], ["low mood", "anxiety", "relationships", "family"], ["early career", "parent", "mid-career"], "listener", 7, "MSc Clinical Psychology", 4.5, 301, [[1, "evenings"], [4, "evenings"], [5, "weekends"]], "Gentle and validating. Helps you put words to feelings you've been carrying alone."],
  ["e15", "Vikram Shetty", "man", ["English", "Kannada"], ["work stress", "burnout", "sleep", "anger"], ["mid-career", "senior"], "practical", 15, "PhD Clinical Psychology", 4.3, 498, [[1, "mornings"], [3, "mornings"], [4, "mornings"]], "Two decades around high-pressure workplaces. Goal-focused sessions with clear take-home practice."],
  ["e16", "Ritu Bhattacharya", "woman", ["English", "Bengali"], ["family", "parenting", "relationships", "grief"], ["parent", "mid-career", "senior"], "listener", 11, "MA Counselling Psychology", 4.6, 333, [[2, "mornings"], [5, "weekends"], [6, "weekends"]], "Family-systems approach. Helps families talk to each other more kindly, especially across generations."],
  ["e17", "Aditi Deshpande", "woman", ["English", "Hindi"], ["exam/academic stress", "self-esteem", "anxiety", "life transitions"], ["student", "early career"], "practical", 6, "M.Phil Clinical Psychology", 4.6, 240, [[1, "evenings"], [2, "evenings"], [5, "weekends"]], "Works with students on exam pressure, perfectionism and career uncertainty. Structured and encouraging."],
  ["e18", "Karthik Raman", "man", ["English", "Tamil", "Hindi"], ["anxiety", "work stress", "sleep", "low mood"], ["early career", "mid-career"], "practical", 8, "MSc Clinical Psychology", 4.4, 288, [[1, "evenings"], [3, "evenings"], [6, "weekends"]], "Engineer-turned-psychologist who explains things clearly. Uses CBT-style tools for worry and sleep."],
  ["e19", "Shalini Gupta", "woman", ["English", "Hindi"], ["work stress", "sleep", "burnout", "anxiety"], ["early career", "mid-career"], "listener", 5, "MA Counselling Psychology", 4.2, 72, [[1, "evenings"], [2, "evenings"], [4, "evenings"]], "Newer to SafeSpace and quickly loved for her warmth. Good at untangling work stress from everything else."],
  ["e20", "Manoj Pillai", "man", ["English", "Hindi"], ["grief", "low mood", "loneliness", "family"], ["senior", "mid-career"], "listener", 16, "PhD Counselling Psychology", 4.5, 420, [[2, "mornings"], [4, "mornings"], [6, "weekends"]], "Patient and reassuring. Experienced in grief and in loneliness later in life."],
  ["e21", "Tanvi Bose", "woman", ["English", "Bengali", "Hindi"], ["relationships", "self-esteem", "loneliness", "anxiety"], ["student", "early career"], "listener", 4, "MSc Counselling Psychology", 4.0, 64, [[1, "evenings"], [3, "evenings"], [5, "weekends"]], "Works with young adults on friendships, dating and finding their footing in a new city."],
  ["e22", "Harsha Gowda", "man", ["English", "Kannada", "Telugu"], ["work stress", "life transitions", "burnout", "relationships"], ["early career", "mid-career"], "practical", 6, "MA Clinical Psychology", 3.8, 150, [[2, "evenings"], [4, "evenings"], [6, "weekends"]], "Practical and down to earth. Helps with job changes, relocations and the stress that comes with them."],
  ["e23", "Zoya Siddiqui", "woman", ["English", "Hindi"], ["anxiety", "sleep", "exam/academic stress", "low mood"], ["student", "early career"], "practical", 3, "MA Counselling Psychology", 4.3, 39, [[1, "evenings"], [2, "mornings"], [3, "evenings"]], "Recently joined. Brings fresh, practical techniques for sleep, panic and late-night overthinking."],
  ["e24", "Deepa Hegde", "woman", ["English", "Kannada", "Hindi"], ["parenting", "family", "low mood", "anger"], ["parent", "mid-career"], "listener", 10, "M.Phil Clinical Psychology", 4.4, 312, [[3, "mornings"], [4, "evenings"], [5, "weekends"]], "Supports parents through the hard bits (tantrums, teens and tiredness) without judgement."],
];

const BG = ["#F9FFB2", "#F1ECCB", "#E4EDD3", "#EEF3C8", "#E8E4D0", "#DCE8C9"];
const SKIN = ["#8D5A3B", "#A66E4A", "#C48A63", "#7A4A2E", "#B07B55", "#D2A07A"];
const HAIR = ["#23181A", "#3A2622", "#1B1B1F", "#4A3328", "#2C2420"];

const TIME_HOUR: Record<TimePref, string> = { mornings: "9:30 am", evenings: "7:00 pm", weekends: "11:00 am" };

function slotLabel(dayOffset: number, time: TimePref, now = new Date()) {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  if (time === "weekends") {
    // move to the next Saturday/Sunday on or after the offset
    while (d.getDay() !== 0 && d.getDay() !== 6) d.setDate(d.getDate() + 1);
  }
  const day = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return { day, time, label: `${day}, ${TIME_HOUR[time]}` };
}

export function getExperts(now = new Date()): Expert[] {
  return RAW.map((r, i) => ({
    id: r[0],
    name: r[1],
    gender: r[2],
    languages: r[3],
    specialisations: r[4],
    life_stages: r[5],
    style: r[6],
    years_experience: r[7],
    credential: r[8],
    avg_felt_heard: r[9],
    bookings_count: r[10],
    slots: r[11].map(([o, t]) => slotLabel(o, t, now)),
    bio: r[12],
    avatar: {
      bg: BG[i % BG.length],
      skin: SKIN[(i * 7) % SKIN.length],
      hair: HAIR[(i * 3) % HAIR.length],
      hairStyle: (r[2] === "woman" ? 0 : 3) + (i % 3),
    },
  }));
}
