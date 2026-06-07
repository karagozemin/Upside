"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let start: number | null = null;
    let frame: number;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, active]);

  return value;
}

export function HeroPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const riskNow = useCountUp(84, 1200, active);
  const riskAfter = useCountUp(43, 900, active && riskNow >= 84);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="animate-in delay-500">
    <div className="panel panel-glow animate-float relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#22d3ee]/10 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#34d399]/10 blur-3xl animate-drift-reverse" />

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="label text-[#22d3ee]">Live position</p>
            <p className="display mt-1 text-2xl font-bold">BTC-USD Long</p>
            <p className="mono mt-1 text-xs text-[#64748b]">1.25 BTC · 10x · SoDEX testnet</p>
          </div>
          <span className="badge badge-critical badge-dot pulse-critical">Critical</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="animate-risk-glow rounded-xl border border-[#fb7185]/20 bg-[#fb7185]/10 p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#fb7185]">Risk now</p>
            <p className="display mt-1 text-4xl font-extrabold tabular-nums text-[#fb7185]">{riskNow}</p>
          </div>
          <div className="animate-protect-glow rounded-xl border border-[#34d399]/20 bg-[#34d399]/10 p-4">
            <p className="text-[10px] uppercase tracking-wider text-[#34d399]">After protection</p>
            <p className="display mt-1 text-4xl font-extrabold tabular-nums text-[#34d399]">{riskAfter}</p>
          </div>
        </div>

        <div className="animate-fade-in delay-700 mt-5 rounded-xl border border-white/5 bg-white/[0.03] p-4">
          <p className="label mb-2">AI risk memo</p>
          <p className="text-sm leading-relaxed text-[#94a3b8]">
            Liquidation buffer is thin, ETF outflows are rising, and orderbook depth
            cannot absorb a fast move down.
          </p>
        </div>

        <div className="animate-fade-in delay-800 mt-5 flex flex-wrap gap-2">
          {["SoSoValue", "SoDEX", "Groq AI"].map((tag, i) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#94a3b8]"
              style={{ animationDelay: `${0.9 + i * 0.1}s` }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
