# Akindo submission copy — Wave 3 (paste into product page)

## What it does

**Upside** is an always-on AI risk desk for on-chain traders. It continuously monitors open perp positions, scores risk 0–100 across liquidity, volatility, news, ETF flows, macro, and narrative factors, and generates Groq-powered AI memos that explain *why* a position is becoming dangerous.

New in Wave 3: the product runs as a **continuous loop** — observe → detect → alert → intervene → resolve. When risk crosses a threshold, a **Telegram-style alert** fires with an `/approve`-to-execute flow. On approval, Upside places a **real EIP-712 signed reduce-only order on SoDEX testnet** — accepted by the matching engine with a real order ID (e.g. `orderID 2338792272`). Risk drops (90 → 62 → resolves), and the whole timeline lands in an audit trail.

**Live:** https://upside-xi.vercel.app · **★ Live Monitor:** https://upside-xi.vercel.app/desk/monitor · **Judge Mode (60s demo):** https://upside-xi.vercel.app/judge · **Backtest:** https://upside-xi.vercel.app/desk/backtest

## The problem it solves

Signal bots help traders **enter** positions. They rarely help traders **survive** them.

Solo on-chain traders operate without a 24/7 risk desk. When liquidation buffers shrink, ETF outflows accelerate, or orderbook depth weakens, traders react after the damage is done. Upside fills that gap — continuous monitoring, early alerts, evidence-based explanations, and user-approved protection that actually executes.

## What changed since Wave 2 — built exactly what reviewers asked for

Every piece of Wave 2 feedback is now shipped and verifiable:

- *"deeper ongoing monitoring, alerts, and live intervention rather than one-time advice"* (SoSoValue) → **continuous monitoring loop** at `/desk/monitor`
- *"automated alerts/intervention"* + *"Telegram alerts for critical thresholds"* → **threshold-triggered alerts** with `/approve` flow
- *"real SoDEX testnet execution would make this top-tier"* → **shipped**: EIP-712 signed reduce-only orders accepted by the live matching engine, real order IDs
- *"risk logic is still fairly heuristic"* → **deterministic backtest** with hit-rate, precision, false-alarm rate, avoided drawdown, confusion matrix, calibration
- *"portfolio-wide risk tracking"* → portfolio risk view with market regime + at-risk detection

## Challenges I ran into

- **Reverse-engineering SoDEX order signing** — the EIP-712 `ExchangeAction` scheme (futures domain, chainId 138565, keccak256 of exact-field-order compact JSON, `0x01‖r‖s‖v` header format, microsecond nonces) had to be matched byte-for-byte against the official Go SDK before the matching engine accepted a single order.
- **Two separate API ecosystems** — SoSoValue and SoDEX use different keys, endpoints, and auth models; both wired and documented.
- **SoSoValue rate limits (429)** — solved with a resilience chain: 5-min cache → sequential request queue → automatic retry with backoff → stale live cache → honest demo fallback. All 10 data sources now report **live** on `/diag`.
- **Proving the risk engine works** — claims aren't enough. A deterministic backtest (180 samples, fixed seed) lets anyone reproduce the exact metrics: 76.7% hit rate, 59% precision, 10.7% false-alarm rate, +103.8% protection edge.
- **Making risk legible in 60 seconds** — a guided Judge Mode walks through the full loop with live progress animations.

## Technologies I used

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Groq** (`llama-3.3-70b-versatile`) for AI risk memos with deterministic fallback
- **SoSoValue OpenAPI** — news sentiment, v2 ETF historical inflow (real daily net flow), indices, macro events
- **SoDEX Perps API** — orderbook, positions, **real EIP-712 signed reduce-only order execution on testnet**
- **Viem** (EIP-712 signing) · **Recharts** (charts) · **Zod** (validation)

## How I built it

The core is a deterministic weighted risk engine: liquidity (25%), volatility (20%), position exposure (20%), macro (15%), news (10%), ETF flow (5%), narrative (5%) → a single 0–100 score with verdict bands (Safe → Critical). AI explains the score; it never controls it. The **same engine** drives the live monitor, the position demo, and the backtest — what you see demoed is what gets validated.

On top of that:

1. **Service layer** — `sosovalue.ts`, `sodex.ts`, `sodex-signer.ts` (EIP-712), `monitoring.ts`, `risk-engine.ts`, `ai-risk-memo.ts`
2. **12 API routes** — monitor, backtest, portfolio, positions, risk memo, protection plans, execute, audit, replay, narrative, visibility, diag
3. **Monitoring state machine** — seeded tick loop; each tick recomputes the full 7-factor score, fires alerts at threshold, models user approval, executes reduce-only protection, records the risk delta
4. **Reproducible evidence** — `GET /api/monitor?seed=42` and `GET /api/backtest?seed=7` return byte-identical output every run
5. **Transparent fallback** — `/diag` pings every dependency in real time and shows Live / Fallback per source; the app never crashes without keys

## What I learned

- Capital protection is a stronger story than another signal bot — "risk 90 → 62, drawdown avoided ~9.6%" lands in seconds.
- Real execution beats simulated execution: getting one real matching-engine order ID was worth more than any mock.
- Measured beats promised — a reproducible backtest with a confusion matrix answers "is this just heuristics?" better than any adjective.
- Fallback transparency builds trust more than pretending everything is live.
- Combining market intelligence (SoSoValue) with execution (SoDEX) in one closed loop is where real trader value lives.

## What's next for Upside

- Outbound Telegram bot delivery (alert copy + `/approve` flow already built in-product)
- WebSocket-based live monitoring of real SoDEX accounts
- Multi-position portfolio auto-hedging with correlation detection (portfolio risk view shipped)
- Out-of-sample validation across more market regimes
- Mobile-first risk desk with one-tap approvals
