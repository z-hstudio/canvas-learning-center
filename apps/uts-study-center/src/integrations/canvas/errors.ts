import { ApplicationError } from "@/lib/errors";

export function canvasResponseError(status: number): ApplicationError {
  if (status === 401) return new ApplicationError("AUTH_INVALID", "Canvas rejected the access token");
  if (status === 403) {
    return new ApplicationError("CANVAS_PERMISSION_DENIED", "Canvas denied access to the requested resource");
  }
  if (status === 429) return new ApplicationError("CANVAS_RATE_LIMITED", "Canvas rate limit reached");
  if (status >= 500) return new ApplicationError("CANVAS_UNAVAILABLE", "Canvas is unavailable");
  return new ApplicationError("SYNC_FAILED", `Canvas request failed with status ${status}`);
}
