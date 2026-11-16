"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Chip, PageShell, Progress, StickyCTA } from "@/components/ui";
import { Thinking } from "@/components/Thinking";
import {
  EXAMPLE_CHIPS, LANGUAGES, GENDER_PREFS, LIFE_STAGES, TIMES, READINESS, READINESS_LABEL,
  type Concern, type QuickAnswers, DEFAULT_ANSWERS,
} from "@/lib/taxonomy";
import { PERSONAS } from "@/lib/personas";
import { api, loadJourney, memoryText, saveJourney } from "@/lib/client";

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

type UnderstandRes =
  | { route: "help-now"; layer: string; checkinId: string }
  | { route: "understood"; checkinId: string; cleanedText: string; concerns: Concern[]; aiConcerns: Concern[]; intensity: "low" | "moderate" | "high"; summary: string | null; usedFallback: boolean };

export default function CheckIn() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  // Raw text is held ONLY in component memory, never in storage.
  const [text, setText] = useState("");
  const [chips, setChips] = useState<Concern[]>([]);
  const [answers, setAnswers] = useState<QuickAnswers>(DEFAULT_ANSWERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const j = loadJourney();
    setAnswers(j.answers ?? DEFAULT_ANSWERS);
    setChips(j.tappedChips ?? []);
    const p = PERSONAS.find((x) => x.id === params.get("persona"));
    if (p) setText(p.text);
  }, [params]);

  function tapExample(c: (typeof EXAMPLE_CHIPS)[number]) {
    const on = chips.includes(c.concern);
    setChips(on ? chips.filter((x) => x !== c.concern) : [...chips, c.concern]);
    if (!on && !text.includes(c.text)) setText((t) => (t ? `${t.trim()} ${c.text}` : c.text).slice(0, 500));
  }

  const set = <K extends keyof QuickAnswers>(k: K, v: QuickAnswers[K]) => setAnswers((a) => ({ ...a, [k]: v }));

  async function submit() {
    setLoading(true);
    setError(null);
    saveJourney({ answers, tappedChips: chips });
    try {
      const [res] = await Promise.all([
        api<UnderstandRes>("/api/understand", { text, chips, answers }),
        new Promise((r) => setTimeout(r, 900)), // let the calm loading state breathe
      ]);
      if (res.route === "help-now") {
        saveJourney({ checkinId: res.checkinId });
        memoryText.set("");
        router.push("/help-now?from=check-in");
        return;
      }
      memoryText.set(res.cleanedText);
      saveJourney({
        checkinId: res.checkinId,
        concerns: res.concerns,
        aiConcerns: res.aiConcerns,
        summary: res.summary,
        intensity: res.intensity,
        usedFallback: res.usedFallback,
        edits: { added: [], removed: [] },
        nextStep: undefined,
        booking: undefined,
        excludeIds: [],
      });
      router.push("/understood");
    } catch {
      setLoading(false);
      setError("Something went wrong on our side. Please try again.");
    }
  }

  if (loading) return <Thinking label="Understanding what you shared…" />;

  return (
    <PageShell className="pb-40 sm:pb-10">
      <Progress step={step} total={3} />

      {step === 1 && (
        <section className="mt-8 fade-up" aria-labelledby="q1">
          <h1 id="q1" className="text-[28px] leading-tight font-extrabold">What&apos;s been on your mind lately?</h1>
          <p className="mt-2 text-muted">Optional. A line or two is plenty.</p>
          <label htmlFor="mind" className="sr-only">What&apos;s been on your mind</label>
          <textarea
            id="mind"
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Write in English, Hindi or Hinglish. Whatever feels natural."
            className="mt-5 w-full rounded-[20px] border border-line bg-white p-4 text-[16px] leading-relaxed shadow-soft focus:outline-none focus:border-teal-2 focus:ring-4 focus:ring-mint resize-none"
          />
          <div className="flex justify-between text-xs text-muted mt-1.5">
            <span>Not stored. Names and numbers are removed before we read it.</span>
            <span>{text.length}/500</span>
          </div>
          <p className="mt-5 text-sm font-semibold text-muted">Or tap what fits:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLE_CHIPS.map((c) => (
              <Chip key={c.label} selected={chips.includes(c.concern)} onClick={() => tapExample(c)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="mt-8 fade-up space-y-7" aria-labelledby="q2">
          <div>
            <h1 id="q2" className="text-[28px] leading-tight font-extrabold">A few quick taps</h1>
            <p className="mt-2 text-muted">So we can suggest someone who fits you.</p>
          </div>
          <TapGroup label="Language you'd like to talk in" options={LANGUAGES} value={answers.language} onChange={(v) => set("language", v)} />
          <TapGroup label="Expert you'd feel comfortable with" options={GENDER_PREFS} value={answers.gender} onChange={(v) => set("gender", v)} format={(g) => (g === "no preference" ? "No preference" : g === "woman" ? "A woman" : "A man")} />
          <TapGroup label="Where you are in life" options={LIFE_STAGES} value={answers.lifeStage} onChange={(v) => set("lifeStage", v)} format={cap} />
          <TapGroup label="Best time for you" options={TIMES} value={answers.time} onChange={(v) => set("time", v)} format={cap} />
          <TapGroup label="What helps you more" options={["listener", "practical"] as const} value={answers.style} onChange={(v) => set("style", v)} format={(s) => (s === "listener" ? "Mostly listen" : "Give me practical steps")} />
        </section>
      )}

      {step === 3 && (
        <section className="mt-8 fade-up" aria-labelledby="q3">
          <h1 id="q3" className="text-[28px] leading-tight font-extrabold">How do you feel about talking to someone?</h1>
          <p className="mt-2 text-muted">There&apos;s no wrong answer. Lots of people start on their own.</p>
          <div role="radiogroup" aria-labelledby="q3" className="mt-6 grid gap-3">
            {READINESS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={answers.readiness === r}
                onClick={() => set("readiness", r)}
                className={`text-left rounded-[20px] border px-5 py-4 min-h-14 font-heading font-bold text-[17px] transition-colors ${
                  answers.readiness === r ? "bg-mint border-teal text-teal-deep" : "bg-white border-line hover:border-teal-2"
                }`}
              >
                {READINESS_LABEL[r]}
              </button>
            ))}
          </div>
          {error && <p role="alert" className="mt-4 text-coral-ink">{error}</p>}
        </section>
      )}

      <StickyCTA>
        {step > 1 && <Button variant="ghost" onClick={() => setStep(step - 1)} className="order-2 sm:order-1">Back</Button>}
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} className="order-1 sm:order-2 w-full sm:w-auto">
            {step === 1 && !text.trim() && chips.length === 0 ? "Skip" : "Next"}
          </Button>
        ) : (
          <Button onClick={submit} className="order-1 sm:order-2 w-full sm:w-auto">Find my next step</Button>
        )}
      </StickyCTA>
    </PageShell>
  );
}

function TapGroup<T extends string>({
  label, options, value, onChange, format = (x) => x,
}: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; format?: (v: T) => string }) {
  return (
    <fieldset>
      <legend className="font-heading font-bold mb-2.5">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} selected={value === o} onClick={() => onChange(o)}>
            {format(o)}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}
