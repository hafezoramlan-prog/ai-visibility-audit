# AI Visibility Audit

A tool that scores how a brand shows up in AI answer engines (ChatGPT, Perplexity) versus
traditional search, and flags on-page content gaps that limit AI/AEO visibility.

**Live demo:** _add your Vercel link here after deploying_

## Why I built this

Search behavior is shifting from "10 blue links" to direct answers from LLMs. Most SEO tooling
still optimizes for the old model. I built this to answer a concrete question I kept running into
in a marketing role: *does our content actually get surfaced when someone asks an AI assistant
for a recommendation in our category, and if not, why not?*

## What it does

1. Takes a brand, a list of competitors, a category, and a use case.
2. Generates a fixed set of buyer-intent prompts (e.g. "what is the best [category] for [use
   case]?").
3. Runs those prompts against OpenAI (ChatGPT) and, optionally, Perplexity.
4. Parses each response for brand mentions and cited source URLs.
5. Scans the brand's homepage for on-page AEO signals: schema.org structured data, FAQ
   formatting, heading hierarchy, meta description quality.
6. Produces a 0-100 visibility score (60% mention rate, 20% citation rate, 20% on-page
   readiness) plus specific content recommendations.

## What's real vs. mocked

- **Real:** OpenAI and Perplexity API calls, brand mention parsing, Perplexity citation
  extraction, and the on-page AEO scanner (live HTML parsing via Cheerio).
- **Not included:** Google AI Overviews has no public API as of this writing, so it's left out
  rather than faked. That's a known limitation of any AEO tool right now, not a gap in this one.
- **No database:** results are computed on-demand and not persisted. Adding history/trend
  tracking over time is a natural next step (see below).

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Cheerio for HTML parsing
- OpenAI SDK + Perplexity's OpenAI-compatible chat API
- Deployed on Vercel

## Architecture

```
User input (brand, competitors, category, use case, URL)
        v
Query generator (5 fixed buyer-intent templates)
        v
Parallel calls -> OpenAI + Perplexity
        v
Response parser (brand mentions, cited URLs)
        v
On-page AEO scanner (independent, runs against the brand's URL)
        v
Scoring engine -> visibility score + recommendations
        v
Results dashboard
```

See `/lib` for the pipeline logic and `/app/api/analyze` for the orchestrating route.

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. API keys are entered directly in the UI (bring-your-own-key), sent
only with that request, and never stored or logged. You need at minimum an OpenAI API key;
Perplexity is optional.

## Known limitations

- Brand matching is case-insensitive substring matching. It won't catch heavy misspellings or
  brands whose name collides with a common word.
- Scoring weights (60/20/20) are a reasonable starting point, not a validated formula.
- No rate limiting or caching, each audit run makes fresh API calls.
- No auth or persistence, this is a single-session tool by design for v1.

## Roadmap

- Add Google AI Overviews when/if a public API exists.
- Persist runs (Postgres/Supabase) to show visibility trend over time.
- Add Gemini and Claude as additional providers, the provider abstraction in `/lib/providers`
  is built to make this a drop-in addition.
- Sentiment scoring on mentions (currently mention/citation rate only).

## License

MIT
