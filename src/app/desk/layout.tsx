"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/desk", icon: "◉", label: "Overview", sub: "Command center" },
  { href: "/desk/positions/btc-perp", icon: "⚡", label: "BTC Demo", sub: "Main flow", primary: true },
  { href: "/desk/replay", icon: "↻", label: "Replay", sub: "Timeline" },
  { href: "/desk/audit", icon: "☰", label: "Audit", sub: "Decision log" },
];

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] flex-col border-r border-white/5 bg-[#030508]/90 backdrop-blur-xl lg:flex">
        <div className="border-b border-white/5 p-5">
          <Logo size={36} subtitle="Risk Desk" href="/" />
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => {
            const active = path === item.href || (item.href !== "/desk" && path.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                  active ? "bg-[#22d3ee]/10 text-[#22d3ee]" : "text-[#64748b] hover:bg-white/5 hover:text-[#f1f5f9]",
                  item.primary && !active && "ring-1 ring-[#fb7185]/20"
                )}
              >
                <span className="text-base">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-[10px] opacity-60">{item.sub}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <Link href="/desk/positions/btc-perp" className="btn btn-primary w-full py-3 text-sm">
            Start Demo
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-[220px]">
        <header className="glass sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <Logo size={28} showText={false} href="/" />
            <Link href="/desk/positions/btc-perp" className="btn btn-primary px-4 py-2 text-xs">
              Start Demo
            </Link>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-xs text-[#64748b]">{n.label}</Link>
            ))}
          </div>
          <p className="hidden text-sm text-[#64748b] lg:block">Demo Portfolio · SoSoValue + SoDEX</p>
          <Link href="/" className="text-xs text-[#64748b] hover:text-[#f1f5f9]">Home</Link>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
