import Link from "next/link";

const nav = [
  { href: "/desk", label: "Command Center" },
  { href: "/desk/narrative", label: "Narrative Radar" },
  { href: "/desk/replay", label: "Risk Replay" },
  { href: "/desk/audit", label: "Audit Log" },
];

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-56 shrink-0 border-r border-[#2a3548] bg-[#111827] lg:block">
        <div className="border-b border-[#2a3548] px-4 py-5">
          <Link href="/" className="font-mono text-lg font-semibold">
            Upside
          </Link>
          <p className="mt-1 text-xs text-[#94a3b8]">Risk Desk</p>
        </div>
        <nav className="p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mb-1 block rounded px-3 py-2 text-sm text-[#94a3b8] hover:bg-[#1a2235] hover:text-[#e2e8f0]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-56 border-t border-[#2a3548] p-4">
          <p className="text-xs text-[#94a3b8]">
            Most agents chase alpha.
            <br />
            Upside protects the downside.
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[#2a3548] bg-[#0a0e17] px-6 py-4">
          <div className="flex items-center gap-4 lg:hidden">
            <Link href="/" className="font-mono font-semibold">
              Upside
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-[#94a3b8] hover:text-[#e2e8f0]"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="hidden text-sm text-[#94a3b8] lg:block">
            Demo SoDEX Portfolio · Powered by SoSoValue & SoDEX
          </p>
          <Link
            href="/"
            className="text-xs text-[#94a3b8] hover:text-[#e2e8f0]"
          >
            ← Landing
          </Link>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
