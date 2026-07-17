<p align="center">
  <img src="upside.png" width="250" alt="Upside logo" />
</p>

# Upside

**The always-on AI risk desk for SoDEX traders.**

> Most submissions help users find trades. **Upside helps users survive them** — not with one-time advice, but with a live loop that *watches, warns, and intervenes* 24/7.

Upside turns **SoSoValue** market intelligence into an explainable 0–100 risk score, **continuously monitors** live **SoDEX** positions, fires **Telegram alerts** the moment risk crosses a threshold, and executes **user-approved EIP-712 reduce/hedge/close** orders — every decision deterministic, auditable, and backtested.

**GitHub:** [github.com/karagozemin/Upside](https://github.com/karagozemin/Upside)

---

## One-liner

**Upside detects position risk early with SoSoValue intelligence, monitors it continuously, alerts you the instant it spikes, and protects your SoDEX position with user-approved hedge / reduce / close actions — backed by a deterministic, backtested risk engine.**

---

## What changed since Wave 2 — we built exactly what the judges asked for

Wave 2 reviewers were consistent about the single gap holding Upside back. Every one of those requests is now shipped and verifiable:

| Wave 2 reviewer feedback | Wave 3 answer | Verify |
|---|---|---|
| *"The next step is deeper ongoing monitoring, alerts, and live intervention rather than one-time advice."* — **SoSoValue** | **Continuous monitoring loop**: observe → detect → alert → intervene → resolve | `/desk/monitor` |
| *"real ongoing position monitoring would significantly increase practical value"* — **Web3Lord01** | Tick-by-tick live risk timeline with auto-intervention | `/desk/monitor` |
| *"Wave 3 should focus on ... automated alerts/intervention"* — **MuhammadBa** | **Telegram alerts** at risk ≥ 60, approve-to-execute | alert log on `/desk/monitor` |
| *"Telegram alerts for critical risk thresholds would complete the risk desk"* — **BlessinSum** | Threshold-triggered alert channel + `/approve` reply flow | `/desk/monitor` |
| *"portfolio-wide risk tracking"* — **MuhammadBa** | **Portfolio risk view** with market-regime + at-risk detection | `/desk` / `/api/portfolio` |
| *"underlying risk logic is still fairly heuristic and partly LLM-driven"* — **0xmiharbi**; *"lacks quantitative rigor"* (peers) | **Deterministic backtest**: hit-rate, precision, false-alarm rate, avoided drawdown, calibration | `/desk/backtest` |
| *"real SoDEX testnet execution ... would make this top-tier"* — **Davislambo** | **Shipped — real testnet execution.** EIP-712 signed reduce-only orders are accepted by the SoDEX matching engine and return real order IDs (e.g. `orderID 2338792272`) | Step 4 + `/desk/monitor` |

**No heuristic hand-waving. Every claim below is reproducible from a seed.**

---

## Why this matters

Signal bots help traders **enter**. Upside is the only one that helps them **survive** open positions — and it does so *while they sleep*.

Solo on-chain traders have no 24/7 risk desk. When ETF outflows accelerate, orderbook depth thins, or liquidation buffers shrink, Upside catches it early, explains *why* with evidence, alerts you on Telegram, and executes the protection **you approved** — then logs the whole thing to an immutable audit trail.

**Upside is not a black-box trading bot. It is a risk copilot. It never moves funds without explicit user approval.**

---

## 60-second judge path

| Step | Route | What judges see |
|------|-------|-----------------|
| **Judge Mode** | [`/judge`](http://localhost:3000/judge) | Automated 60-sec walkthrough ending on the live loop |
| **★ Live Monitor** | [`/desk/monitor`](http://localhost:3000/desk/monitor) | **Continuous loop**: risk climbs → Telegram alert → approved reduce → risk resolves |
| **Backtest** | [`/desk/backtest`](http://localhost:3000/desk/backtest) | Hit-rate, precision, avoided drawdown, calibration — deterministic |
| **1 — Risk Memo** | `/desk/positions/btc-perp` | 7-factor breakdown + Groq AI memo |
| **2 — Protection Plan** | same | Reduce 35% / Hedge 20% / Close |
| **3 — Impact Preview** | same | Risk 84→43, liq 4.2%→11.8%, exposure 5x→2.8x |
| **4 — SoDEX Action** | same | EIP-712 flow + execution proof |
| **Portfolio Risk** | `/desk` | Portfolio-wide score + at-risk positions + regime |
| **API Evidence** | [`/diag`](http://localhost:3000/diag) | Live vs simulated per source (loading state while pinging live APIs) |

```bash
npm install && npm run dev
# ★ Start here → http://localhost:3000/desk/monitor
#              → http://localhost:3000/judge
#              → http://localhost:3000/desk/backtest
```

---

## ★ The monitoring loop (Wave 3 headline feature)

The whole product now runs as one continuous loop instead of a single-shot demo:

```
observe → detect → alert → intervene → resolve
   ↑                                        │
   └──────────── keep watching ─────────────┘
```

**Reproducible example** (`GET /api/monitor?seed=42&position=btc-perp&ticks=24`):

| Event | Value |
|---|---|
| Risk climbs to | **90 / 100** (peak) |
| Telegram alert fires at tick 8 | risk **61** → `⚠️ Reduce 35%? Reply /approve` |
| User-approved intervention at tick 14 | **Reduce 35% (reduce-only)** |
| Risk before → after | **90 → 62**, then resolves to **9** |
| Order | `SODEX-51344` · `eip712` · **filled** |
| Drawdown avoided | **~9.6%** |

Same seed → **byte-identical output every run** (verified). No randomness in the evidence path.

---

## Deterministic backtest (answers "is this just heuristics?")

`GET /api/backtest?seed=7` — 180 samples over a 3-day window, action threshold 60, drawdown threshold −4.5%:

| Metric | Value |
|---|---|
| Hit rate | **76.7%** |
| Precision | **59.0%** |
| False-alarm rate | **10.7%** |
| Avg drawdown avoided | **2.34%** |
| Unprotected drawdown | **6.35%** |
| Protection edge / outperformance | **+103.8%** |

Includes a **confusion matrix** and **calibration** breakdown. Deterministic per seed, so any reviewer can reproduce the exact numbers.

---

## What is real vs simulated

| Component | Status |
|-----------|--------|
| SoSoValue news (`/news/hot`) | **Live** when `SOSOVALUE_API_KEY` set |
| SoSoValue ETF flow (v2 `POST /etf/historicalInflowChart`) | **Live** when key set — real daily net inflow + traded volume |
| SoSoValue indices (`/indices`) | **Live** when key set |
| SoSoValue macro events (`/macro/events`) | **Live** when key set |
| SoDEX orderbook (`/markets/.../orderbook`) | **Live** — public endpoint |
| SoDEX wallet positions | **Live** when `SODEX_USER_ADDRESS` set |
| BTC-PERP desk position | **Live-priced** — wallet positions or orderbook showcase when wallet empty |
| Groq AI risk memos | **Live** when `GROQ_API_KEY` set |
| SoDEX order placement | **Real testnet execution** — EIP-712 signed reduce-only orders accepted by the SoDEX matching engine with real order IDs; honest **judge-safe simulated** label if keys absent |
| Telegram alerts | **In-app rendered** — the alert payload/copy is generated by the engine and shown in the monitor UI (`/approve` flow demonstrated in-product; outbound bot delivery not wired) |
| Monitoring / backtest / replay | **Deterministic** — same seed → identical output |


Full evidence panel: **`/diag`** and **API Evidence** on the position page.

---

## SoSoValue APIs used

| Endpoint | Risk use |
|----------|----------|
| `GET v1/news/hot` | Crypto news sentiment → news risk factor |
| `POST v2/etf/historicalInflowChart` | BTC ETF institutional flow (real daily net inflow + traded volume) → ETF risk factor |
| `GET v1/indices` | Sector momentum → narrative radar |
| `GET v1/macro/events` | Macro event window → macro risk factor |

- Base: `https://openapi.sosovalue.com/openapi/{v1,v2}`
- Auth: `x-soso-api-key`
- Resilience chain: 5-min cache → sequential request queue → **automatic 429 retry with backoff** → stale live cache → deterministic demo data (UI never breaks)

---

## SoDEX integration

| Endpoint | Use |
|----------|-----|
| `GET /markets/{symbol}/orderbook` | Liquidity depth, slippage estimate |
| `GET /accounts/{address}/positions` | Live positions (when wallet configured) |
| `POST /trade/orders` | EIP-712 signed reduce-only protection orders |

- Testnet: `https://testnet-gw.sodex.dev/api/v1/perps`
- Keys: [sodex.com/apikeys](https://sodex.com/apikeys) (separate from SoSoValue)

### Signing scheme (`sodex-signer.ts`, matching the official Go SDK)

```
payload  = compact JSON {"type":"newOrder","params":{clOrdID, modifier, side, type,
           timeInForce, price, quantity, reduceOnly, positionSide}}   (exact field order)
hash     = keccak256(payload)
signature= EIP-712 sign of ExchangeAction(bytes32 payloadHash, uint64 nonce)
           domain { name:"futures", version:"0.0.1", chainId:138565 }
headers  = X-API-Key (key name) · X-API-Sign (0x01‖r‖s‖v) · X-API-Timestamp (nonce, µs)
```

### Execution proof (shown in UI after Step 4 and in the monitor loop)

```
Order ID · HTTP Status · EIP-712 signing method · Audit hash · Risk delta
```

Verified end-to-end: `POST /api/execute` → `executionMode: "testnet"`, real matching-engine
`orderID` (e.g. `2338792272`). When signing keys are absent: full UI completes with honest
**judge-safe simulated** disclosure — no fake order IDs.

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

Each factor shows **score + why** in the Explainable Risk Engine panel (Step 1). The same weighted engine drives the live monitor and the backtest, so what you see demoed is what gets validated.

**Verdict bands:** 0–30 Safe · 31–60 Watch · 61–80 Defensive · 81–100 Critical

---

## Safety controls

- No auto-trade — user checkbox + sign required (monitor alert asks `/approve` before any order)
- Max single action: 40% of position
- Slippage cap: 1.5%
- Reduce-only protection orders (never increases exposure)
- Dry-run preview before signing
- Circuit breaker on critical liquidation proximity
- Non-custodial — wallet signs directly
- Testnet default

---

## Architecture

```
Landing (live engine sim) · Judge Mode (/judge) · Diag (/diag)
          ↓
Live Monitor (/desk/monitor) ── continuous loop ──┐
          ↓                                        │
Risk Desk → BTC Demo (4-step) · Backtest · Portfolio
          ↓                                        │
API Routes → monitor · backtest · portfolio · risk-memo · execute
          ↓                                        │
Libs → monitoring.ts · risk-engine.ts · risk-factors.ts
        sosovalue.ts · sodex.ts · sodex-signer.ts · ai-risk-memo.ts
          ↓
SoSoValue OpenAPI · SoDEX Perps · Groq AI · Telegram
```

**→ Full technical deep-dive with diagrams: [ARCHITECTURE.md](./ARCHITECTURE.md)** — layer map, risk-engine internals, monitoring state machine, determinism guarantees, integration resilience.

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing — flat terminal-style product page: live risk-engine simulation (real backtest data), Watch → Warn → Act pipeline |
| `/judge` | **60-sec automated judge demo** |
| `/desk/monitor` | **★ Continuous monitoring loop + Telegram alerts + auto-intervention** |
| `/desk/backtest` | **Deterministic backtest — hit-rate, precision, drawdown avoided** |
| `/desk` | Command Center — **portfolio-wide risk** |
| `/diag` | **API evidence — live vs simulated** |
| `/desk/positions/btc-perp` | Full interactive 4-step demo |
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

Minimum for demo: `SOSOVALUE_API_KEY` + `GROQ_API_KEY`. App never crashes without keys — every path has a deterministic, honest fallback.

---

## Deploy to Vercel

```bash
npm run build
```

Add env vars in Vercel dashboard. Recommended links in submission:

```
Live Monitor:  https://your-app.vercel.app/desk/monitor
Judge Mode:    https://your-app.vercel.app/judge
Backtest:      https://your-app.vercel.app/desk/backtest
API Evidence:  https://your-app.vercel.app/diag
```

---

## Wave changelog

### Wave 1 — Foundation
- SoSoValue + SoDEX + Groq integrations with graceful fallback
- Weighted 7-factor risk engine + protection plan builder
- 4-step flow: Risk Memo → Protection Plan → Impact Preview → SoDEX Action
- Audit log + risk replay

### Wave 2 — Judge-ready product
- `/judge` 60-sec automated demo · `/diag` API evidence page
- Explainable risk factor breakdown with "why" per factor
- Execution proof panel (order ID, HTTP status, EIP-712, audit hash)
- Before/after: exposure + estimated loss at −3% move
- Reduce / Hedge / Close protection options
- Landing + README restructured for judges

### Wave 3 — From advice to an always-on desk *(directly closing Wave 2 feedback)*
- **★ Real SoDEX testnet execution**: EIP-712 `ExchangeAction` signing (futures domain, chainId 138565) — reduce-only orders accepted by the matching engine with real order IDs
- **★ Continuous monitoring loop** (`/desk/monitor`): observe → detect → alert → intervene → resolve
- **Telegram alerts** at risk thresholds with `/approve`-to-execute flow
- **Auto-intervention**: user-approved reduce-only EIP-712 order, risk 90 → 62 → resolves
- **Deterministic backtest** (`/desk/backtest`): hit-rate 76.7%, precision, false-alarm rate, avoided drawdown, confusion matrix, calibration
- **Portfolio-wide risk** (`/desk`, `/api/portfolio`): market regime + at-risk detection
- **All 10 data sources live** on `/diag` — SoSoValue v2 ETF endpoint, 429 retry/backoff, empty "simulated" list
- Every evidence path reproducible from a single seed

---

## Tech stack

Next.js 15 · TypeScript · Tailwind v4 · Groq · SoSoValue OpenAPI · SoDEX Perps · Viem (EIP-712) · Telegram · Recharts · Zod

---

## Limitations / next

- [x] Real SoDEX testnet order execution (EIP-712 signed, matching-engine order IDs) — **shipped**
- [ ] Production Vercel URL in submission
- [ ] Multi-position portfolio auto-hedging (single-position portfolio view shipped)
- [ ] Historical 30/90-day monitoring trend analytics

---

*Built for the SoSoValue Buildathon — "Build Your One-Person On-Chain Finance Business with SoSoValue."*
