# ADR 004: Internationalization from the first release

## Context

English and Simplified Chinese are core product modes. Retrofitting translations would create hardcoded copy, fragmented dates, and state bugs during language changes.

## Decision

Use `next-intl` dictionaries for all application-controlled copy. Persist `en-AU`, `zh-CN`, or system preference locally. Keep locale in the presentation layer, format values with `Intl`, and never translate or overwrite provider source content automatically.

## Alternatives

- English-first inline strings: rejected because translation coverage and natural Chinese quality become untestable.
- Locale-specific domain records: rejected because language switching could mutate academic state.

## Consequences

Dictionary parity is testable and language changes preserve navigation and academic state. Newly shipped UI must add both natural translations in the same change.
