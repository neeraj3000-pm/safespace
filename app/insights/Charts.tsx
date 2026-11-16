"use client";
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Insights } from "@/lib/insights";

const TEAL = "#1F7A78";
const GRID = "#EEE8DE";
const AXIS = { fontSize: 12, fill: "#5D7276" };

function Panel({ title, sub, children, className = "" }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-[24px] border border-line/70 p-5 ${className}`}>
      <h2 className="text-lg font-extrabold">{title}</h2>
      {sub && <p className="text-sm text-muted">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const tooltipStyle = { borderRadius: 12, border: "1px solid #E7DFD3", fontSize: 13 };

export function InsightsCharts({ d }: { d: Insights }) {
  const top = d.funnel[0].total || 1;
  const funnel = d.funnel.map((f) => ({ ...f, pct: Math.round((f.total / top) * 100) }));
  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-3">
      <Panel title="Funnel" sub="People reaching each step (% of started)" className="lg:col-span-2">
        <div className="h-[280px]">
          <ResponsiveContainer>
            <BarChart data={funnel} layout="vertical" margin={{ left: 8, right: 48 }} barCategoryGap={8}>
              <CartesianGrid horizontal={false} stroke={GRID} />
              <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="step" width={130} tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "#DDF1EE", opacity: 0.5 }}
                contentStyle={tooltipStyle}
                formatter={(v, _n, p) => [`${v} people (${p.payload.pct}%) · ${p.payload.live} live`, "Reached"]}
              />
              <Bar dataKey="total" fill={TEAL} radius={[0, 4, 4, 0]}>
                <LabelList dataKey="pct" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 12, fill: "#23353A", fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="North star by week" sub="% with the same expert at session 4 (cohort by first check-in week)">
        <div className="h-[220px]">
          <ResponsiveContainer>
            <LineChart data={d.northStarTrend} margin={{ left: -16, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="week" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Same expert at S4"]} labelFormatter={(l) => `Week of ${l}`} />
              <Line type="monotone" dataKey="pct" stroke={TEAL} strokeWidth={2} dot={{ r: 4, fill: TEAL, stroke: "#fff", strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Why people switch" sub="Share of switches by reason">
        <div className="h-[220px]">
          <ResponsiveContainer>
            <BarChart data={d.switchByReason} layout="vertical" margin={{ left: 8, right: 40 }} barCategoryGap={8}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="reason" width={150} tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#DDF1EE", opacity: 0.5 }} contentStyle={tooltipStyle} formatter={(v, _n, p) => [`${v}% (${p.payload.count})`, "Switches"]} />
              <Bar dataKey="pct" fill={TEAL} radius={[0, 4, 4, 0]}>
                <LabelList dataKey="pct" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 12, fill: "#23353A", fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="“Did you feel heard?” scores" sub="After session 1, 1 = not at all, 5 = completely" className="lg:col-span-2">
        <div className="h-[200px]">
          <ResponsiveContainer>
            <BarChart data={d.feltDist} margin={{ left: -16, top: 16 }} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="score" tick={AXIS} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#DDF1EE", opacity: 0.5 }} contentStyle={tooltipStyle} formatter={(v) => [v, "People"]} labelFormatter={(l) => `Score ${l}`} />
              <Bar dataKey="count" fill={TEAL} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
