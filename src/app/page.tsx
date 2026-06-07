import Link from "next/link";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { Reveal } from "@/components/landing/Reveal";
import { Logo } from "@/components/Logo";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <nav className="glass animate-nav fixed inset-x-0 top-0 z-50 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo size={32} href="/" className="[&_p]:text-lg" />
          <Link href="/desk/positions/btc-perp" className="btn btn-primary text-sm">
            Start Demo
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-28">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="text-left">
            <span className="badge badge-mixed animate-in">AI Risk Desk · SoSoValue Buildathon</span>
            <h1 className="display animate-in delay-100 mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.1rem]">
              The AI risk desk
              <br />
              <span className="text-gradient-animated bg-gradient-to-r from-[#22d3ee] via-[#2dd4bf] to-[#34d399] bg-clip-text text-transparent">
                for SoDEX traders.
              </span>
            </h1>
            <p className="animate-in delay-200 mt-5 max-w-xl text-base leading-relaxed text-[#94a3b8] sm:text-lg">
              Upside detects danger before liquidation, explains risk with SoSoValue intelligence,
              and protects positions through user-approved SoDEX actions.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                { icon: "◎", text: "Detect — live SoSoValue data becomes a position-level risk score", delay: "delay-300" },
                { icon: "◈", text: "Explain — every alert includes factor breakdown and plain-English memo", delay: "delay-400" },
                { icon: "↓", text: "Protect — preview hedge, reduce, or close before signing on SoDEX", delay: "delay-500" },
              ].map((item) => (
                <li key={item.text} className={`animate-in ${item.delay} flex items-start gap-3 text-sm text-[#cbd5e1]`}>
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#22d3ee]/10 text-xs text-[#22d3ee]">
                    {item.icon}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>

            <div className="animate-in delay-600 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/judge" className="btn btn-primary px-8 py-3.5 text-base">
                Start 60-sec Judge Demo →
              </Link>
              <Link href="/desk/positions/btc-perp" className="btn btn-secondary px-6 py-3.5">
                Full BTC Demo
              </Link>
            </div>
            <p className="animate-in delay-700 mt-4 text-xs text-[#64748b]">
              Not a black-box trading bot. Upside never moves funds without explicit user approval.
            </p>
          </div>

          <HeroPreview />
        </section>

        <section className="mt-32 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Detect", d: "SoSoValue + SoDEX data → weighted risk score with factor breakdown" },
            { n: "02", t: "Explain", d: "Groq AI memo with evidence — why risk jumped to 84" },
            { n: "03", t: "Protect", d: "Reduce / hedge / close with before/after impact on SoDEX" },
          ].map((item, i) => (
            <Reveal key={item.n} delay={i * 120}>
              <div className="panel h-full p-6 transition-colors duration-300 hover:border-[#22d3ee]/25">
                <span className="mono text-xs text-[#22d3ee]">{item.n}</span>
                <h3 className="display mt-2 text-xl font-bold">{item.t}</h3>
                <p className="mt-2 text-sm text-[#64748b]">{item.d}</p>
              </div>
            </Reveal>
          ))}
        </section>

        <Reveal>
        <section className="panel panel-glow mt-16 p-8 md:p-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div>
              <p className="label">60-second demo</p>
              <h2 className="display mt-2 text-3xl font-bold">
                Risk 84 → 43. One click to start.
              </h2>
              <p className="mt-3 max-w-md text-[#64748b]">
                BTC long is at critical risk. Reduce 35% plan cuts risk in half.
              </p>
            </div>
            <Link href="/judge" className="btn btn-primary shrink-0 px-10 py-4 text-base">
              Judge Demo →
            </Link>
          </div>
        </section>
        </Reveal>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-[#475569]">
        Upside · Powered by SoSoValue & SoDEX
      </footer>
    </div>
  );
}
