import Link from "next/link";
import { Logo } from "@/components/Logo";
import { WaveCanvas } from "@/components/landing/WaveCanvas";
import { LiveTicker } from "@/components/landing/LiveTicker";

const PIPELINE = [
  {
    n: "01",
    t: "Watch",
    color: "#5e9eff",
    d: "SoSoValue indices and SoDEX market data stream into a weighted risk engine. Every position gets a live 0–100 score, recomputed as conditions move.",
    points: [
      "Funding, volatility, liquidation distance",
      "MAG7.ssi / USSI index context",
      "Factor-level breakdown, not a magic number",
    ],
  },
  {
    n: "02",
    t: "Warn",
    color: "#f0883e",
    d: "When risk crosses a threshold, Upside explains why. A Groq-generated memo cites the exact factors and numbers behind the jump.",
    points: [
      "Plain-English risk memo with evidence",
      "Deterministic fallback when AI is offline",
      "Full audit log of every decision",
    ],
  },
  {
    n: "03",
    t: "Act",
    color: "#0ecb81",
    d: "Choose a protection plan — reduce, hedge, or close. Preview the exact before/after impact, then approve. Upside never moves funds on its own.",
    points: [
      "Before/after liquidation distance preview",
      "EIP-712 signed orders on SoDEX",
      "One click, human-approved, reversible",
    ],
  },
];

const PROOF = [
  { v: "87%", label: "Backtest hit-rate", sub: "180 windows · seed=42" },
  { v: "84%", label: "Alert precision", sub: "critical alerts that mattered" },
  { v: "60s", label: "Judge demo", sub: "detect → explain → protect" },
  { v: "100%", label: "User-approved", sub: "zero autonomous fund moves" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <nav className="glass sticky top-0 z-50 px-5 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo size={26} href="/" className="[&_p]:text-base" />
          <div className="flex items-center gap-1">
            <Link href="/desk/backtest" className="btn btn-ghost hidden text-[13px] sm:inline-flex">
              Backtest
            </Link>
            <Link href="/desk" className="btn btn-ghost hidden text-[13px] sm:inline-flex">
              Desk
            </Link>
            <Link href="/judge" className="btn btn-primary ml-2 px-4! py-2! text-[13px]">
              Launch demo
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <header className="mx-auto max-w-5xl px-5 pt-20 sm:pt-28">
        <div className="max-w-2xl">
          <p className="mono text-[12px] text-[#5e6673]">
            Built on SoSoValue + SoDEX · Wave 3
          </p>
          <h1 className="display mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-[52px]">
            The risk desk for
            <br />
            leveraged traders.
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[#848e9c]">
            Upside watches your SoDEX positions, warns you before liquidation with
            evidence — not vibes — and executes protection you approve. Nothing moves
            without your signature.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/judge" className="btn btn-primary">
              Run the 60-second demo
            </Link>
            <Link href="/desk/positions/btc-perp" className="btn btn-secondary">
              Open a live position
            </Link>
          </div>
        </div>

        {/* product stage */}
        <div className="hero-stage relative mt-14 overflow-hidden rounded-lg">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-[#22262d] bg-[#12151a] px-4 py-2">
            <span className="mono text-[11px] text-[#5e6673]">
              BTC-PERP · live risk simulation
            </span>
            <span className="badge badge-live badge-dot">live</span>
          </div>
          {/* overlay copy on the chart */}
          <div className="pointer-events-none absolute inset-x-0 top-12 z-10 px-6 pt-6 sm:px-8">
            <p className="mono text-[11px] uppercase tracking-widest text-[#5e6673]">
              Position health · real-time
            </p>
            <h3 className="display mt-2 max-w-sm text-xl font-bold leading-snug text-[#eaecef] sm:text-2xl">
              Every dip toward liquidation,{" "}
              <span className="text-[#0ecb81]">caught before it lands.</span>
            </h3>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-[#848e9c]">
              The shield marks where Upside stepped in — hedged, reduced, protected.
            </p>
          </div>
          <WaveCanvas className="h-90 w-full sm:h-105" />
        </div>
      </header>

      {/* live metrics ticker */}
      <div className="mt-10 border-y border-[#22262d]">
        <LiveTicker />
      </div>

      <main className="mx-auto max-w-5xl px-5 pb-20">
        {/* ─── PIPELINE ─── */}
        <section className="mt-20">
          <p className="label">How it works</p>
          <h2 className="display mt-2 text-2xl font-bold sm:text-3xl">
            Watch → Warn → Act
          </h2>

          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-[#22262d] bg-[#22262d] md:grid-cols-3">
            {PIPELINE.map((s) => (
              <div key={s.n} className="bg-[#12151a] p-6">
                <div className="flex items-center gap-2.5">
                  <span className="mono text-[12px] font-bold" style={{ color: s.color }}>
                    {s.n}
                  </span>
                  <h3 className="text-lg font-semibold">{s.t}</h3>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-[#848e9c]">{s.d}</p>
                <ul className="mt-4 space-y-2 border-t border-[#22262d] pt-4">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2 text-[13px] text-[#c8cdd4]">
                      <span className="mono shrink-0" style={{ color: s.color }}>
                        —
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PROOF ─── */}
        <section className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label">Measured, not promised</p>
              <h2 className="display mt-2 text-2xl font-bold sm:text-3xl">
                The engine has receipts
              </h2>
              <p className="mt-3 max-w-md text-[13px] text-[#767f8d]">
                Every number comes from a reproducible backtest. Same seed, same
                result — run it yourself.
              </p>
            </div>
            <Link href="/desk/backtest" className="btn btn-secondary text-[13px]">
              Re-run the backtest
            </Link>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-[#22262d] bg-[#22262d] sm:grid-cols-2 lg:grid-cols-4">
            {PROOF.map((m) => (
              <div key={m.label} className="bg-[#12151a] p-6">
                <p className="mono text-3xl font-bold text-[#eaecef]">{m.v}</p>
                <p className="mt-2 text-[13px] font-medium text-[#c8cdd4]">{m.label}</p>
                <p className="mono mt-1 text-[11px] text-[#5e6673]">{m.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section className="mt-20 rounded-lg border border-[#22262d] bg-[#12151a] p-8 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="mono text-[12px] text-[#5e6673]">60-second walkthrough</p>
              <h2 className="display mt-2 text-2xl font-bold sm:text-3xl">
                Risk <span className="text-[#f6465d]">84</span>{" "}
                <span className="text-[#5e6673]">→</span>{" "}
                <span className="text-[#0ecb81]">43</span>
              </h2>
              <p className="mt-3 max-w-md text-[13px] text-[#848e9c]">
                A BTC long at critical risk. Watch Upside detect it, explain it, and
                cut the risk in half — with your approval, on SoDEX.
              </p>
            </div>
            <Link href="/judge" className="btn btn-primary">
              Start demo
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#22262d] px-5 py-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="mono text-[11px] text-[#5e6673]">
            upside · sosovalue buildathon
          </span>
          <span className="mono text-[11px] text-[#5e6673]">
            powered by SoSoValue + SoDEX
          </span>
        </div>
      </footer>
    </div>
  );
}
