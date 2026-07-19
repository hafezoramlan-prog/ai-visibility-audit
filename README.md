# Campaign pipeline attribution model

Interactive component that models projected pipeline contribution from
channel mix, budget, and campaign type, using GA4 / Looker Studio style
funnel logic (spend → leads → MQL → SQL → pipeline $).

## Files

- `components/CampaignPipelineModel.tsx` — the component
- `app/pipeline-model/page.tsx` — example Next.js 14 App Router page

## Setup

1. Copy `components/CampaignPipelineModel.tsx` into your existing Next.js 14
   project's `components/` folder (or drop the whole `app/pipeline-model`
   folder in too if you want it as its own route).
2. Install the one new dependency:

   ```bash
   npm install recharts
   ```

3. If your project doesn't already use the `@/` import alias, either add it
   to `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       "paths": { "@/*": ["./*"] }
     }
   }
   ```

   or change the import in `page.tsx` to a relative path.

4. Run `npm run dev` and visit `/pipeline-model`.

## Model logic

Each channel (paid search, paid social, email/owned, partner co-marketing,
events/field) carries assumed cost-per-lead, lead-to-MQL rate, MQL-to-SQL
rate, and average deal size. Budget is split across channels by the slider
weights (auto-normalized to 100%), run through the funnel, then summed into
total projected pipeline. Campaign type (launch, rollout, ABM, nurture)
applies a deal-velocity multiplier. QoQ lift compares the result against an
adjustable baseline (prior quarter pipeline).

All assumptions live in the `CHANNELS`, `TYPE_MULTIPLIER`, and
`DEFAULT_WEIGHTS` constants at the top of the component — tune them to match
real Atomix numbers if you want the defaults to reflect actuals rather than
illustrative benchmarks.
