export const applicationErrorCodes = [
  "AUTH_INVALID",
  "AUTH_EXPIRED",
  "CANVAS_UNAVAILABLE",
  "CANVAS_RATE_LIMITED",
  "CANVAS_PERMISSION_DENIED",
  "SYNC_FAILED",
  "TIMETABLE_PARSE_FAILED",
  "AI_PROVIDER_UNAVAILABLE",
  "AI_RATE_LIMITED",
  "NETWORK_OFFLINE",
  "VALIDATION_FAILED",
  "UNKNOWN",
] as const;

export type ApplicationErrorCode = (typeof applicationErrorCodes)[number];

export class ApplicationError extends Error {
  constructor(
    public readonly code: ApplicationErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export function toApplicationError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) return error;
  return new ApplicationError(
    "UNKNOWN",
    error instanceof Error ? error.message : "Unknown application error",
    error,
  );
}
