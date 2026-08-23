# Aurum Desk — Live Gold Rate Calculator

A Next.js 14 (App Router) dashboard that fetches the live international gold
spot price (XAU/USD) and applies a karat-wise selling-rate formula in real
time.

## Stack
- Next.js 14, App Router, TypeScript
- Tailwind CSS
- No database — fully stateless, live calculation only

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local and set GOLDAPI_KEY to your key from https://www.goldapi.io
npm run dev
```

Visit http://localhost:3000.

## How it works

- `app/api/gold-price/route.ts` — server route that calls GoldAPI.io,
  caches the response in-memory for 60 seconds (plus a `next: { revalidate: 60 }`
  hint for platforms like Vercel), and returns
  `{ pricePerOunce, pricePerGram, timestamp }`. Returns a clear error JSON on
  failure or rate limiting.
- `lib/calculateGoldRate.ts` — pure calculation utility:
  1. `base = (spotPricePerOunce + adjustment) / 31.1035`
  2. `karatRate = base * karatPercentage`
  3. `finalRate = karatRate + 10`
- `app/page.tsx` — client dashboard. Polls `/api/gold-price` every 60
  seconds, lets you toggle the `+35` / `+50` world-situation adjustment,
  optionally override the spot price for testing, and switch the karat
  table between per-gram and per-tola display. All karat math happens
  client-side from the fetched spot price — no extra network calls per
  toggle.

## Deploying to Vercel

1. Push this project to a Git repository.
2. Import it in Vercel.
3. Add the `GOLDAPI_KEY` environment variable in the Vercel project
   settings (Production and Preview).
4. Deploy.

## Notes

- The in-memory cache in the API route is per server instance/lambda, so on
  serverless platforms it's a best-effort layer on top of the Next.js fetch
  cache — it still protects against back-to-back requests within the same
  warm instance.
- Displayed rates are indicative only.
