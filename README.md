# NayaPath — A new path. A future of your own.

NayaPath is a voice-first livelihood discovery prototype. It helps people explore career directions, small-business ideas and supplementary income without pressuring them to abandon current work.

## Included
- Responsive React + TypeScript + Vite application.
- Browser speech input where supported, with typed fallback.
- Discovery profile and optional financial context capture.
- Adaptive assessment prototype with baseline scenarios, progressively harder challenges, attempts, response time, hints, practical mini-projects and reflection.
- Conservative readiness review: unknown financial values are never treated as zero or safe; the person's willingness is required.
- Local browser persistence, PWA shell and Docker files.

## Adaptive assessment
Challenge selection uses repeated accuracy, hint dependence and retention evidence—not elapsed time. The current UI captures attempts, response time, hints and practical application. Retention is represented in the engine data model but needs a spaced-recall follow-up before it can be populated reliably; the prototype does not fabricate it.

The readiness review considers practical evidence, interest, willingness, verified financial context, monthly surplus, emergency savings and risk comfort. Missing financial data remains unknown. This demo does not offer financial advice or tell anyone to quit, borrow or spend emergency reserves.

## Run locally
Requires Node.js 20+.

```bash
npm install
npm run dev
npm run build
npm test
```

Docker: `docker compose up --build`, then open http://localhost:4173.

## Voice and languages
Speech recognition depends on browser/device support. English and Hindi are currently wired to the browser API. Other language choices in the discovery UI are not a claim of implemented speech support. Typed input remains available.

## Limitations / next steps
- Browser-local data only; no accounts, cloud sync or backend database.
- Financial details captured in discovery are not yet securely integrated into the assessment review, so the review remains conservative and marks them unverified.
- The challenge bank is illustrative, not a validated psychometric instrument or employment eligibility test.
- Retention needs spaced follow-up questions and persistent records.
- Local opportunities and learning resources need curated sources and provenance.
- Production requires privacy/security review, accessibility and language testing, expanded scenarios and independent bias/reliability evaluation.

## Principles
1. Explore before you transition.
2. Keep current livelihood and responsibilities in view.
3. No arbitrary 30-day deadline.
4. Assess demonstrated learning and application, not supposed innate potential.
5. The person's own interest and decision matter.
6. Financial unknowns remain unknown.

## Stack
React 18, TypeScript, Vite, Lucide, Vitest, Docker and a lightweight PWA shell.