import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";

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
      <body className="bg-mesh min-h-screen">{children}</body>
    </html>
  );
}
