import { describe, expect, it } from "vitest";
import {
  assertCanvasHostResolvesPublic,
  parseCanvasConfig,
} from "@/integrations/canvas/config";
import { ApplicationError } from "@/lib/errors";
import { canvasCourseSchema, parseCanvasPayload } from "@/integrations/canvas/schemas";

describe("Canvas configuration security", () => {
  it("accepts an explicitly allowed HTTPS Canvas host", () => {
    expect(parseCanvasConfig(
      { baseUrl: "https://canvas.example.edu/", accessToken: "token" },
      new Set(["canvas.example.edu"]),
    )).toEqual({ baseUrl: "https://canvas.example.edu", accessToken: "token" });
  });

  it("rejects credentials, IP literals, and hosts outside the allowlist", () => {
    const allowed = new Set(["canvas.uts.edu.au"]);
    expect(() => parseCanvasConfig(
      { baseUrl: "https://user@example.com", accessToken: "token" },
      allowed,
    )).toThrow();
    expect(() => parseCanvasConfig(
      { baseUrl: "https://127.0.0.1", accessToken: "token" },
      allowed,
    )).toThrow();
    expect(() => parseCanvasConfig(
      { baseUrl: "https://attacker.example", accessToken: "token" },
      allowed,
    )).toThrow();
  });

  it("rejects an allowed hostname when DNS resolves to a private address", async () => {
    await expect(assertCanvasHostResolvesPublic(
      "https://canvas.uts.edu.au",
      async () => ["10.0.0.8"],
    )).rejects.toMatchObject({ code: "VALIDATION_FAILED" } satisfies Partial<ApplicationError>);
  });

  it("converts malformed provider payloads into a typed sync failure", () => {
    expect(() => parseCanvasPayload(canvasCourseSchema, { id: "wrong", name: null }, "course"))
      .toThrowError(ApplicationError);
    try {
      parseCanvasPayload(canvasCourseSchema, { id: "wrong", name: null }, "course");
    } catch (error) {
      expect(error).toMatchObject({ code: "SYNC_FAILED" });
    }
  });
});
