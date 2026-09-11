# ADR 002: Local-first data

## Context

Academic information is sensitive, external providers can fail, and the MVP must work without credentials or network access.

## Decision

Use Prisma with a device-local SQLite database. Preserve provider source fields separately from personal progress, notes, preferences, timetable imports, sync metadata, and AI cache records. Populate a complete demo dataset when no provider data exists.

## Alternatives

- Browser storage for all data: rejected because relational updates, migrations, integrity, and server-side secrets are weak.
- Hosted database from day one: rejected because it adds accounts, privacy risk, and operations before they are required.

## Consequences

The app remains useful offline after caching and has low operational cost. Multi-device sync and multi-user hosting require a later authenticated Postgres migration.
