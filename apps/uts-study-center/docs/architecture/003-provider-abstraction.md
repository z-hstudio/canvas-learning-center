# ADR 003: Academic provider abstraction

## Context

UTS uses Canvas today, but Canvas DTOs and URLs must not define the product domain or prevent support for another institution.

## Decision

Place Canvas REST calls behind `CanvasProvider`. Keep the configurable UTS base URL in the Canvas integration. Map external DTOs into application-owned `Subject`, `Assessment`, `Announcement`, and `SubjectModule` models before persistence.

## Alternatives

- Call Canvas from components: rejected because it exposes secrets, duplicates error handling, and couples UI to external schemas.
- Store raw Canvas JSON as the domain model: rejected because migrations and portability would follow provider changes.

## Consequences

Mock and future university providers can reuse services and UI. Mapping and sync code add a deliberate translation layer that must be tested.
