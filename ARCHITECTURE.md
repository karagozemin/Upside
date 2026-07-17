# Upside — Architecture

Technical reference for how Upside is put together: layers, data flow, the risk engine, determinism guarantees, and external integrations.

> Product overview, judge path and setup live in the [README](./README.md).

---

## 1. System overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          BROWSER (UI)                           │
│                                                                 │
│  /            landing — live engine sim (real backtest data)    │
│  /judge       60-sec automated walkthrough                      │
│  /desk        command center — portfolio-wide risk              │
│  /desk/monitor    ★ continuous loop: observe→detect→alert→act   │
│  /desk/backtest   deterministic validation metrics              │
│  /desk/positions/[id]   4-step interactive demo                 │
│  /diag        API evidence — live vs simulated per source       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ fetch (JSON)
┌───────────────────────────▼─────────────────────────────────────┐
│                   NEXT.JS API ROUTES (server)                    │
│                                                                  │
│  /api/monitor     /api/backtest    /api/portfolio                │
│  /api/positions   /api/risk-memo   /api/protection-plans         │
│  /api/execute     /api/replay      /api/audit    /api/diag       │
└───────────────────────────┬──────────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                      DOMAIN LIBS (src/lib)                        │
│                                                                   │
│  risk-engine.ts ── weighted 7-factor scoring (single source)      │
│  risk-factors.ts ─ factor builders (liquidity, macro, news …)     │
│  monitoring.ts ─── seeded tick loop, alert + intervention states  │
│  risk-validation.ts ─ seeded backtest, hit-rate / precision       │
│  ai-risk-memo.ts ── Groq memo + deterministic fallback            │
│  sosovalue.ts ───── SoSoValue client (cache, queue, 429 fallback) │
│  sodex.ts / sodex-signer.ts ─ orderbook, positions, EIP-712       │
│  audit-log.ts ───── decision trail with content hashes            │
└──────────┬──────────────────┬──────────────────┬──────────────────┘
           │                  │                  │
   ┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
   │  SoSoValue    │  │    SoDEX      │  │    Groq       │
   │  OpenAPI      │  │  Perps API    │  │    LLM        │
   │  (intel)      │  │  (execution)  │  │  (memos)      │
   └───────────────┘  └───────────────┘  └───────────────┘
```

Three layers, one rule: **all risk math lives in `src/lib` and is shared by every surface** — the same engine drives the live monitor, the position demo, and the backtest. What judges see demoed is exactly what gets validated.

---

## 2. Repository layout

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # landing (live engine sim)
│   ├── judge/                # automated 60-sec demo
│   ├── diag/                 # API evidence page
│   ├── desk/                 # product surfaces
│   │   ├── page.tsx          #   portfolio command center
│   │   ├── monitor/          #   ★ continuous monitoring loop
│   │   ├── backtest/         #   deterministic validation
│   │   ├── positions/[id]/   #   4-step interactive flow
│   │   ├── replay/ audit/ narrative/
│   └── api/                  # server routes (thin — delegate to lib)
├── components/
│   ├── desk/                 # risk desk UI (charts, panels, proof)
│   ├── landing/              # WaveCanvas, LiveTicker
│   └── ui/                   # shared primitives
├── hooks/                    # useDataLoad etc.
└── lib/                      # ★ all domain logic (framework-free)
```

Design rule: **API routes are thin adapters.** They parse params (Zod), call a lib function, return JSON. No business logic in routes — everything in `lib/` is unit-testable and UI-independent.

---

## 3. Risk engine

`risk-engine.ts` computes one explainable score from seven weighted factors built in `risk-factors.ts`:

```
Total Risk (0–100) =
  Liquidity / Slippage      × 25%   ← SoDEX orderbook depth
+ Market Stress (vol)       × 20%   ← price volatility
+ Position Exposure         × 20%   ← leverage, liq distance
+ Macro Events              × 15%   ← SoSoValue macro calendar
+ News / Narrative Shock    × 10%   ← SoSoValue /news/hot
+ ETF / Institutional Flow  ×  5%   ← SoSoValue ETF inflow
+ Sector Narrative          ×  5%   ← SoSoValue indices
```

Each factor returns `{ score, weight, why }` — the UI renders the *why*, never just the number.

**Verdict bands:** 0–30 Safe · 31–60 Watch · 61–80 Defensive · 81–100 Critical.

The same function is called by:
- `/api/positions/[id]` — live position scoring
- `monitoring.ts` — each tick of the loop
- `risk-validation.ts` — every backtest sample

---

## 4. The monitoring loop

`monitoring.ts` implements the Wave 3 headline feature as a seeded state machine:

```
        ┌──────────────────────────────────────────┐
        ▼                                          │
   ┌─────────┐   risk ≥ 60   ┌─────────┐  approve  │
   │ observe │──────────────▶│  alert  │─────────┐ │
   └─────────┘               └─────────┘         ▼ │
        ▲                    (Telegram      ┌───────────┐
        │                     payload)      │ intervene │
        │                                   │ (reduce-  │
   ┌─────────┐                              │  only,    │
   │ resolve │◀─────────────────────────────│  EIP-712) │
   └─────────┘      risk drops              └───────────┘
```

- Each tick recomputes the full 7-factor score.
- At threshold, an alert payload (the exact Telegram message copy) is generated and logged.
- Intervention is **never automatic** — it models the user's `/approve`, then places a reduce-only order and records the risk delta.
- The whole timeline is derived from a seed: `GET /api/monitor?seed=42` → byte-identical output every run.

---

## 5. Determinism & evidence

Everything judge-facing is reproducible:

| Path | Mechanism |
|---|---|
| `/api/monitor?seed=N` | seeded PRNG (mulberry32-style) drives the tick series |
| `/api/backtest?seed=N` | same seed → identical samples, confusion matrix, metrics |
| Risk memos | Groq when key present; deterministic template fallback otherwise |
| Order execution | **real EIP-712 testnet execution** when keys set — matching-engine order IDs (verified, e.g. `orderID 2338792272`); honest "judge-safe simulated" label otherwise — **never fake order IDs** |
| Audit log | every decision hashed and appended (`audit-log.ts`) |

`/diag` and `/api/diag` report, per data source, whether the running instance is on **live** data or **fallback** — so a reviewer never has to guess what's real. The page shows a spinner while the server pings every external endpoint in real time; with keys configured all 10 sources report **live** and the "simulated" column is empty.

**Fallback safety net:** every external call is wrapped so a failure can never break the UI — SoSoValue → deterministic demo intel, SoDEX orderbook/positions → demo book/positions, account state → showcase position, Groq → deterministic template memo. If all live sources go down simultaneously the product keeps working end-to-end on honest, clearly-labelled fallback data.

---

## 6. External integrations

### SoSoValue (`sosovalue.ts`)
- Base `https://openapi.sosovalue.com/openapi/{v1,v2}`, auth via `x-soso-api-key`.
- Endpoints: `v1 GET /news/hot`, `v2 POST /etf/historicalInflowChart` (real daily net inflow + traded volume for US BTC spot ETFs), `v1 GET /indices`, `v1 GET /macro/events`.
- **Resilience:** 5-minute in-memory cache → sequential request queue (avoids burst 429s) → **automatic retry with backoff on 429** → serve stale live cache → only then deterministic demo data. Each response is tagged with its provenance for `/diag`.

### SoDEX (`sodex.ts`, `sodex-signer.ts`)
- Testnet gateway `https://testnet-gw.sodex.dev/api/v1/perps`.
- Reads: orderbook (public), wallet positions (when `SODEX_USER_ADDRESS` set).
- Writes: `POST /trade/orders` with **Viem EIP-712** typed-data signatures, reduce-only — **verified end-to-end against the live testnet matching engine** (real order IDs returned).

**Signing scheme** (reverse-engineered to match the official `sodex-go-sdk`):

```
payload   = compact JSON {"type":"newOrder","params":{clOrdID, modifier, side, type,
            timeInForce, price, quantity, reduceOnly, positionSide}}   ← exact Go struct field order
hash      = keccak256(payload)
signature = EIP-712 signTypedData:
              domain  { name:"futures", version:"0.0.1", chainId:138565 }
              type    ExchangeAction(bytes32 payloadHash, uint64 nonce)
headers   = X-API-Key:       API key *name* (not address)
            X-API-Sign:      0x01 ‖ r ‖ s ‖ v   (v as 0/1, not 27/28)
            X-API-Timestamp: nonce in microseconds
```

Gotchas encoded in `sodex-signer.ts`: numeric strings must have trailing zeros stripped (`0.0010` → `0.001`), quantity is rounded to the market's lot step (0.0001 for BTC-PERP), and success is `HTTP 200 + {code:0, data:[{orderID}]}` rather than a REST status code.

### Groq (`ai-risk-memo.ts`)
- `llama-3.3-70b-versatile` generates the plain-English risk memo from the factor breakdown. The factors are inputs to the LLM, never the other way round — **the score is math, the memo is narration.**

---

## 7. Safety model

```
  user intent ──▶ dry-run preview ──▶ checkbox + explicit approve ──▶ EIP-712 sign ──▶ reduce-only order
                                                                          │
                                                              caps: ≤40% of position,
                                                              slippage ≤1.5%, circuit
                                                              breaker near liquidation
```

- Non-custodial; the wallet signs directly. No private keys touch the app beyond the optional SoDEX API signing key (testnet).
- Protection orders can only *decrease* exposure.
- Every action lands in the audit trail with a content hash.

---

## 8. Request lifecycle (example: position page)

```
GET /desk/positions/btc-perp
  └▶ /api/positions/btc-perp
       ├─ sodex.ts        → orderbook + (wallet positions | showcase)
       ├─ sosovalue.ts    → news, ETF flow, indices, macro (cached)
       ├─ risk-factors.ts → 7 factor objects { score, weight, why }
       ├─ risk-engine.ts  → total score + verdict band
       └─ audit-log.ts    → decision recorded
  └▶ /api/risk-memo        (Groq memo, deterministic fallback)
  └▶ /api/protection-plans (reduce / hedge / close + impact preview)
```

---

## 9. Tech stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind v4 · Viem (EIP-712) · Groq SDK · Recharts · Zod

No database — state is derived (seeded) or ephemeral by design, which is what makes every evidence path reproducible.
