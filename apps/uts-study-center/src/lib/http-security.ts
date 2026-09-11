import { ApplicationError } from "@/lib/errors";

export function assertTrustedMutation(request: Request, maxBytes: number): void {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (origin && new URL(origin).origin !== requestUrl.origin) {
    throw new ApplicationError("VALIDATION_FAILED", "Cross-origin mutation request rejected");
  }
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site" && fetchSite !== "none") {
    throw new ApplicationError("VALIDATION_FAILED", "Cross-site mutation request rejected");
  }
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new ApplicationError("VALIDATION_FAILED", "Request body is too large");
  }
}
