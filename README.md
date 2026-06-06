# Upside

**AI Risk Desk for On-Chain Traders**

> Most agents chase alpha. Upside protects the downside.

Upside is an AI-powered risk desk for on-chain traders. It connects SoSoValue market intelligence with SoDEX position and liquidity data to detect liquidation, drawdown, liquidity, news, ETF-flow, macro, and narrative risk before it becomes a loss. Instead of giving another buy/sell signal, Upside explains why a position is becoming dangerous, simulates protective actions, and prepares user-approved hedge or reduce orders.

---

## Problem

Traders do not need more noisy signals — they need capital protection. Signal bots help traders enter positions. Upside helps them survive positions. Solo on-chain traders, wallets, and one-person finance businesses operate without a risk desk watching their book 24/7.

## Solution

Upside turns SoSoValue market intelligence and SoDEX position data into:

- Real-time liquidation warnings
- AI risk memos (Groq-powered)
- Protection plan simulations with before/after impact
- SoDEX testnet execution (or clearly labeled simulated fallback)
- Audit trail and risk replay timeline

## Why Upside Matters

Upside is **not** another AI trading signal bot. It is a capital protection product. The judge should understand it in 10 seconds:

> "Upside watches my positions, detects risk early, explains why, and helps me protect capital through SoDEX."

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
├──────────────┬──────────────────────────────────────────────┤
│   Landing    │              Risk Desk (/desk)               │
│   Page       │  Command Center · Position Detail · Radar    │
│              │  Replay · Audit Log · API Visibility         │
├──────────────┴──────────────────────────────────────────────┤
│                      API Routes Layer                        │
│  /portfolio · /positions · /risk-memo · /protection-plans  │
│  /execute · /narrative · /replay · /audit · /visibility    │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer (/lib)                     │
│  sosovalue.ts · sodex.ts · risk-engine.ts · ai-risk-memo.ts  │
│  demo-data.ts · audit-log.ts · api-visibility.ts             │
├──────────────────────┬──────────────────────────────────────┤
│   SoSoValue OpenAPI  │           SoDEX Perps API            │
│   News · ETF · Index │    Orderbook · Positions · Orders    │
├──────────────────────┴──────────────────────────────────────┤
│                    Groq AI (Risk Memos)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## How SoSoValue Is Used

| Module | Endpoint | Risk Use |
|--------|----------|----------|
| Feeds | `/feeds/hot-news` | News risk scoring |
| ETF | `/etf/historical-inflow-chart/{ticker}` | ETF flow risk |
| Indices | `/indices` | Sector/narrative radar |
| Macro | `/macro/events` | Macro event risk |

Base URL: `https://openapi.sosovalue.com/openapi/v1`  
Auth: `x-soso-api-key` header

## How SoDEX Is Used

| Endpoint | Risk Use |
|----------|----------|
| `GET /markets/{symbol}/orderbook` | Liquidity depth, slippage |
| `GET /accounts/{address}/positions` | Live portfolio positions |
| `POST /trade/orders` | Reduce-only protection execution (testnet) |

Testnet: `https://testnet-gw.sodex.dev/api/v1/perps`

---

## Risk Scoring Formula

```
Total Risk =
  Liquidity Risk    × 0.25
+ Volatility Risk   × 0.20
+ Position Size Risk × 0.20
+ Macro Risk        × 0.15
+ News Risk         × 0.10
+ ETF Flow Risk     × 0.05
+ Narrative Risk    × 0.05
```

**Verdict bands:**
- 0–30: Safe
- 31–60: Watch
- 61–80: Defensive
- 81–100: Critical

The formula is visible in the Position Detail UI.

---

## AI Memo Flow

1. Risk engine computes position breakdown
2. Market context fetched from SoSoValue + SoDEX
3. Groq (`llama-3.3-70b-versatile`) generates structured JSON memo
4. On missing key or error → deterministic template fallback (clearly labeled)
5. Memo ID logged to audit trail

---

## Demo Instructions

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 60-Second Judge Demo

1. Landing → **Open Risk Desk**
2. Command Center → note LIVE/DEMO badge + API Visibility panel
3. Click **BTC-PERP Long** (Critical)
4. Review risk breakdown + AI memo
5. Select **Option A — Reduce 35%** → see before/after (84 → 43)
6. Check confirmation → **Simulate Protection** → **Simulated Execution**
7. Open **Risk Replay** → 62 → 84 → 43 timeline
8. Open **Audit Log** → recorded decisions

### Demo Portfolio

| Position | Verdict | Action |
|----------|---------|--------|
| BTC-PERP Long | Critical | Reduce 35% + stop |
| ETH-PERP Long | Defensive | Hedge 20% |
| SOL-PERP Short | Watch | No action |
| RWA Basket | Safe | Monitor only |

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
# SoSoValue
SOSOVALUE_API_KEY=

# SoDEX (testnet default)
SODEX_ENV=testnet
SODEX_USER_ADDRESS=
SODEX_ACCOUNT_ID=
SODEX_API_KEY_NAME=
SODEX_API_KEY_PRIVATE_KEY=

# AI (Groq)
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

# Optional
NEXT_PUBLIC_FORCE_DEMO=false
```

---

## Fallback / Demo Mode

- App **never crashes** when API keys are missing
- Each data source shows **Live** or **Fallback** status in API Visibility panel
- Demo data is **never hidden** — judges always see data mode
- `NEXT_PUBLIC_FORCE_DEMO=true` forces fallback even with keys configured
- SoDEX execution without signing keys → **Simulated Execution** (clearly labeled)

---

## Screenshots

Place demo screenshots in `/public/screenshots/`:

- `landing.png` — Landing page
- `command-center.png` — Command Center dashboard
- `position-detail.png` — BTC-PERP risk detail with before/after
- `api-visibility.png` — API Visibility panel

---

## Wave Submission Checklist

- [x] Next.js App Router + TypeScript + Tailwind
- [x] SoSoValue integration layer with fallback
- [x] SoDEX integration layer with testnet signing + simulated fallback
- [x] Groq AI risk memos with template fallback
- [x] Risk scoring engine with visible formula
- [x] Command Center dashboard
- [x] Position risk detail with protection simulator
- [x] Before/after risk transformation (BTC 84 → 43)
- [x] Narrative Risk Radar
- [x] Risk Replay timeline
- [x] Audit Log
- [x] API Visibility panel (Live/Fallback per source)
- [x] Landing page with professional terminal aesthetic
- [x] README with architecture and demo instructions
- [x] Vercel-ready deployment (`npm run build`)

---

## Deploy to Vercel

```bash
npm run build
```

Push to GitHub and import to Vercel. Add environment variables in the Vercel dashboard.

---

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Recharts
- Groq SDK
- Viem (EIP-712 signing)
- Zod

---

*Built for the SoSoValue Buildathon — "Build Your One-Person On-Chain Finance Business with SoSoValue."*
