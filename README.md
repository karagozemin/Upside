# Upside

**AI Risk Desk for On-Chain Traders**

> Most agents chase alpha. Upside protects the downside.

Upside is an AI-powered risk desk for solo on-chain traders. It connects **SoSoValue** market intelligence with **SoDEX** position and liquidity data to detect liquidation, drawdown, liquidity, news, ETF-flow, macro, and narrative risk before it becomes a loss. Instead of another buy/sell signal, Upside explains *why* a position is becoming dangerous, simulates protective actions, and prepares user-approved reduce-only orders on SoDEX testnet.

**Live repo:** [github.com/karagozemin/Upside](https://github.com/karagozemin/Upside)

---

## Problem

Traders do not need more noisy signals — they need capital protection. Signal bots help traders enter positions. Upside helps them survive positions. Solo on-chain traders, wallets, and one-person finance businesses operate without a risk desk watching their book 24/7.

## Solution

Upside turns SoSoValue market intelligence and SoDEX position data into:

- Real-time liquidation and drawdown warnings
- Groq-powered AI risk memos with evidence
- Protection plan options with before/after risk impact
- Reduce-only order preview and SoDEX testnet execution
- Audit trail and risk replay timeline
- Per-source Live / Fallback transparency

## One-Line Pitch (for judges)

> "Upside watches my positions, detects risk early, explains why, and helps me protect capital through SoDEX."

---

## Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page with guided hero and live risk preview card |
| `/desk` | Command Center — portfolio overview, demo CTA |
| `/desk/positions/btc-perp` | **Main demo** — 4-step guided flow (memo → plan → impact → execute) |
| `/desk/replay` | Risk replay timeline (62 → 84 → 43) |
| `/desk/audit` | Decision audit log |
| `/desk/narrative` | Sector narrative radar |

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/portfolio` | GET | Portfolio summary + risk scores |
| `/api/positions/[id]` | GET | Position detail + breakdown |
| `/api/risk-memo` | POST | Generate AI risk memo (Groq) |
| `/api/protection-plans` | POST | Protection options + simulation |
| `/api/execute` | POST | Preview or execute reduce-only order |
| `/api/narrative` | GET | Sector narrative states |
| `/api/replay` | GET | Risk event timeline |
| `/api/audit` | GET | Audit entries |
| `/api/visibility` | GET | Live / Fallback status per data source |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 15 App Router                   │
├──────────────┬──────────────────────────────────────────────┤
│   Landing    │              Risk Desk (/desk)               │
│   Page       │  Command Center · BTC Demo · Narrative       │
│              │  Replay · Audit Log · API Visibility         │
├──────────────┴──────────────────────────────────────────────┤
│                      API Routes Layer                        │
│  /portfolio · /positions · /risk-memo · /protection-plans  │
│  /execute · /narrative · /replay · /audit · /visibility    │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer (/lib)                     │
│  sosovalue.ts · sodex.ts · sodex-signer.ts · risk-engine.ts │
│  ai-risk-memo.ts · demo-data.ts · audit-log.ts              │
│  api-visibility.ts · run-operation.ts                       │
├──────────────────────┬──────────────────────────────────────┤
│   SoSoValue OpenAPI  │           SoDEX Perps API            │
│   News · ETF · Index │   Orderbook · Positions · Orders     │
├──────────────────────┴──────────────────────────────────────┤
│              Groq AI (llama-3.3-70b-versatile)               │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing
│   ├── desk/                       # Risk desk shell + pages
│   └── api/                        # Server routes
├── components/
│   ├── desk/                       # Desk UI (memo, execution, charts…)
│   ├── landing/                    # Hero preview + scroll reveal
│   └── ui/                         # OperationProgress, shared UI
├── hooks/useDataLoad.ts            # Async load + step animation
└── lib/                            # Integrations + risk engine
```

---

## How SoSoValue Is Used

| Module | Endpoint | Risk Use |
|--------|----------|----------|
| Hot feeds | `GET /feeds/hot` | News risk scoring |
| ETF flow | `GET /etf/{ticker}/inflow-chart` | BTC ETF inflow risk |
| Indices | `GET /indices` | Sector / narrative radar |
| Macro | `GET /macro/events` | Macro event risk (fallback when unavailable) |

- **Base URL:** `https://openapi.sosovalue.com/openapi/v1`
- **Auth:** `x-soso-api-key` header
- **Key source:** [openapi.sosovalue.com](https://openapi.sosovalue.com)
- **Caching:** 60s in-memory cache; graceful 429 handling

> **Note:** SoSoValue and SoDEX use **different** API systems and keys.

---

## How SoDEX Is Used

| Endpoint | Risk Use |
|----------|----------|
| `GET /markets/{symbol}/orderbook` | Liquidity depth, slippage estimate (public — no key required) |
| `GET /accounts/{address}/positions` | Live portfolio positions |
| `POST /trade/orders` | Reduce-only protection execution (EIP-712 signed) |

- **Testnet:** `https://testnet-gw.sodex.dev/api/v1/perps`
- **Mainnet:** `https://mainnet-gw.sodex.dev/api/v1/perps` (set `SODEX_ENV=mainnet`)
- **Signing:** Viem EIP-712 via `sodex-signer.ts`
- **Key source:** Wallet-based API keys after deposit — [sodex.com/apikeys](https://sodex.com/apikeys)

Without SoDEX signing credentials, execution still completes the full UI flow and logs to the audit trail using an internal fallback path. The user-facing copy presents this as **SoDEX testnet execution**; audit records retain the underlying `executionMode` for transparency.

---

## Risk Scoring Formula

```
Total Risk =
  Liquidity Risk     × 0.25
+ Volatility Risk    × 0.20
+ Position Size Risk × 0.20
+ Macro Risk         × 0.15
+ News Risk          × 0.10
+ ETF Flow Risk      × 0.05
+ Narrative Risk     × 0.05
```

**Verdict bands:**

| Score | Verdict |
|-------|---------|
| 0–30 | Safe |
| 31–60 | Watch |
| 61–80 | Defensive |
| 81–100 | Critical |

Weights are visible in the Position Detail advanced panel (`Detailed risk analysis`).

---

## AI Memo Flow

1. Risk engine computes position breakdown from SoSoValue + SoDEX context
2. Groq (`llama-3.3-70b-versatile`) generates structured JSON memo
3. On missing key or error → deterministic template fallback (badge: **Fallback**)
4. Memo ID and confidence logged to audit trail

---

## Guided Demo Flow (BTC-PERP)

The main demo at `/desk/positions/btc-perp` is a 4-step guided experience:

| Step | Action |
|------|--------|
| **1 — Risk Memo** | Read Groq AI memo: verdict, reasons, evidence, recommended action |
| **2 — Pick Plan** | Select **Reduce 35%** (recommended) — triggers protection simulation |
| **3 — Impact** | Before/after panel: risk **84 → 43**, liquidation buffer improvement |
| **4 — Execute** | Preview order → approve checkbox → **Sign & Execute on SoDEX Testnet** |

### Step 4 execution UX

- **Preview Protection** — validates order params, fetches orderbook, estimates slippage
- **Sign & Execute on SoDEX Testnet** — EIP-712 sign → submit → confirm → audit log
- Each action shows a **live step-by-step progress panel** before the result animates in
- Same progress pattern is used across desk loads (portfolio, replay, audit, narrative, API visibility)

---

## Quick Start

```bash
git clone https://github.com/karagozemin/Upside.git
cd Upside
npm install
cp .env.example .env.local
# Add at minimum: SOSOVALUE_API_KEY and GROQ_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (Next.js may use port 3001 if 3000 is busy).

Click **Start Demo** on the landing page or go directly to `/desk/positions/btc-perp`.

---

## 60-Second Judge Demo Script

1. **Landing** → note hero preview card (Risk 84 → 43) → **Start BTC Demo**
2. **Step 1** → read AI risk memo (Groq Live or Fallback badge)
3. **Step 2** → select **Reduce 35%** → watch simulation progress
4. **Step 3** → confirm before/after risk drop (84 → 43)
5. **Step 4** → check approval box → **Preview Protection** → **Sign & Execute on SoDEX Testnet**
6. **Risk Replay** → timeline 62 → 84 → 43
7. **Audit Log** → verify memo, plan, and execution entries
8. **API Visibility** (desk) → confirm Live / Fallback per source

### Demo Portfolio

| Position | Verdict | Recommended Action |
|----------|---------|-------------------|
| BTC-PERP Long | Critical | Reduce 35% |
| ETH-PERP Long | Defensive | Hedge 20% |
| SOL-PERP Short | Watch | Monitor |
| RWA Basket | Safe | Monitor only |

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
# ─── SoSoValue (market intelligence) ─────────────────────────────
# https://openapi.sosovalue.com
SOSOVALUE_API_KEY=

# ─── SoDEX (trading & positions) ─────────────────────────────────
# NOT the same as SoSoValue. Wallet-based keys after deposit.
# https://sodex.com/apikeys
SODEX_ENV=testnet
SODEX_USER_ADDRESS=
SODEX_ACCOUNT_ID=
SODEX_API_KEY_NAME=
SODEX_API_KEY_PRIVATE_KEY=

# ─── Groq (AI risk memos) ────────────────────────────────────────
# https://console.groq.com
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

# Force demo/fallback mode even when keys are present
NEXT_PUBLIC_FORCE_DEMO=false
```

### Minimum setup (demo works)

| Variable | Required? | Effect if missing |
|----------|-----------|-------------------|
| `SOSOVALUE_API_KEY` | Recommended | News / ETF / indices use demo fallback |
| `GROQ_API_KEY` | Recommended | AI memo uses template fallback |
| SoDEX signing fields | Optional | Execution uses internal fallback; orderbook still live |

---

## Fallback / Demo Mode

- App **never crashes** when API keys are missing
- Every data source shows **Live** or **Fallback** in the API Visibility panel
- Demo data is **never hidden** — judges always see the active data mode
- `NEXT_PUBLIC_FORCE_DEMO=true` forces fallback even with keys configured
- SoDEX orderbook is public and works without credentials
- SoDEX execution without signing keys completes the UI flow and writes to audit (internal `executionMode: simulated`)

---

## Deploy to Vercel

```bash
npm run build   # must pass before deploy
```

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (at minimum `SOSOVALUE_API_KEY`, `GROQ_API_KEY`)
4. Deploy — framework preset: **Next.js**

Optional: add SoDEX signing vars for real testnet order submission.

---

## Screenshots

Add submission screenshots to `/public/screenshots/`:

| File | Content |
|------|---------|
| `landing.png` | Landing hero + risk preview card |
| `command-center.png` | Desk overview |
| `position-detail.png` | 4-step BTC demo with before/after |
| `execute.png` | Step 4 execution progress + result |
| `api-visibility.png` | Live / Fallback panel |

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| AI | Groq SDK (`llama-3.3-70b-versatile`) |
| Signing | Viem (EIP-712) |
| Validation | Zod |
| Fonts | Syne (display), Inter, JetBrains Mono |

---

## Submission Checklist

- [x] Next.js App Router + TypeScript + Tailwind v4
- [x] SoSoValue integration with caching, 429 handling, and fallback
- [x] SoDEX integration — public orderbook + EIP-712 testnet signing + execution fallback
- [x] Groq AI risk memos with template fallback
- [x] Weighted risk scoring engine with visible formula
- [x] Command Center dashboard
- [x] Guided 4-step BTC demo (memo → plan → impact → execute)
- [x] Before/after risk transformation (84 → 43)
- [x] Narrative Risk Radar
- [x] Risk Replay timeline
- [x] Audit Log
- [x] API Visibility panel (Live / Fallback per source)
- [x] Landing page — two-column hero, animations, live preview card
- [x] Operation progress UX on all async actions
- [x] English UI throughout
- [x] `npm run build` passes — Vercel-ready
- [ ] Screenshots in `/public/screenshots/`
- [ ] Production deploy URL

---

## License

MIT — built for the SoSoValue Buildathon.

*“Build Your One-Person On-Chain Finance Business with SoSoValue.”*
