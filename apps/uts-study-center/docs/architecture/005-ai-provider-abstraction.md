# ADR 005: Optional AI provider abstraction

## Context

DeepSeek will later support bilingual summaries and explanations, but AI must not be an availability dependency or silently become academic source of truth.

## Decision

Define an `AIProvider` and `AIService`, typed requests with mandatory output locale, central prompt builders, Zod-validated structured results, and cache metadata keyed by source hash, locale, prompt version, and model. Keep AI controls disabled until configured and require explicit user action.

## Alternatives

- Direct DeepSeek calls from React: rejected because provider changes, credential handling, prompts, and validation would be scattered.
- Automatic background summaries: rejected because of privacy, cost, and source-of-truth risk.

## Consequences

DeepSeek, OpenAI, local, or university models can be added without UI rewrites. AI output requires separate labelling, citations, staleness checks, and security review before activation.
