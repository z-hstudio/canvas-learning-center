# ADR 001: Modular monolith

## Context

The MVP spans UI, local data, Canvas, timetable import, planning, and future AI, but does not need independent deployment or distributed coordination.

## Decision

Use one Next.js App Router application with capability-oriented features, provider-independent domain models, application services, repositories, and infrastructure adapters. Dependencies point inward toward domain contracts.

## Alternatives

- Microservices: rejected because operational cost and failure modes exceed MVP needs.
- Route-centric code only: rejected because provider and business rules would leak into React.

## Consequences

Deployment and local development stay simple. Modules can later be extracted at explicit service boundaries, but internal boundaries require review discipline rather than network enforcement.
