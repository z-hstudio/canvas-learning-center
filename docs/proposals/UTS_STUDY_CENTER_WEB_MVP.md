# Proposal: UTS Study Center web MVP

## Status

Draft for maintainer review. This proposal does not replace the distributed
Canvas Learning Center desktop application or change its release channel.

## Context

The proposed application is a bilingual, local-first web study workspace for
UTS students. It combines mock or Canvas-sourced academic data, timetable ICS
events, deterministic priority recommendations, and personal study progress in
a modular Next.js monolith.

The existing public repository is currently a proprietary product information,
support, and download channel. Adding application source therefore requires an
explicit maintainer decision about source publication and licensing before this
work can be merged.

## Proposed boundary

The implementation is isolated under `apps/uts-study-center` so it does not
overwrite release manifests, installers, checksums, support documentation, or
the existing desktop product identity.

```text
React UI
  -> application services
  -> provider-independent domain models
  -> repository and provider interfaces
  -> Prisma/SQLite, Canvas REST, or ICS adapters
```

Canvas DTOs are runtime-validated and mapped before they enter the domain.
Official provider fields remain separate from personal progress and notes.
Hosted demo mode uses browser-local overlays and does not pretend to perform a
server-side Canvas sync.

## Included capability

- English (`en-AU`) and Simplified Chinese (`zh-CN`) UI with persistent locale
  and theme selection.
- Dashboard, subjects, subject detail, assessments, calendar, study workspace,
  settings, loading, empty, and localized failure states.
- Deterministic Today Top 3 recommendations using Sydney calendar boundaries.
- Canvas provider abstraction with allowlisted HTTPS hosts, public-DNS checks,
  bounded retries, pagination and response limits, and partial failure handling.
- Prisma/SQLite persistence for local server mode and versioned browser-local
  personal overlays for the hosted demo.
- ICS import with deterministic deduplication and expansion limits.
- Typed, optional AI provider architecture without an enabled AI dependency.

## Verification

The source contribution includes focused tests for planner scoring, translation
dictionary parity, Canvas validation and mapping, ICS parsing, AI schemas, and
repository idempotence. Pull requests touching the app run install, Prisma
generation, lint, strict TypeScript, tests, and a production build in GitHub
Actions.

Validated reference deployment:
<https://uts-study-center.vercel.app>

Source snapshot: `dc05341b7458a53f45ba181392d7ee8bca794bc1`.

## Decisions required before merge

1. Decide whether application source is allowed in this public repository and
   add an explicit source licence if it is.
2. Decide whether the UTS-specific product identity should remain a separate
   application or be generalized under Canvas Learning Center.
3. Reconcile the web MVP with the existing private desktop implementation,
   storage model, credential handling, and release process.
4. Complete a real Canvas permission smoke test without sharing tokens or
   private academic data.
5. Keep this contribution as a draft until the ownership, branding, licensing,
   and product-boundary decisions above are recorded.
