interface FingerprintInput {
  externalId?: string;
  title: string;
  subjectCode?: string;
  location?: string;
  startAt: string;
  endAt: string;
  source: string;
}

export function timetableFingerprint(event: FingerprintInput): string {
  const normalized = [
    event.externalId ?? "",
    event.title.trim().toLowerCase(),
    event.subjectCode?.trim().toUpperCase() ?? "",
    event.location?.trim().toLowerCase() ?? "",
    new Date(event.startAt).toISOString(),
    new Date(event.endAt).toISOString(),
    event.source.trim().toLowerCase(),
  ].join("|");
  return stableHash(normalized);
}

/**
 * A deterministic, non-cryptographic 128-bit fingerprint. Timetable
 * deduplication needs stable equality, not password-grade hashing, and this
 * implementation runs in both Node.js and the browser-hosted local mode.
 */
function stableHash(value: string): string {
  const seeds = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35];
  return seeds
    .map((seed) => {
      let hash = seed >>> 0;
      for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193) >>> 0;
      }
      return hash.toString(16).padStart(8, "0");
    })
    .join("");
}
