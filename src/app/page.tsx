import Link from "next/link";

const workflow = [
  "Position",
  "Market Context",
  "Risk Engine",
  "AI Memo",
  "Protection Plan",
  "User Approval",
  "SoDEX Execution",
  "Audit Log",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen terminal-grid">
      <nav className="border-b border-[#2a3548] bg-[#0a0e17]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-mono text-lg font-semibold tracking-tight">Upside</span>
          <Link
            href="/desk"
            className="rounded bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb]"
          >
            Open Risk Desk
          </Link>
        </div>
      </nav>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#3b82f6]">
            AI Risk Desk for On-Chain Traders
          </p>
          <h1 className="mt-4 font-mono text-5xl font-bold tracking-tight md:text-7xl">
            Upside
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-[#94a3b8]">
            Most agents chase alpha.{" "}
            <span className="text-[#e2e8f0]">Upside protects the downside.</span>
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-[#94a3b8]">
            Upside turns SoSoValue market intelligence and SoDEX position data into
            real-time liquidation warnings, risk memos, hedge simulations, and
            protection actions.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/desk"
              className="rounded bg-[#3b82f6] px-8 py-3 text-sm font-semibold text-white hover:bg-[#2563eb]"
            >
              Open Risk Desk
            </Link>
            <a
              href="#workflow"
              className="rounded border border-[#2a3548] px-8 py-3 text-sm hover:bg-[#1a2235]"
            >
              See How It Works
            </a>
          </div>
          <p className="mt-6 text-xs text-[#94a3b8]">
            Powered by SoSoValue market intelligence and SoDEX execution data.
          </p>
        </section>

        <section className="border-y border-[#2a3548] bg-[#111827]/50 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#ef4444]">
                  The Problem
                </h2>
                <p className="mt-4 text-2xl font-semibold leading-snug">
                  Traders do not need more noisy signals. They need capital protection.
                </p>
                <p className="mt-4 text-[#94a3b8]">
                  Signal bots help traders enter positions. Upside helps them survive
                  positions. Most on-chain traders operate alone — without a risk desk,
                  a compliance team, or a macro analyst watching their book 24/7.
                </p>
              </div>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#22c55e]">
                  The Solution
                </h2>
                <p className="mt-4 text-2xl font-semibold leading-snug">
                  Live position monitoring + AI risk memo + protection plan
                </p>
                <p className="mt-4 text-[#94a3b8]">
                  Upside watches your positions, detects risk early, explains why, and
                  helps you protect capital through SoDEX. From market intelligence to
                  protection action.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-[#94a3b8]">
              Workflow
            </h2>
            <p className="mt-2 text-center text-lg text-[#e2e8f0]">
              An AI risk desk for one-person on-chain finance businesses.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {workflow.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="card px-3 py-2 font-mono text-xs">{step}</span>
                  {i < workflow.length - 1 && (
                    <span className="text-[#94a3b8]">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#2a3548] bg-[#111827]/50 py-20">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-3xl font-bold">
              Protect the downside before risk becomes a loss.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#94a3b8]">
              Upside is not another AI trading signal bot. It is a professional risk
              terminal for solo traders, wallets, and signal groups.
            </p>
            <Link
              href="/desk"
              className="mt-8 inline-block rounded bg-[#3b82f6] px-8 py-3 text-sm font-semibold text-white hover:bg-[#2563eb]"
            >
              Open Risk Desk
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#2a3548] py-8 text-center text-xs text-[#94a3b8]">
        Upside · SoSoValue Buildathon · AI Risk Desk for On-Chain Traders
      </footer>
    </div>
  );
}
