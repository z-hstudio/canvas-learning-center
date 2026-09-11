# UTS Study Center

UTS Study Center is a bilingual, local-first academic workspace for University of Technology Sydney students. The MVP combines course, assessment, announcement, timetable, progress, and revision data into a single action-oriented interface. It runs completely with realistic demo data when Canvas and AI credentials are absent.

## Architecture

The application is a modular Next.js monolith. UI features depend on application services and domain models; infrastructure adapters sit behind provider and repository boundaries.

```text
React UI → server actions / services → domain rules → repositories / provider interfaces
                                               ↘ Prisma + SQLite / Canvas / ICS
```

Key directories:

- `src/features`: route-level product capabilities.
- `src/domain`: provider-independent academic models and deterministic planner rules.
- `src/services`: sync and application orchestration.
- `src/repositories`: Prisma-backed local persistence.
- `src/integrations`: Canvas and timetable adapters.
- `src/lib/ai`: typed AI provider contracts, prompts, Zod schemas, and DeepSeek adapter.
- `messages`: complete `en-AU` and `zh-CN` dictionaries.
- `docs/architecture`: architectural decision records.

## Setup

Requirements: Node.js 22 or later and npm.

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

Open the local URL printed by Next.js. On first use, the database is seeded with demonstration subjects, assignments, modules, announcements, timetable events, and study topics.

## Development

Useful commands:

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

Prisma migrations are stored in `prisma/migrations`. Use `npm run db:migrate` for schema changes; do not edit the SQLite schema manually.

## Canvas configuration

Create a personal Canvas access token in Canvas and set these server-only variables:

```dotenv
CANVAS_BASE_URL="https://canvas.uts.edu.au"
CANVAS_ALLOWED_HOSTS="canvas.uts.edu.au"
CANVAS_ACCESS_TOKEN=""
```

The Settings connection test sends a token only to the server for that explicit request. It does not persist the token. Continuous sync reads `CANVAS_ACCESS_TOKEN` from the server environment through the credential-store interface. Canvas hosts must be explicitly allowlisted with `CANVAS_ALLOWED_HOSTS`, resolve only to public IP addresses, and use HTTPS. Canvas DTOs are runtime-validated and mapped into internal models before persistence.

Sync is manual in this MVP. It fetches courses first, then handles assignments, modules, files, and announcements independently. Requests use bounded retries, response and pagination limits, and same-origin pagination enforcement. A section failure does not discard cached data from other sections.

## Timetable import

Export an `.ics` file from UTS MyTimetable and import it in Settings → Timetable. The RFC 5545 parser normalizes one-off and recurring events. A deterministic 128-bit fingerprint of stable event fields prevents duplicate imports in both Node.js and browser-local modes. Calendar-feed polling is not enabled in the MVP.

## Bilingual architecture

All application-controlled UI copy lives in `messages/en-AU.json` and `messages/zh-CN.json`. A client locale provider wraps `next-intl`, persists `English`, `简体中文`, or `Follow system` locally, and switches presentation without changing route or domain state. Locale-aware formatting uses `Intl` with `Australia/Sydney` by default.

Canvas source content remains unchanged. A future localized representation is separate from source data and must be labelled as AI-generated.

## AI provider architecture

AI is optional and disabled by default. Components never import DeepSeek directly:

```text
UI → AIService → AIProvider → DeepSeekProvider / another provider
```

Every typed request includes `outputLocale`. Prompt builders preserve dates, numbers, source facts, and English technical terms in Chinese explanations. Structured results are validated with Zod. Future cache records include source hash, locale, prompt version, and model so changed source content makes earlier summaries stale.

Reserved variables:

```dotenv
DEEPSEEK_API_KEY=""
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"
```

No academic content is sent to an AI provider automatically.

## Local data

SQLite data is stored in `data/uts-study-center.db` and is excluded from Git. Prisma separates cached provider entities from personal assessment progress, study topics, notes, preferences, sync state, timetable events, and AI cache metadata. Provider external IDs use unique constraints but are not application primary keys.

On Vercel, the application deliberately switches to browser-local persistence rather than writing SQLite inside a serverless function. Personal progress, notes, user-created study topics, topic state, and imported ICS events are stored in that browser. Source mock data is refreshed independently and local overlays cannot replace official source fields. This hosted mode is a private demo workspace, not a multi-user cloud account.

## Vercel deployment

The project can be deployed without Canvas, DeepSeek, or database credentials:

```bash
vercel link
vercel deploy
```

Validate the preview with `vercel curl`, then promote the same tested artifact. A future authenticated multi-user release should connect Postgres rather than attempting to share browser-local data.

## Security

- Secrets are server-only, ignored by Git, redacted from structured logs, and never returned to the browser after a request.
- The Canvas test requires HTTPS, an explicit hostname allowlist, public DNS resolution, same-origin pagination, and bounded response sizes. Mutation routes reject cross-site browser requests.
- Canvas content is rendered as text, not injected as HTML.
- Production responses include CSP, frame denial, MIME sniffing prevention, a restrictive permissions policy, and no-index metadata.
- No telemetry, analytics, advertising, or tracking SDK is installed.
- `/api/health` reports only deployment health and feature availability; it never returns credentials or academic content.
- The credential interface is ready for encrypted local storage or OS keychains. The web MVP intentionally uses a read-only environment implementation.
- Before a multi-user public release, add authentication, authorization, CSRF review, per-user encryption, rate limits, secret rotation, and a managed Postgres deployment.

## Testing

The Vitest suite covers deterministic priority scoring, translation-key parity, Canvas DTO mapping, ICS parsing and recurrence expansion, and AI structured-output validation. ESLint, strict TypeScript, tests, and the production build are independent quality gates.

## Known limitations

- Canvas sync supports core course, assignment, module, announcement, and file data; grade views still await live-permission validation.
- Timetable feed polling and background sync are not enabled.
- The SQLite database is device-local and single-user.
- The Vercel demo stores personal data only in the current browser; it does not sync between browsers or devices.
- AI controls are deliberately disabled until a provider is configured; PDF/PPTX extraction, OCR, RAG, flashcards, and quizzes are not implemented.
- Calendar month/week/agenda views focus on classes and assessment deadlines; editing events is out of scope.
- Canvas API behaviour still requires an authenticated UTS smoke test.

## Future roadmap

1. Validate Canvas permissions and pagination against a real UTS student account.
2. Add encrypted per-user credential storage and authentication for hosted use.
3. Add scheduled sync with freshness and retry policies.
4. Add safe calendar-feed polling and change detection.
5. Enable explicitly requested, cited DeepSeek summaries and explanations.
6. Build document ingestion behind a provider-independent pipeline.
7. Introduce study-plan and spaced-repetition strategies behind existing interfaces.
8. Migrate SQLite to Postgres when multi-user hosting is required.
