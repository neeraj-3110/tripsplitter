# TripSplit

A simple, clean expense-splitting app for trips with friends — built with React, Vite, Tailwind CSS, and Supabase.

Two things make it different from a plain calculator:

1. **Every expense can carry a photo of the place it happened** — a visual memory, not a location tracker (no GPS, no maps).
2. **Automatic trip insights** — category breakdown, percentages, biggest category, average/highest expense — computed straight from your data, no AI involved.

---

## 1. Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Supabase (Postgres + Auth + Storage) |
| Routing | React Router v6 |

Everything runs from static files + Supabase — there's no separate Node server to host.

---

## 2. Project structure

```
expense-splitter/
├── src/
│   ├── components/       # Reusable UI pieces (cards, empty states, photo upload…)
│   ├── context/           AuthContext.jsx — Supabase auth session/profile
│   ├── hooks/             useTrips.js, useTripDetails.js — data fetching + balances
│   ├── lib/
│   │   ├── supabaseClient.js
│   │   └── splitCalculations.js   # money-safe split/balance/insight math
│   └── pages/             One file per screen (Dashboard, TripDetails, AddExpense…)
├── supabase/
│   └── schema.sql         # Full DB schema + RLS policies + storage bucket
├── .env.example
└── package.json
```

---

## 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste the entire contents of `supabase/schema.sql` → **Run**.
   This creates all tables, indexes, RLS policies, helper functions, and the
   `expense-photos` storage bucket in one go.
3. Go to **Authentication → Providers** and make sure **Email** is enabled.
   - For local testing, you can turn off "Confirm email" under
     **Authentication → Settings** so you can sign up and log in immediately.
4. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key

---

## 4. Run locally

```bash
cd expense-splitter
npm install
cp .env.example .env
# edit .env and paste your Supabase URL + anon key
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

---

## 5. Build for production

```bash
npm run build
npm run preview   # optional: sanity-check the production build locally
```

This outputs static files to `dist/`.

---

## 6. Deploy

Any static host works since this is a client-only app talking directly to Supabase.

**Vercel / Netlify (recommended, easiest):**
1. Push this folder to a GitHub repo.
2. Import the repo in Vercel or Netlify.
3. Build command: `npm run build`, output directory: `dist`.
4. Add the two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the host's project settings.
5. Deploy.

**Any static host (S3, GitHub Pages, Cloudflare Pages, etc.):**
Run `npm run build` and upload the contents of `dist/` — just make sure the env vars are set at build time, since Vite bakes them into the bundle.

---

## 7. How the core logic works

### Equal splitting without rounding errors (`src/lib/splitCalculations.js`)
All money math happens in **integer paise**, not floating-point rupees. An amount is split evenly in paise, and if it doesn't divide cleanly, the leftover paise are handed one-by-one to the first participants — so shares always sum to *exactly* the original amount (e.g. ₹1,000 ÷ 3 → ₹333.34 / ₹333.33 / ₹333.33).

### Balances
For each trip member: `net = amount paid − amount owed`. Positive means they're owed money; negative means they owe.

### Settlement suggestions
A greedy debtor/creditor matching algorithm (`simplifySettlements`) turns everyone's net balance into the **minimum number of "X pays Y"** transactions, so you're not chasing five separate small payments. Marking a suggested payment "Settled" records it in the `settlements` table, and future suggestions automatically account for it.

### Insights
Computed directly from stored expenses — total spend, per-category totals and percentages, biggest category, expense count, average, and highest single expense. No AI, no external calls — it's arithmetic over your own data.

---

## 8. Security notes

- Row Level Security is enabled on every table. A user can only see trips they're a member of (checked via `SECURITY DEFINER` helper functions to avoid RLS recursion), and only their own `profiles` row.
- The `expense-photos` storage bucket is public-read (so `<img>` tags load without extra auth) but only authenticated users can upload.
- All amounts have a `check (amount > 0)` constraint at the database level — the frontend also validates, but the database is the source of truth.
- No secrets are hardcoded; both Supabase values come from environment variables.

**One thing worth knowing:** the split/balance math currently runs on the client using data fetched under RLS. For a friends-and-family expense tracker this is a reasonable trade-off, but if you ever need to fully distrust the client (e.g. a public multi-tenant product), move `computeBalances` into a Postgres function or Edge Function so the numbers are calculated server-side too.

---

## 9. What's intentionally NOT included (v1)

Per the brief, these are left for later versions: GPS/maps, AI expense entry, receipt OCR, UPI/payment gateways, chat, notifications, multiple currencies, unequal/percentage splits, and subscriptions. The app is deliberately kept to: trips, members, expenses with photos, equal splitting, balances, settlement, and insights.

---

## 10. Manual test checklist

- [ ] Sign up, confirm/log in, log out, log back in
- [ ] Create a trip with 3+ members
- [ ] Add an expense split 2 ways, then one split 3 ways — check rounding sums to the exact total
- [ ] Add an expense with a photo; confirm it shows as a thumbnail and full-size on details
- [ ] Remove/replace a photo on an existing expense
- [ ] Edit an expense (amount, payer, participants) and confirm balances update
- [ ] Delete an expense and confirm balances update
- [ ] Open Insights: check totals, percentages, biggest category, average, highest
- [ ] Open Settle Up, mark a payment settled, confirm it drops off the suggestions
- [ ] Refresh the page and log out/in — confirm everything persists
- [ ] Try an invalid amount (0 or blank) and no participants selected — confirm validation messages
- [ ] Check the layout on a narrow mobile width and on desktop
