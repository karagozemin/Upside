<p align="center">
  <img src="upside.png" width="250" alt="Upside logo" />
</p>

# Upside

**The AI risk desk for SoDEX traders.**

> Most submissions help users find trades. **Upside helps users survive trades.**

Upside is an AI risk desk for on-chain traders that turns **SoSoValue** market intelligence into explainable risk alerts, then protects live **SoDEX** positions through user-approved hedge, reduce, or close actions.

**GitHub:** [github.com/karagozemin/Upside](https://github.com/karagozemin/Upside)

---

## One-liner

**Upside detects position risk early using SoSoValue market intelligence, explains the risk in plain English, and protects SoDEX positions through user-approved hedge, reduce, or close actions.**

---

## Why this matters

Signal bots help traders **enter**. Upside helps them **survive** open positions.

Solo on-chain traders have no 24/7 risk desk. When ETF outflows accelerate, orderbook depth thins, or liquidation buffers shrink — Upside catches it early, explains why with evidence, and prepares protection you approve before signing.

**Upside is not a black-box trading bot. It is a risk copilot. It never moves funds without explicit user approval.**

---

## 60-second judge path

| Step | Route | What judges see |
|------|-------|-----------------|
| **Judge Mode** | [`/judge`](http://localhost:3000/judge) | Automated 60-sec walkthrough |
| **1 — Risk Memo** | `/desk/positions/btc-perp` | Factor breakdown + Groq AI memo |
| **2 — Protection Plan** | same | Reduce 35% / Hedge 20% / Close |
| **3 — Impact Preview** | same | Risk 84→43, liq 4.2%→11.8%, exposure 5x→2.8x |
| **4 — SoDEX Action** | same | EIP-712 flow + execution proof |
| **Audit Replay** | `/desk/replay` | 62 → 84 → 43 timeline |
| **API Evidence** | [`/diag`](http://localhost:3000/diag) | Live vs simulated per source |

```bash
npm install && npm run dev
# → http://localhost:3000/judge
# → http://localhost:3000/desk/positions/btc-perp
# → http://localhost:3000/diag
```

---

## What is real vs simulated

| Component | Status |
|-----------|--------|
| SoSoValue news (`/news/hot`) | **Live** when `SOSOVALUE_API_KEY` set |
| SoSoValue ETF flow (`/etf/.../inflow-chart`) | **Live** when key set (cached; may show demo on 429) |
| SoSoValue indices (`/indices`) | **Live** when key set |
| SoDEX orderbook (`/markets/.../orderbook`) | **Live** — public endpoint |
| SoDEX wallet positions | **Live** when `SODEX_USER_ADDRESS` set |
| BTC-PERP desk position | **Live-priced** — wallet positions or orderbook showcase when wallet empty |
| Groq AI risk memos | **Live** when `GROQ_API_KEY` set |
| SoDEX order placement | **Testnet** when signing keys configured; **judge-safe fallback** otherwise |
| Risk replay / audit | **Deterministic** — same inputs → same score |

Full evidence panel: **`/diag`** and **API Evidence** on position page.

---

## SoSoValue APIs used

| Endpoint | Risk use |
|----------|----------|
| `GET /news/hot` | Crypto news sentiment → news risk factor |
| `GET /etf/{ticker}/inflow-chart` | BTC ETF institutional flow → ETF risk factor |
| `GET /indices` | Sector momentum → narrative radar |
| `GET /macro/events` | Macro event window → macro risk factor |

- Base: `https://openapi.sosovalue.com/openapi/v1`
- Auth: `x-soso-api-key`
- 5min cache, sequential request queue, graceful 429 fallback with stale live cache

---

## SoDEX integration

| Endpoint | Use |
|----------|-----|
| `GET /markets/{symbol}/orderbook` | Liquidity depth, slippage estimate |
| `GET /accounts/{address}/positions` | Live positions (when wallet configured) |
| `POST /trade/orders` | EIP-712 signed reduce-only protection orders |

- Testnet: `https://testnet-gw.sodex.dev/api/v1/perps`
- Signing: Viem EIP-712 via `sodex-signer.ts`
- Keys: [sodex.com/apikeys](https://sodex.com/apikeys) (separate from SoSoValue)

### Execution proof (shown in UI after Step 4)

```
Order ID · HTTP Status · EIP-712 signing · Audit hash · Risk delta
```

When signing keys are absent: full UI completes with honest **judge-safe simulated** disclosure.

---

## Risk engine formula

```
Total Risk Score (0–100) =
  Liquidity / Slippage     × 25%
+ Market Stress (vol)      × 20%
+ Position Exposure        × 20%
+ Macro Events             × 15%
+ News / Narrative Shock   × 10%
+ ETF / Institutional Flow ×  5%
+ Sector Narrative         ×  5%
```

Each factor shows **score + why** in the Explainable Risk Engine panel (Step 1).

**Verdict bands:** 0–30 Safe · 31–60 Watch · 61–80 Defensive · 81–100 Critical

---

## Safety controls

- No auto-trade — user checkbox + sign required
- Max single action: 40% of position
- Slippage cap: 1.5%
- Dry-run preview before signing
- Circuit breaker on critical liquidation proximity
- Non-custodial — wallet signs directly
- Testnet default

---

## Architecture

```
Landing · Judge Mode (/judge) · Diag (/diag)
         ↓
Risk Desk → BTC Demo (4-step flow)
         ↓
API Routes → sosovalue.ts · sodex.ts · risk-engine.ts · ai-risk-memo.ts
         ↓
SoSoValue OpenAPI · SoDEX Perps · Groq AI
```

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing — Detect / Explain / Protect |
| `/judge` | **60-sec automated judge demo** |
| `/diag` | **API evidence — live vs simulated** |
| `/desk` | Command Center |
| `/desk/positions/btc-perp` | Full interactive demo |
| `/desk/replay` | Audit replay timeline |
| `/desk/audit` | Decision audit log |
| `/desk/narrative` | Sector narrative radar |

---

## Environment variables

```env
SOSOVALUE_API_KEY=          # openapi.sosovalue.com
GROQ_API_KEY=               # console.groq.com
GROQ_MODEL=llama-3.3-70b-versatile

SODEX_ENV=testnet
SODEX_USER_ADDRESS=
SODEX_ACCOUNT_ID=
SODEX_API_KEY_NAME=
SODEX_API_KEY_PRIVATE_KEY=  # sodex.com/apikeys

NEXT_PUBLIC_FORCE_DEMO=false
```

Minimum for demo: `SOSOVALUE_API_KEY` + `GROQ_API_KEY`. App never crashes without keys.

---

## Deploy to Vercel

```bash
npm run build
```

Add env vars in Vercel dashboard. Recommended links in submission:

```
Live Demo:  https://your-app.vercel.app/desk/positions/btc-perp
Judge Mode: https://your-app.vercel.app/judge
API Evidence: https://your-app.vercel.app/diag
```

---

## Wave changelog

### Wave 3 — Core risk infrastructure
- SoSoValue + SoDEX + Groq integrations with fallback
- Weighted risk engine + protection plan builder
- 4-step flow: Risk Memo → Protection Plan → Impact Preview → SoDEX Action
- Audit log + risk replay

### Wave 4 — Judge-ready product
- `/judge` 60-sec automated demo
- `/diag` API evidence page
- Explainable risk factor breakdown with "why" per factor
- Execution proof panel (order ID, HTTP status, EIP-712, audit hash)
- Before/after: exposure + estimated loss at −3% move
- Safety controls + track record outcomes
- Reduce / Hedge / Close protection options
- Landing + README restructured for judges

---

## Tech stack

Next.js 15 · TypeScript · Tailwind v4 · Groq · SoSoValue OpenAPI · SoDEX Perps · Viem (EIP-712) · Recharts · Zod

---

## Limitations / next

- [ ] Production Vercel URL in submission
- [ ] Real SoDEX testnet order with deposited API keys
- [ ] Webhook alerts (Telegram/Discord)
- [ ] Multi-position portfolio hedging
- [ ] Drawdown backtesting

---

*Built for the SoSoValue Buildathon — "Build Your One-Person On-Chain Finance Business with SoSoValue."*
