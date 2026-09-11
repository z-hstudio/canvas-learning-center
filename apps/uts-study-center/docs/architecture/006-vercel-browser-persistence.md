# ADR 006: Browser-local persistence for the Vercel demo

## Context

The primary MVP uses Prisma and SQLite for a single-device local installation. Vercel Functions do not provide a durable writable filesystem, so deploying the SQLite repository unchanged would make writes unreliable.

## Decision

Keep Prisma and SQLite as the local runtime. When Vercel sets its platform environment flag, render the provider-independent mock source data and store only user-owned overlays—assessment progress, study-topic state, personal notes, and imported ICS events—in browser local storage. Validate stored data before use and recompute recommendations after applying it.

## Alternatives

- Pretend SQLite is durable inside a serverless function.
- Replace SQLite everywhere with hosted Postgres.
- Provision a paid database before a real multi-user requirement exists.

## Consequences

The hosted demo remains useful, private to the browser, and free of silent server-side data loss. Official mock source fields are never replaced by local overlays. Browser data does not roam between devices; real Canvas sync and multi-user hosting will require authentication, encrypted credentials, and a durable database.
