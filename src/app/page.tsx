import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { Logo } from "@/components/Logo";
import { WaveCanvas } from "@/components/landing/WaveCanvas";
import { Spotlight } from "@/components/landing/Spotlight";
import { LiveTicker } from "@/components/landing/LiveTicker";
import { TiltCard } from "@/components/landing/TiltCard";
import { CountUp } from "@/components/landing/CountUp";

const STORY = [
  {
    n: "01",
    t: "Watch",
    tag: "Detect",
    color: "#22d3ee",
    d: "SoSoValue indices and SoDEX market data stream into a weighted risk engine. Every position gets a live 0–100 score — recomputed as conditions move.",
    points: ["Funding, volatility, liquidation distance", "MAG7.ssi / USSI index context", "Factor-level breakdown, not a magic number"],
  },
  {
    n: "02",
    t: "Warn",
    tag: "Explain",
    color: "#fb923c",
    d: "When risk crosses a threshold, Upside doesn't just alert — it explains. A Groq-generated memo cites the exact factors and numbers behind the jump.",
    points: ["Plain-English risk memo with evidence", "Deterministic fallback when AI is offline", "Full audit log of every decision"],
  },
  {
    n: "03",
    t: "Act",
    tag: "Protect",
    color: "#34d399",
    d: "Choose a protection plan — reduce, hedge, or close. Preview the exact before/after impact, then approve. Upside never moves funds on its own.",
    points: ["Before/after liquidation distance preview", "EIP-712 signed orders on SoDEX", "One click, human-approved, reversible"],
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Spotlight />
      <div className="grain" aria-hidden />

      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px]" aria-hidden>
        <div className="absolute left-1/2 top-[-320px] h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-[#22d3ee]/8 blur-[140px]" />
        <div className="absolute right-[-200px] top-[300px] h-[400px] w-[500px] rounded-full bg-[#34d399]/6 blur-[120px]" />
      </div>

      <nav className="glass animate-nav fixed inset-x-0 top-0 z-50 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo size={32} href="/" className="[&_p]:text-lg" />
          <div className="flex items-center gap-2">
            <Link href="/desk/backtest" className="btn btn-ghost hidden text-sm sm:inline-flex">
              Proof
            </Link>
            <Link href="/judge" className="btn btn-primary text-sm">
              Judge Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <header className="relative z-20 mx-auto max-w-6xl px-6 pt-32">
        <div className="text-center">
          <span className="badge badge-mixed animate-in">
            SoSoValue Buildathon · Wave 3
          </span>
          <h1 className="display animate-in delay-100 mx-auto mt-6 max-w-3xl text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            Liquidation is a
            <br />
            <span className="text-gradient-animated bg-gradient-to-r from-[#22d3ee] via-[#2dd4bf] to-[#34d399] bg-clip-text text-transparent">
              solvable problem.
            </span>
          </h1>
          <p className="animate-in delay-200 mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#94a3b8] sm:text-lg">
            Upside is the AI risk desk for SoDEX traders — it detects danger before
            liquidation, explains it with SoSoValue intelligence, and protects positions
            with actions you approve.
          </p>
          <div className="animate-in delay-300 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/judge" className="btn btn-primary px-9 py-3.5 text-base">
              Start 60-sec Judge Demo →
            </Link>
            <Link href="/desk/positions/btc-perp" className="btn btn-secondary px-7 py-3.5">
              Full BTC Demo
            </Link>
          </div>
          <p className="animate-in delay-400 mt-4 text-xs text-[#64748b]">
            Not a black-box bot. Upside never moves funds without explicit approval.
          </p>
        </div>

        {/* live simulation stage */}
        <Reveal className="mt-14">
          <div className="hero-stage relative overflow-hidden rounded-2xl border border-white/10">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 border-b border-white/5 bg-[#0a0f18]/80 px-4 py-2.5 backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[#fb7185]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]/60" />
              <span className="mono ml-3 text-[10px] tracking-wider text-[#475569]">
                upside · live risk simulation — move your cursor
              </span>
            </div>
            <WaveCanvas className="h-[380px] w-full sm:h-[440px]" />
          </div>
        </Reveal>
      </header>

      {/* live metrics ticker */}
      <div className="relative z-20 mt-16">
        <LiveTicker />
      </div>

      <main className="relative z-20 mx-auto max-w-6xl px-6 pb-24">
        {/* ─── STORY: Watch → Warn → Act ─── */}
        <section className="mt-28">
          <Reveal>
            <p className="label text-center">How it works</p>
            <h2 className="display mt-3 text-center text-3xl font-bold sm:text-4xl">
              Watch. Warn. Act.
            </h2>
          </Reveal>

          <div className="mt-14 space-y-8">
            {STORY.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <TiltCard max={4}>
                  <div
                    className="story-card panel relative overflow-hidden p-8 md:p-10"
                    style={{ ["--card-accent" as string]: s.color }}
                  >
                    <div
                      className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.07] blur-3xl"
                      style={{ background: s.color }}
                    />
                    <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                      <div>
                        <div className="flex items-center gap-3">
                          <span
                            className="mono text-sm font-bold"
                            style={{ color: s.color }}
                          >
                            {s.n}
                          </span>
                          <span
                            className="badge"
                            style={{
                              background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                              color: s.color,
                            }}
                          >
                            {s.tag}
                          </span>
                        </div>
                        <h3 className="display mt-4 text-3xl font-bold">{s.t}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">{s.d}</p>
                      </div>
                      <ul className="space-y-3">
                        {s.points.map((p) => (
                          <li
                            key={p}
                            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-[#cbd5e1]"
                          >
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ background: s.color }}
                            />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── PROOF NUMBERS ─── */}
        <section className="mt-28">
          <Reveal>
            <p className="label text-center">Measured, not promised</p>
            <h2 className="display mt-3 text-center text-3xl font-bold sm:text-4xl">
              The risk engine has receipts.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-center text-sm text-[#64748b]">
              Every number below comes from a reproducible backtest you can re-run
              yourself — same seed, same result.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: 87, suffix: "%", label: "Backtest hit-rate", sub: "180 windows, seed=42" },
              { v: 84, suffix: "%", label: "Alert precision", sub: "critical alerts that mattered" },
              { v: 60, prefix: "", suffix: "s", label: "Judge demo", sub: "detect → explain → protect" },
              { v: 100, suffix: "%", label: "User-approved", sub: "zero autonomous fund moves" },
            ].map((m, i) => (
              <Reveal key={m.label} delay={i * 90}>
                <div className="panel group h-full p-6 text-center transition-colors duration-300 hover:border-[#22d3ee]/25">
                  <p className="display text-4xl font-extrabold text-[#f1f5f9]">
                    <CountUp to={m.v} suffix={m.suffix} prefix={m.prefix ?? ""} />
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#cbd5e1]">{m.label}</p>
                  <p className="mono mt-1 text-[11px] text-[#475569]">{m.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <p className="mt-6 text-center">
              <Link
                href="/desk/backtest"
                className="text-sm text-[#22d3ee] transition-colors hover:text-[#67e8f9]"
              >
                Re-run the backtest yourself →
              </Link>
            </p>
          </Reveal>
        </section>

        {/* ─── FINAL CTA ─── */}
        <Reveal className="mt-28">
          <TiltCard max={3}>
            <section className="panel panel-glow relative overflow-hidden p-10 text-center md:p-16">
              <div
                className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)",
                }}
              />
              <p className="label">60-second demo</p>
              <h2 className="display mt-3 text-3xl font-bold sm:text-4xl">
                Risk <span className="text-[#fb7185]">84</span> →{" "}
                <span className="text-[#34d399]">43</span>. One click to start.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-[#64748b]">
                A BTC long at critical risk. Watch Upside detect it, explain it, and cut
                the risk in half — with your approval, on SoDEX.
              </p>
              <Link
                href="/judge"
                className="btn btn-primary mt-8 inline-flex px-10 py-4 text-base"
              >
                Judge Demo →
              </Link>
            </section>
          </TiltCard>
        </Reveal>
      </main>

      <footer className="relative z-20 border-t border-white/5 py-8 text-center text-xs text-[#475569]">
        Upside · Powered by SoSoValue & SoDEX
      </footer>
    </div>
  );
}
