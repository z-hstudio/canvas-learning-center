type LogLevel = "info" | "warn" | "error";

const blockedKeys = /token|secret|password|api[-_]?key|content|message/i;

export function logEvent(
  level: LogLevel,
  event: string,
  context: Record<string, unknown> = {},
): void {
  const safeContext = Object.fromEntries(
    Object.entries(context).filter(([key]) => !blockedKeys.test(key)),
  );
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...safeContext,
  });

  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}
