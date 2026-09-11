import { ApplicationError } from "@/lib/errors";
import { canvasResponseError } from "./errors";

export interface CanvasClientConfig {
  baseUrl: string;
  accessToken: string;
  timeoutMs?: number;
  retryAttempts?: number;
  retryBaseDelayMs?: number;
  maxPages?: number;
  maxResponseBytes?: number;
  fetchImpl?: typeof fetch;
}

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

export class CanvasClient {
  private readonly apiRoot: URL;
  private readonly accessToken: string;
  private readonly timeoutMs: number;
  private readonly retryAttempts: number;
  private readonly retryBaseDelayMs: number;
  private readonly maxPages: number;
  private readonly maxResponseBytes: number;
  private readonly fetchImpl: typeof fetch;

  constructor(config: CanvasClientConfig) {
    const baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiRoot = new URL(`${baseUrl}/api/v1/`);
    this.accessToken = config.accessToken;
    this.timeoutMs = config.timeoutMs ?? 12_000;
    this.retryAttempts = config.retryAttempts ?? 2;
    this.retryBaseDelayMs = config.retryBaseDelayMs ?? 250;
    this.maxPages = config.maxPages ?? 100;
    this.maxResponseBytes = config.maxResponseBytes ?? 10_000_000;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async get<T>(path: string, params: Record<string, string | string[]> = {}): Promise<T> {
    const url = this.buildUrl(path, params);
    const response = await this.request(url);
    return this.readJson<T>(response);
  }

  async getAll<T>(path: string, params: Record<string, string | string[]> = {}): Promise<T[]> {
    const results: T[] = [];
    let url: URL | undefined = this.buildUrl(path, { per_page: "100", ...params });
    let pageCount = 0;

    while (url) {
      pageCount += 1;
      if (pageCount > this.maxPages) {
        throw new ApplicationError("SYNC_FAILED", "Canvas pagination exceeded the configured limit");
      }

      const response = await this.request(url);
      const page = await this.readJson<T[]>(response);
      if (!Array.isArray(page)) {
        throw new ApplicationError("SYNC_FAILED", "Canvas returned an invalid paginated response");
      }
      results.push(...page);
      url = nextPageUrl(response.headers.get("link"), this.apiRoot);
    }
    return results;
  }

  private buildUrl(path: string, params: Record<string, string | string[]>): URL {
    const url = new URL(path.replace(/^\//, ""), this.apiRoot);
    if (url.origin !== this.apiRoot.origin || !url.pathname.startsWith(this.apiRoot.pathname)) {
      throw new ApplicationError("VALIDATION_FAILED", "Canvas request path escaped the API root");
    }
    appendSearchParams(url, params);
    return url;
  }

  private async request(url: URL): Promise<Response> {
    for (let attempt = 0; attempt <= this.retryAttempts; attempt += 1) {
      let response: Response;
      try {
        response = await this.fetchImpl(url, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
          signal: AbortSignal.timeout(this.timeoutMs),
          cache: "no-store",
          redirect: "error",
        });
      } catch (error) {
        if (attempt < this.retryAttempts) {
          await delay(this.retryBaseDelayMs * 2 ** attempt);
          continue;
        }
        throw new ApplicationError("CANVAS_UNAVAILABLE", "Canvas request failed", error);
      }

      if (response.ok) return response;
      if (RETRYABLE_STATUS.has(response.status) && attempt < this.retryAttempts) {
        await delay(retryDelay(response, this.retryBaseDelayMs * 2 ** attempt));
        continue;
      }
      throw canvasResponseError(response.status);
    }

    throw new ApplicationError("CANVAS_UNAVAILABLE", "Canvas retry budget was exhausted");
  }

  private async readJson<T>(response: Response): Promise<T> {
    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > this.maxResponseBytes) {
      throw new ApplicationError("SYNC_FAILED", "Canvas response exceeded the configured size limit");
    }
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > this.maxResponseBytes) {
      throw new ApplicationError("SYNC_FAILED", "Canvas response exceeded the configured size limit");
    }
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw new ApplicationError("SYNC_FAILED", "Canvas returned invalid JSON", error);
    }
  }
}

function appendSearchParams(
  url: URL,
  params: Record<string, string | string[]>,
): void {
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, item);
    } else {
      url.searchParams.set(key, value);
    }
  }
}

export function nextPageUrl(linkHeader: string | null, apiRoot: URL): URL | undefined {
  if (!linkHeader) return undefined;
  const next = linkHeader
    .split(",")
    .map((part) => part.trim())
    .find((part) => /rel="?next"?/.test(part));
  const match = next?.match(/<([^>]+)>/);
  if (!match?.[1]) return undefined;

  const url = new URL(match[1], apiRoot);
  if (url.origin !== apiRoot.origin || !url.pathname.startsWith(apiRoot.pathname)) {
    throw new ApplicationError("SYNC_FAILED", "Canvas pagination attempted to leave the configured API origin");
  }
  return url;
}

function retryDelay(response: Response, fallback: number): number {
  const header = response.headers.get("retry-after");
  if (!header) return fallback;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.min(Math.max(seconds * 1_000, 0), 5_000);
  const date = Date.parse(header);
  return Number.isNaN(date) ? fallback : Math.min(Math.max(date - Date.now(), 0), 5_000);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
