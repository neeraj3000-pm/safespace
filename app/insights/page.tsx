import { computeInsights } from "@/lib/insights";
import { InsightsCharts } from "./Charts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Insights · Internal · Next Step" };

const pct = (x: number) => `${Math.round(x * 100)}%`;

export default async function Insights() {
  const d = await computeInsights();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-4 sm:pt-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide bg-ink text-white rounded-full px-2.5 py-1">Internal · YourDOST team</span>
        <span className="text-xs text-muted">
          ~{d.funnel[0].synthetic} synthetic past sessions + {d.liveSessionCount} live demo sessions · storage: {d.backend}
        </span>
      </div>
      <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">Next Step: how it&apos;s doing</h1>

      <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Headline numbers">
        <Tile big label="North star: same expert at session 4" value={pct(d.sameS4)} note="of people who had session 1" accent />
        <Tile label="Book a 2nd session" value={pct(d.s2Rate)} note="after session 1" />
        <Tile label="Average “felt heard”" value={d.avgFeltHeard.toFixed(2)} note="out of 5, after session 1" />
        <Tile label="Switched expert" value={pct(d.switchRate)} note="after session 1, guilt-free" />
      </section>

      <InsightsCharts d={d} />

      <section className="mt-6 grid sm:grid-cols-2 gap-3" aria-label="AI quality and safety">
        <div className="bg-white rounded-[24px] border border-line/70 p-5">
          <h2 className="text-lg font-extrabold">AI quality</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Mini label="Check-ins where people edited the AI's topics" value={pct(d.editedPct)} />
            <Mini label="Fell back to rules (low confidence / API failure)" value={pct(d.fallbackPct)} />
          </div>
          <p className="mt-3 text-sm text-muted">
            High edit rates on one topic suggest a prompt or taxonomy fix. Fallbacks still give a full journey, just from the person&apos;s own taps.
          </p>
        </div>
        <div className="bg-white rounded-[24px] border border-line/70 p-5">
          <h2 className="text-lg font-extrabold">Safety: check-ins flagged</h2>
          <table className="mt-3 w-full text-[15px]">
            <tbody>
              {d.safety.map((s) => (
                <tr key={s.layer} className="border-b border-line last:border-0">
                  <td className="py-2">{s.layer}</td>
                  <td className="py-2 text-right font-heading font-extrabold tabular-nums">{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-muted">
            Of {d.totalCheckins} check-ins. Rules run first and skip the AI on a match, so &ldquo;both&rdquo; can&apos;t happen by design.
            AI-only flags show the value of the second layer. In production, every flag is reviewed by a 24x7 expert.
          </p>
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value, note, big, accent }: { label: string; value: string; note: string; big?: boolean; accent?: boolean }) {
  return (
    <div className={`rounded-[24px] p-5 ${accent ? "bg-teal text-white" : "bg-white border border-line/70"} ${big ? "col-span-2 lg:col-span-1" : ""}`}>
      <p className={`text-sm font-semibold ${accent ? "text-white/85" : "text-muted"}`}>{label}</p>
      <p className="mt-1 font-heading font-extrabold text-4xl tabular-nums">{value}</p>
      <p className={`text-xs ${accent ? "text-white/75" : "text-muted"}`}>{note}</p>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream rounded-2xl p-4">
      <p className="font-heading font-extrabold text-3xl tabular-nums">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
