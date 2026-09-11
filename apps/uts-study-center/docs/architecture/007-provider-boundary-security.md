# ADR 007: Provider boundary security

## Context

Canvas URLs and payloads are external input. A configurable provider URL can create server-side request forgery risk, pagination can attempt to leave the trusted origin, and large or malformed responses can destabilize synchronization.

## Decision

Require HTTPS and an explicit Canvas hostname allowlist, resolve allowed hosts to public addresses before connecting, reject redirects, lock pagination to the configured API origin, limit pages and response bytes, retry only transient statuses with a bounded budget, and validate provider payloads with Zod before mapping them into domain models.

## Alternatives

- Trust any syntactically valid URL: rejected because DNS names can resolve to internal infrastructure.
- Pass Canvas JSON directly to the UI: rejected because malformed provider data would bypass domain validation.
- Retry indefinitely: rejected because it hides provider outages and increases rate-limit pressure.

## Consequences

New university hosts require an explicit environment configuration. Provider failures become predictable typed application errors, while cached sections remain available during partial sync.
