import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { z } from "zod";
import { ApplicationError } from "@/lib/errors";
import { DEFAULT_CANVAS_BASE_URL } from "./constants";

export { DEFAULT_CANVAS_BASE_URL };

const rawCanvasConfigSchema = z.object({
  baseUrl: z.string().trim().url().max(2_048),
  accessToken: z.string().min(1).max(4_096),
});

export interface CanvasConnectionConfig {
  baseUrl: string;
  accessToken: string;
}

export function parseCanvasConfig(
  input: unknown,
  allowedHosts = configuredCanvasHosts(),
): CanvasConnectionConfig {
  const parsed = rawCanvasConfigSchema.parse(input);
  const url = new URL(parsed.baseUrl);
  const hostname = url.hostname.toLowerCase();

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    isIP(hostname) !== 0 ||
    !allowedHosts.has(hostname)
  ) {
    throw new z.ZodError([
      {
        code: "custom",
        path: ["baseUrl"],
        message: "Canvas host is not allowed",
      },
    ]);
  }

  return {
    baseUrl: `${url.origin}${url.pathname.replace(/\/$/, "")}`,
    accessToken: parsed.accessToken,
  };
}

export function configuredCanvasHosts(value = process.env.CANVAS_ALLOWED_HOSTS): Set<string> {
  const defaultHost = new URL(DEFAULT_CANVAS_BASE_URL).hostname;
  return new Set(
    [defaultHost, ...(value ?? "").split(",")]
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function assertCanvasHostResolvesPublic(
  baseUrl: string,
  resolveAddresses: (hostname: string) => Promise<string[]> = defaultResolveAddresses,
): Promise<void> {
  const hostname = new URL(baseUrl).hostname;
  let addresses: string[];
  try {
    addresses = await resolveAddresses(hostname);
  } catch (error) {
    throw new ApplicationError("CANVAS_UNAVAILABLE", "Canvas hostname could not be resolved", error);
  }

  if (addresses.length === 0 || addresses.some(isNonPublicIp)) {
    throw new ApplicationError("VALIDATION_FAILED", "Canvas hostname resolved to a non-public address");
  }
}

async function defaultResolveAddresses(hostname: string): Promise<string[]> {
  return (await lookup(hostname, { all: true, verbatim: true })).map((entry) => entry.address);
}

function isNonPublicIp(address: string): boolean {
  const normalized = address.toLowerCase();
  if (normalized === "::" || normalized === "::1") return true;
  if (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("ff")
  ) return true;
  if (normalized.startsWith("::ffff:")) return isNonPublicIp(normalized.slice(7));
  if (isIP(normalized) !== 4) return false;

  const [first, second] = normalized.split(".").map(Number);
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51) ||
    (first === 203 && second === 0) ||
    first >= 224
  );
}
