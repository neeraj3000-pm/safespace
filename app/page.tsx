import { LinkButton, Blob, Card } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { getExperts } from "@/data/experts";

export default function Landing() {
  const ex = getExperts();
  const trio = [ex[0], ex[7], ex[1]];
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-14 pb-12 grid md:grid-cols-2 gap-10 items-center">
          <div className="fade-up">
            <p className="inline-flex items-center gap-2 bg-mint text-teal-deep text-sm font-semibold rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-teal-2" /> For employees, by YourDOST
            </p>
            <h1 className="mt-4 text-[34px] leading-[1.1] sm:text-5xl sm:leading-[1.08] font-extrabold text-ink">
              Not sure where to start?
              <br />
              <span className="text-teal">Let&apos;s find your next step.</span>
            </h1>
            <p className="mt-4 text-lg text-muted max-w-md">
              Tell us what&apos;s on your mind, in your own words and any language. We&apos;ll suggest the most useful next step and explain why.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
              <LinkButton href="/start" className="w-full sm:w-auto text-base px-8">Get started</LinkButton>
              <span className="text-sm text-muted text-center sm:text-left">Anonymous. Takes about a minute.</span>
            </div>
          </div>

          <div className="relative h-[300px] sm:h-[380px] hidden sm:block" aria-hidden="true">
            <Blob className="absolute -right-10 -top-6 w-[420px] h-[420px]" color="#DDF1EE" />
            <Blob className="absolute left-4 bottom-0 w-44 h-44" color="#F2E6D6" />
            <Card className="absolute right-10 top-8 p-4 w-64 fade-up">
              <div className="flex items-center gap-3">
                <Avatar a={trio[0].avatar} name={trio[0].name} size={52} />
                <div>
                  <p className="font-heading font-bold">{trio[0].name}</p>
                  <p className="text-xs text-muted">{trio[0].credential}</p>
                </div>
              </div>
              <p className="mt-3 text-sm bg-mint/60 rounded-2xl px-3 py-2 text-teal-deep">
                <b>Why we matched you:</b> works with work stress and sleep, practical style.
              </p>
            </Card>
            <Card className="absolute left-0 top-36 p-4 w-60 fade-up" style={{ animationDelay: ".15s" }}>
              <p className="text-xs text-muted">Here&apos;s what we understood</p>
              <p className="mt-1 text-sm font-semibold">It sounds like work pressure is affecting your sleep.</p>
              <div className="mt-2 flex gap-1.5 flex-wrap">
                <span className="text-xs bg-sand rounded-full px-2 py-1">work stress</span>
                <span className="text-xs bg-sand rounded-full px-2 py-1">sleep</span>
              </div>
            </Card>
            <div className="absolute right-24 bottom-4 flex -space-x-3">
              {trio.map((e) => <span key={e.id} className="rounded-[18px] ring-4 ring-cream overflow-hidden"><Avatar a={e.avatar} name={e.name} size={48} /></span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 w-full">
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ["🔒", "Anonymous", "No name, no login. Your words aren't stored."],
            ["✔︎", "Verified experts", "Qualified psychologists and counsellors."],
            ["☎", "24x7 support", "Someone is always there if things feel urgent."],
          ].map(([icon, t, d]) => (
            <li key={t} className="flex items-start gap-3 bg-white rounded-[20px] border border-line/70 p-4">
              <span className="w-10 h-10 shrink-0 rounded-full bg-mint text-teal grid place-items-center text-lg" aria-hidden="true">{icon}</span>
              <div>
                <p className="font-heading font-bold">{t}</p>
                <p className="text-sm text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 w-full mt-14">
        <h2 className="text-2xl sm:text-3xl font-extrabold">How it works</h2>
        <ol className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            ["Share what's going on", "Write a line or two, in English, Hindi or Hinglish. Or just tap a few options."],
            ["Check what we understood", "We reflect it back in plain words. Fix anything that's off."],
            ["Get your next step", "The right expert, a self-help tool to start with, or help right now, with the reason why."],
          ].map(([t, d], i) => (
            <li key={t}>
              <Card className="p-6 h-full">
                <span className="w-9 h-9 rounded-full bg-coral text-white font-heading font-extrabold grid place-items-center">{i + 1}</span>
                <h3 className="mt-4 text-lg font-bold">{t}</h3>
                <p className="mt-1 text-muted">{d}</p>
              </Card>
            </li>
          ))}
        </ol>
        <div className="mt-10 rounded-[28px] bg-mint p-6 sm:p-10 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-teal-deep">Change takes a few sessions, and that&apos;s normal.</h2>
            <p className="text-teal-deep/80 mt-1">Finding the right fit is part of the process. Switching experts is always free and guilt-free.</p>
          </div>
          <LinkButton href="/start" className="shrink-0">Find my next step</LinkButton>
        </div>
      </section>
    </>
  );
}
