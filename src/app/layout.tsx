import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import { DarkVeil } from "@/components/landing/DarkVeil";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const syne = Syne({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700", "800"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Upside — AI Risk Desk",
  description: "AI risk desk that turns SoSoValue intelligence into explainable risk alerts and protects SoDEX positions through user-approved actions.",
  icons: {
    icon: [{ url: "/upside.png", type: "image/png" }],
    apple: [{ url: "/upside.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-mesh min-h-screen">
        {/* app-wide shader background */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <DarkVeil hueShift={0} speed={1} />
          <div className="absolute inset-0 bg-[#0b0e11]/60" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0b0e11]/40 to-[#0b0e11]" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
